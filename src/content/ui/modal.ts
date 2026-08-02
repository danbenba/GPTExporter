import { AuthError, RateLimitError } from '@/core/api/errors';
import { runExport, type ExportPhase } from '@/core/export/run-export';
import { EXPORT_FORMATS, type ExportFormat, type ExportOptions } from '@/core/model/export-options';
import { t } from '@/i18n';
import { isDarkTheme } from '@/content/dom/observe';
import { loadOptions, saveOptions } from '@/content/options-store';
import { checkIconSvg, closeIconSvg, formatIcons } from './icons';
import { shadowStyles } from './styles';

interface ToggleDefinition {
  key: keyof ExportOptions;
  label: string;
  hint: string;
}

const FORMAT_LABEL_KEYS = {
  markdown: 'formatMarkdown',
  html: 'formatHtml',
  json: 'formatJson',
  text: 'formatText',
  pdf: 'formatPdf',
} as const;

export class ExportModal {
  private host: HTMLElement | null = null;
  private root: HTMLElement | null = null;
  private options: ExportOptions | null = null;
  private conversationId = '';
  private busy = false;
  private keyHandler = (event: KeyboardEvent) => {
    if (event.key === 'Escape') this.close();
  };

  async open(conversationId: string): Promise<void> {
    if (this.host) this.destroy();
    this.conversationId = conversationId;
    this.options = await loadOptions();
    this.build();
    document.addEventListener('keydown', this.keyHandler, true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.root?.classList.add('open'));
    });
  }

  close(): void {
    if (!this.root || this.busy) {
      if (this.busy) return;
    }
    this.root?.classList.add('closing');
    this.root?.classList.remove('open');
    setTimeout(() => this.destroy(), 180);
  }

  private destroy(): void {
    document.removeEventListener('keydown', this.keyHandler, true);
    this.host?.remove();
    this.host = null;
    this.root = null;
  }

  private build(): void {
    const options = this.options!;
    this.host = document.createElement('div');
    this.host.id = 'gptx-modal-host';
    const shadow = this.host.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = shadowStyles;
    shadow.appendChild(style);

    this.root = document.createElement('div');
    this.root.className = 'gptx-root';
    this.root.dataset.theme = isDarkTheme() ? 'dark' : 'light';
    shadow.appendChild(this.root);

    const overlay = document.createElement('div');
    overlay.className = 'gptx-overlay';
    overlay.addEventListener('click', () => this.close());
    this.root.appendChild(overlay);

    const modal = document.createElement('div');
    modal.className = 'gptx-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    this.root.appendChild(modal);

    const header = document.createElement('div');
    header.className = 'gptx-header';
    const title = document.createElement('div');
    title.className = 'gptx-title';
    title.textContent = t('exportTitle');
    const close = document.createElement('button');
    close.className = 'gptx-close';
    close.setAttribute('aria-label', t('cancel'));
    close.innerHTML = closeIconSvg;
    close.addEventListener('click', () => this.close());
    header.append(title, close);
    modal.appendChild(header);

    const body = document.createElement('div');
    body.className = 'gptx-body';
    modal.appendChild(body);

    const formatLabel = document.createElement('div');
    formatLabel.className = 'gptx-section-label';
    formatLabel.textContent = t('format');
    body.appendChild(formatLabel);

    const formats = document.createElement('div');
    formats.className = 'gptx-formats';
    body.appendChild(formats);
    const formatButtons = new Map<ExportFormat, HTMLButtonElement>();
    for (const format of EXPORT_FORMATS) {
      const button = document.createElement('button');
      button.className = 'gptx-format';
      button.innerHTML = `${formatIcons[format.id]}<span>${t(FORMAT_LABEL_KEYS[format.id])}</span>`;
      button.addEventListener('click', () => {
        options.format = format.id;
        for (const [id, el] of formatButtons) {
          el.classList.toggle('selected', id === format.id);
        }
        this.refreshConditionalRows();
      });
      formatButtons.set(format.id, button);
      formats.appendChild(button);
    }
    formatButtons.get(options.format)?.classList.add('selected');

    const contentLabel = document.createElement('div');
    contentLabel.className = 'gptx-section-label';
    contentLabel.textContent = t('content');
    body.appendChild(contentLabel);

    const toggles: ToggleDefinition[] = [
      { key: 'includeUserMessages', label: t('includeUserMessages'), hint: t('includeUserMessagesHint') },
      { key: 'includeAssistantMessages', label: t('includeAssistantMessages'), hint: t('includeAssistantMessagesHint') },
      { key: 'includeThoughts', label: t('includeThoughts'), hint: t('includeThoughtsHint') },
      { key: 'includeToolBlocks', label: t('includeToolBlocks'), hint: t('includeToolBlocksHint') },
      { key: 'includeCitations', label: t('includeCitations'), hint: t('includeCitationsHint') },
      { key: 'includeTimestamps', label: t('includeTimestamps'), hint: t('includeTimestampsHint') },
      { key: 'includeMetadataHeader', label: t('includeMetadataHeader'), hint: t('includeMetadataHeaderHint') },
      { key: 'embedImages', label: t('embedImages'), hint: t('embedImagesHint') },
    ];
    for (const definition of toggles) {
      body.appendChild(this.buildToggleRow(definition));
    }

    const scopeLabel = document.createElement('div');
    scopeLabel.className = 'gptx-section-label';
    scopeLabel.textContent = t('messageCount');
    body.appendChild(scopeLabel);

    const scope = document.createElement('div');
    scope.className = 'gptx-scope';
    body.appendChild(scope);

    const allChip = document.createElement('button');
    allChip.className = 'gptx-chip';
    allChip.textContent = t('allMessages');
    const lastChip = document.createElement('button');
    lastChip.className = 'gptx-chip';
    lastChip.textContent = t('lastN');
    const count = document.createElement('input');
    count.className = 'gptx-count';
    count.type = 'number';
    count.min = '1';
    count.max = '999';
    count.value = String(options.messageLimit ?? 10);
    count.setAttribute('aria-label', t('lastNMessages'));

    const syncScope = () => {
      const limited = options.messageLimit !== null;
      allChip.classList.toggle('selected', !limited);
      lastChip.classList.toggle('selected', limited);
      count.classList.toggle('visible', limited);
    };
    allChip.addEventListener('click', () => {
      options.messageLimit = null;
      syncScope();
    });
    lastChip.addEventListener('click', () => {
      options.messageLimit = Math.max(1, Number(count.value) || 10);
      syncScope();
      count.focus();
    });
    count.addEventListener('input', () => {
      const value = Math.max(1, Math.min(999, Number(count.value) || 1));
      options.messageLimit = value;
    });
    scope.append(allChip, lastChip, count);
    syncScope();

    const footer = document.createElement('div');
    footer.className = 'gptx-footer';
    modal.appendChild(footer);

    const status = document.createElement('div');
    status.className = 'gptx-status';
    footer.appendChild(status);

    const cancel = document.createElement('button');
    cancel.className = 'gptx-btn gptx-btn-secondary';
    cancel.textContent = t('cancel');
    cancel.addEventListener('click', () => this.close());

    const submit = document.createElement('button');
    submit.className = 'gptx-btn gptx-btn-primary';
    submit.textContent = t('export');
    submit.addEventListener('click', () => this.submit(status, submit, cancel));

    footer.append(cancel, submit);

    document.body.appendChild(this.host);
    this.refreshConditionalRows();
  }

  private conditionalRows = new Map<string, HTMLElement>();

  private buildToggleRow(definition: ToggleDefinition): HTMLElement {
    const options = this.options!;
    const row = document.createElement('div');
    row.className = 'gptx-row';

    const text = document.createElement('div');
    text.className = 'gptx-row-text';
    const label = document.createElement('div');
    label.className = 'gptx-row-label';
    label.textContent = definition.label;
    const hint = document.createElement('div');
    hint.className = 'gptx-row-hint';
    hint.textContent = definition.hint;
    text.append(label, hint);

    const toggle = document.createElement('button');
    toggle.className = 'gptx-switch';
    toggle.setAttribute('role', 'switch');
    toggle.setAttribute('aria-checked', String(Boolean(options[definition.key])));
    const knob = document.createElement('span');
    knob.className = 'knob';
    toggle.appendChild(knob);
    toggle.addEventListener('click', () => {
      const next = !(options[definition.key] as boolean);
      (options[definition.key] as boolean) = next;
      toggle.setAttribute('aria-checked', String(next));
    });

    row.append(text, toggle);
    if (definition.key === 'embedImages') {
      this.conditionalRows.set('embedImages', row);
    }
    return row;
  }

  private refreshConditionalRows(): void {
    const options = this.options!;
    const embedRow = this.conditionalRows.get('embedImages');
    if (embedRow) {
      const relevant = options.format === 'html' || options.format === 'pdf';
      embedRow.style.display = relevant ? '' : 'none';
    }
  }

  private phaseLabel(phase: ExportPhase): string {
    switch (phase) {
      case 'fetching':
        return t('preparing');
      case 'assets':
        return t('resolvingAssets');
      default:
        return t('rendering');
    }
  }

  private async submit(
    status: HTMLElement,
    submit: HTMLButtonElement,
    cancel: HTMLButtonElement,
  ): Promise<void> {
    if (this.busy || !this.options) return;
    this.busy = true;
    submit.disabled = true;
    cancel.disabled = true;
    submit.innerHTML = `<span class="gptx-spinner"></span><span>${t('exporting')}</span>`;
    status.className = 'gptx-status visible';
    status.innerHTML = `<span>${this.phaseLabel('fetching')}</span>`;

    void saveOptions(this.options);

    try {
      await runExport(this.conversationId, this.options, (phase) => {
        status.innerHTML = `<span>${this.phaseLabel(phase)}</span>`;
      });
      status.className = 'gptx-status visible success';
      status.innerHTML = `<span class="gptx-check">${checkIconSvg}</span><span>${t('done')}</span>`;
      submit.textContent = t('export');
      this.busy = false;
      setTimeout(() => this.close(), 1200);
    } catch (error) {
      this.busy = false;
      submit.disabled = false;
      cancel.disabled = false;
      submit.textContent = t('export');
      status.className = 'gptx-status visible error';
      if (error instanceof AuthError) {
        status.textContent = t('notAuthenticated');
      } else if (error instanceof RateLimitError) {
        status.textContent = t('rateLimited');
      } else {
        status.textContent = `${t('exportFailed')} — ${(error as Error).message ?? ''}`;
      }
    }
  }
}

export const exportModal = new ExportModal();
