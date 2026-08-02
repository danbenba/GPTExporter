import { ApiError, AuthError } from '@/core/api/errors';

export interface WizTokens {
  at: string;
  bl: string;
  sid: string;
  hl: string;
}

function readToken(html: string, key: string): string | undefined {
  return html.match(new RegExp(`"${key}":\\s*"(.*?)"`))?.[1];
}

export function readWizTokens(): WizTokens {
  const html = document.documentElement.innerHTML;
  const at = readToken(html, 'SNlM0e');
  const bl = readToken(html, 'cfb2h');
  const sid = readToken(html, 'FdrFJe');
  const hl = readToken(html, 'TuX5cc') ?? 'en';
  if (!at || !bl || !sid) {
    throw new AuthError('Gemini session tokens unavailable, reload the page');
  }
  return { at, bl, sid, hl };
}

export function accountPath(pathname = location.pathname): string {
  return pathname.match(/^(\/u\/\d+)/)?.[1] ?? '';
}

export function parseFrames(raw: string): unknown[] {
  const body = raw.replace(/^\)\]\}'\s*/, '');
  const frames: unknown[] = [];
  let position = 0;

  while (position < body.length) {
    const newline = body.indexOf('\n', position);
    if (newline === -1) break;
    const length = Number.parseInt(body.slice(position, newline).trim(), 10);
    if (!Number.isFinite(length)) break;

    const chunk = body.slice(newline + 1, newline + 1 + length);
    let parsed: unknown = null;
    for (let trim = 0; trim <= 4 && parsed === null; trim += 1) {
      try {
        parsed = JSON.parse(chunk.slice(0, chunk.length - trim));
      } catch {
        parsed = null;
      }
    }
    if (parsed !== null) frames.push(parsed);
    position = newline + 1 + length;
  }
  return frames;
}

function findEnvelope(frames: unknown[], rpcId: string): unknown[] | null {
  for (const frame of frames) {
    if (!Array.isArray(frame)) continue;
    for (const entry of frame) {
      if (Array.isArray(entry) && entry[0] === 'wrb.fr' && entry[1] === rpcId) {
        return entry;
      }
    }
  }
  return null;
}

export async function callRpc<T = unknown>(
  rpcId: string,
  payload: unknown,
  sourcePath = location.pathname,
): Promise<T> {
  const tokens = readWizTokens();
  const prefix = accountPath();
  const reqId = 10_000 + Math.floor(Math.random() * 89_999);

  const params = new URLSearchParams({
    rpcids: rpcId,
    'source-path': sourcePath,
    hl: tokens.hl,
    rt: 'c',
    _reqid: String(reqId),
    bl: tokens.bl,
    'f.sid': tokens.sid,
  });

  const form = new URLSearchParams({
    at: tokens.at,
    'f.req': JSON.stringify([[[rpcId, JSON.stringify(payload), null, 'generic']]]),
  });

  const response = await fetch(`${prefix}/_/BardChatUi/data/batchexecute?${params.toString()}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'x-same-domain': '1',
    },
    body: form,
  });

  if (response.status === 401 || response.status === 403) {
    throw new AuthError(`Gemini rejected the request with ${response.status}`);
  }
  if (!response.ok) {
    throw new ApiError(response.status, `Gemini RPC ${rpcId} failed with ${response.status}`);
  }

  const envelope = findEnvelope(parseFrames(await response.text()), rpcId);
  if (!envelope) {
    throw new ApiError(502, `Gemini RPC ${rpcId} returned no payload`);
  }

  const rejectCode = Array.isArray(envelope[5]) ? envelope[5][0] : undefined;
  if (rejectCode === 7) throw new AuthError('Gemini denied access to this conversation');
  if (rejectCode === 5) throw new ApiError(404, 'Gemini conversation not found');

  const payloadText = envelope[2];
  if (typeof payloadText !== 'string' || payloadText.length === 0) {
    throw new ApiError(502, `Gemini RPC ${rpcId} returned an empty body`);
  }
  return JSON.parse(payloadText) as T;
}
