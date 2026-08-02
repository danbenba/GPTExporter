import type { ClaudeToolUseBlock } from './model';

export const ARTIFACT_TOOLS = new Set(['artifacts', 'create_file', 'str_replace']);

export interface ArtifactState {
  id: string;
  title?: string;
  type?: string;
  language?: string;
  text: string;
}

function readString(input: Record<string, unknown>, key: string): string | undefined {
  const value = input[key];
  return typeof value === 'string' ? value : undefined;
}

export function applyArtifactCommand(
  block: ClaudeToolUseBlock,
  previous: ArtifactState | undefined,
): ArtifactState | null {
  const input = block.input ?? {};
  const id = readString(input, 'id') ?? readString(input, 'path');
  if (!id) return null;

  const command = readString(input, 'command');
  const content = readString(input, 'content') ?? readString(input, 'file_text');
  const oldStr = readString(input, 'old_str');
  const newStr = readString(input, 'new_str') ?? '';

  let text: string;
  if (command === 'create' || command === 'rewrite') {
    text = content ?? '';
  } else if (command === 'update' || (oldStr !== undefined && command === undefined)) {
    const base = previous?.text;
    if (base === undefined) {
      text = newStr;
    } else if (oldStr === undefined) {
      text = base;
    } else if (base.includes(oldStr)) {
      text = base.replace(oldStr, newStr);
    } else {
      text = base.replace(oldStr.trim(), newStr);
    }
  } else {
    text = content ?? previous?.text ?? '';
  }

  return {
    id,
    title: readString(input, 'title') ?? previous?.title,
    type: readString(input, 'type') ?? previous?.type,
    language: readString(input, 'language') ?? previous?.language,
    text,
  };
}

export function isCodeArtifact(state: ArtifactState): boolean {
  if (state.language) return true;
  if (!state.type) return false;
  return state.type.includes('code') || state.type.includes('react');
}

export function stripLegacyArtifactTags(text: string): string {
  return text.replace(/<antArtifact[^>]*>[\s\S]*?<\/antArtifact>/g, '').trim();
}

export function extractLegacyArtifacts(text: string): ArtifactState[] {
  const results: ArtifactState[] = [];
  const pattern = /<antArtifact([^>]*)>([\s\S]*?)<\/antArtifact>/g;
  for (let match = pattern.exec(text); match; match = pattern.exec(text)) {
    const attributes = match[1];
    const attribute = (name: string) =>
      attributes.match(new RegExp(`${name}="([^"]*)"`))?.[1];
    results.push({
      id: attribute('identifier') ?? `legacy-${results.length}`,
      title: attribute('title'),
      type: attribute('type'),
      language: attribute('language'),
      text: match[2].trim(),
    });
  }
  return results;
}
