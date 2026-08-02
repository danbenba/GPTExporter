import type {
  NormalizedBlock,
  NormalizedCitation,
  NormalizedConversation,
  NormalizedMessage,
} from '@/core/model/normalized';
import type { PerplexityEntry, PerplexityThread, PerplexityWebResult } from './api';

const CITATION_TOKEN = /\[(\d{1,3})(?:,\s*\{ts:\d+\})?\]/g;
const PPLX_LINK = /\[([^\]]*)\]\(pplx:\/\/[^)]*\)/g;

function unwrap(result: PerplexityWebResult): PerplexityWebResult {
  return result.web_result ?? result;
}

function citationMap(entry: PerplexityEntry): Map<number, PerplexityWebResult> {
  const map = new Map<number, PerplexityWebResult>();
  const blocks = entry.blocks ?? [];

  const sources = blocks.find((block) => block.intended_usage === 'sources_answer_mode')
    ?.sources_mode_block;

  if (sources?.rows?.length) {
    sources.rows.forEach((row, index) => {
      const result = row.web_result ? unwrap(row.web_result) : undefined;
      if (result) map.set(typeof row.citation === 'number' ? row.citation : index + 1, result);
    });
    if (map.size > 0) return map;
  }

  const fallback =
    sources?.web_results ??
    blocks
      .filter((block) => block.intended_usage === 'web_results' && block.web_result_block)
      .flatMap((block) => block.web_result_block?.web_results ?? []);

  fallback.map(unwrap).forEach((result, index) => map.set(index + 1, result));
  return map;
}

function answerText(entry: PerplexityEntry): string {
  const blocks = entry.blocks ?? [];
  const parts = blocks
    .filter((block) => block.intended_usage === 'ask_text' && block.markdown_block)
    .map((block) => block.markdown_block?.answer ?? '')
    .filter(Boolean);
  if (parts.length > 0) return parts.join('\n\n');

  if (typeof entry.text === 'string' && entry.text.trim()) {
    try {
      let decoded: unknown = JSON.parse(entry.text);
      if (typeof decoded === 'string') decoded = JSON.parse(decoded);
      const steps = Array.isArray(decoded) ? decoded : [decoded];
      const final =
        steps.find((step) => (step as { step_type?: string })?.step_type === 'FINAL') ??
        steps[steps.length - 1];
      let content: unknown = (final as { content?: unknown })?.content ?? final;
      if (typeof content === 'string') content = JSON.parse(content);
      const answer = (content as { answer?: unknown })?.answer;
      if (typeof answer === 'string') return answer;
    } catch {
      return '';
    }
  }
  return '';
}

function reasoningBlocks(entry: PerplexityEntry): NormalizedBlock[] {
  const blocks = entry.blocks ?? [];
  const out: NormalizedBlock[] = [];

  const goals = blocks
    .filter((block) => block.intended_usage === 'plan')
    .map((block) => block.plan_block)
    .filter(Boolean)
    .at(-1)?.goals;
  if (goals?.length) {
    const text = goals
      .map((goal) => goal.description)
      .filter(Boolean)
      .map((description) => `- ${description}`)
      .join('\n');
    if (text) out.push({ kind: 'thought', text });
  }

  const plans = blocks
    .filter((block) => block.intended_usage === 'pro_search_steps' && block.plan_block)
    .map((block) => block.plan_block!);
  const firstSeen = new Map<string, number>();
  plans.forEach((plan, index) => {
    const key = plan.steps?.[0]?.uuid ?? '';
    if (!firstSeen.has(key)) firstSeen.set(key, index);
  });
  const steps = plans
    .filter((plan, index) => firstSeen.get(plan.steps?.[0]?.uuid ?? '') === index)
    .flatMap((plan) => plan.steps ?? [])
    .filter((step) => step.step_type);

  if (steps.length > 0) {
    const text = steps.map((step) => `- ${String(step.step_type).replace(/_/g, ' ').toLowerCase()}`).join('\n');
    out.push({ kind: 'thought', text });
  }
  return out;
}

function mediaBlocks(entry: PerplexityEntry): NormalizedBlock[] {
  const blocks = entry.blocks ?? [];
  const items = [
    ...(blocks.find((block) => block.intended_usage === 'media_items')?.media_block?.media_items ?? []),
    ...(blocks.find((block) => block.intended_usage === 'image_answer_mode')?.image_mode_block
      ?.media_items ?? []),
  ];
  return items
    .filter((item) => !item.sponsored_uuid)
    .map((item) => {
      const url = (item.image ?? item.thumbnail ?? item.url) as string | undefined;
      return url ? ({ kind: 'image', text: '', assetPointer: url } as NormalizedBlock) : null;
    })
    .filter((block): block is NormalizedBlock => block !== null);
}

function entryToMessages(entry: PerplexityEntry, index: number): NormalizedMessage[] {
  const messages: NormalizedMessage[] = [];
  const id = entry.backend_uuid ?? `entry-${index}`;
  const createTime = entry.updated_datetime ? Date.parse(entry.updated_datetime) / 1000 : undefined;

  const prompt = (entry.query_str ?? '').trim();
  if (prompt) {
    messages.push({
      id: `${id}-user`,
      role: 'user',
      createTime,
      blocks: [{ kind: 'paragraph', text: prompt }],
      citations: [],
    });
  }

  const sources = citationMap(entry);
  let answer = answerText(entry).replace(PPLX_LINK, '$1');
  answer = answer.replace(CITATION_TOKEN, (token, number: string) => {
    const source = sources.get(Number.parseInt(number, 10));
    const url = source?.url;
    return url && /^https?:/.test(url) ? `[${number}](${url})` : token;
  });

  const blocks: NormalizedBlock[] = [...reasoningBlocks(entry)];
  if (answer.trim()) blocks.push({ kind: 'paragraph', text: answer.trim() });
  blocks.push(...mediaBlocks(entry));

  if (blocks.length > 0) {
    const citations: NormalizedCitation[] = [...sources.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([, source]) => ({ url: source.url, title: source.name }))
      .filter((citation) => Boolean(citation.url));

    messages.push({
      id: `${id}-assistant`,
      role: 'assistant',
      model: entry.display_model,
      createTime,
      blocks,
      citations,
    });
  }

  return messages;
}

export function normalizePerplexityThread(
  thread: PerplexityThread,
  idOrSlug: string,
  url: string,
): NormalizedConversation {
  const messages = thread.entries.flatMap(entryToMessages);
  const first = thread.entries[0];
  const model = [...thread.entries].reverse().find((entry) => entry.display_model)?.display_model;

  return {
    id: first?.context_uuid ?? idOrSlug,
    title: thread.title || first?.thread_title || first?.query_str || 'Perplexity thread',
    url,
    source: 'perplexity',
    createTime: messages[0]?.createTime,
    updateTime: messages[messages.length - 1]?.createTime,
    model,
    messages,
  };
}
