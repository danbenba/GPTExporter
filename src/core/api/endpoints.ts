export const API_BASE = '/backend-api';

export const endpoints = {
  session: () => '/api/auth/session',
  conversation: (id: string) => `${API_BASE}/conversation/${encodeURIComponent(id)}`,
  conversations: (offset: number, limit: number) =>
    `${API_BASE}/conversations?offset=${offset}&limit=${limit}`,
  fileDownload: (fileId: string) => `${API_BASE}/files/${encodeURIComponent(fileId)}/download`,
  fileDownloadLegacy: (fileId: string) =>
    `${API_BASE}/files/download/${encodeURIComponent(fileId)}`,
  accountsCheck: () => `${API_BASE}/accounts/check/v4-2023-04-27`,
};
