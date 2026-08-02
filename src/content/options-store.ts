import { DEFAULT_EXPORT_OPTIONS, type ExportOptions } from '@/core/model/export-options';
import { STORAGE_KEYS } from '@/shared/constants';

export async function loadOptions(): Promise<ExportOptions> {
  try {
    const stored = await chrome.storage.local.get(STORAGE_KEYS.exportOptions);
    const value = stored[STORAGE_KEYS.exportOptions] as Partial<ExportOptions> | undefined;
    return { ...DEFAULT_EXPORT_OPTIONS, ...value };
  } catch {
    return { ...DEFAULT_EXPORT_OPTIONS };
  }
}

export async function saveOptions(options: ExportOptions): Promise<void> {
  try {
    await chrome.storage.local.set({ [STORAGE_KEYS.exportOptions]: options });
  } catch {
    return;
  }
}
