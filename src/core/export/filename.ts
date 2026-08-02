export function sanitizeFilename(title: string): string {
  const cleaned = title
    .replace(/[\\/:*?"<>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
  return cleaned || 'chatgpt-conversation';
}

export function buildFilename(title: string, extension: string, date = new Date()): string {
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
  return `${sanitizeFilename(title)} (${stamp}).${extension}`;
}
