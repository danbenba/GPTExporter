import { logger } from '@/shared/logger';
import { apiGet } from './client';
import { endpoints } from './endpoints';

interface FileDownloadResponse {
  status?: string;
  download_url?: string;
}

export function extractFileId(assetPointer: string): string | null {
  const match = assetPointer.match(/(file-[A-Za-z0-9]+)/);
  return match ? match[1] : null;
}

export async function resolveFileUrl(assetPointer: string): Promise<string | null> {
  const fileId = extractFileId(assetPointer);
  if (!fileId) return null;
  try {
    const data = await apiGet<FileDownloadResponse>(endpoints.fileDownload(fileId));
    if (data.download_url) return data.download_url;
  } catch (error) {
    logger.warn('primary file endpoint failed, trying legacy', error);
  }
  try {
    const data = await apiGet<FileDownloadResponse>(endpoints.fileDownloadLegacy(fileId));
    return data.download_url ?? null;
  } catch (error) {
    logger.warn('unable to resolve file asset', fileId, error);
    return null;
  }
}

export async function fetchAsDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}
