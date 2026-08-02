import { AuthError, RateLimitError } from '@/core/api/errors';
import { runExport, type ExportPhase } from '@/core/export/run-export';
import { EXPORT_FORMATS, type ExportFormat, type ExportOptions } from '@/core/model/export-options';
import { t } from '@/i18n';
import type { Provider } from '@/core/providers/types';
import type { TurnLocation } from '@/content/dom/turn-index';
import { loadOptions, saveOptions } from '@/content/options-store';
import {
  checkIconSvg,
  chevronIconSvg,
  closeIconSvg,
  copyIconSvg,
  downloadIconSvg,
  formatIcons,
  spinnerSvg,
} from './icons';
import { shadowStyles } from './styles';
import { themeVars } from './theme-vars';
import { showToast } from './toast';

interface ToggleDefinition {
  key: keyof ExportOptions;
  label: string;
  hint: string;
}

export interface ModalRequest {
  provider: Provider;
  conversationId: string;
  turn?: TurnLocation;
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
  private request: ModalRequest | null = null;
  private toClipboard = false;
  private includeUserTurn = false;
  private busy = false;
  private conditionalRows = new Map<string, HTMLElement>();
  private closeMenus: Array<() => void> = [];
  private keyHandler = (event: KeyboardEvent) => {
    if (event.key === 'Escape') this.close();
  };

  async open(request: ModalRequest): Promise<void> {
    if (this.host) this.destroy();
    this.request = request;
    this.toClipboard = false;
    this.includeUserTurn = false;
    this.previewThread = null;
    this.previewUserRow = null;
    this.conditionalRows.clear();
    this.closeMenus = [];
    this.options = await loadOptions();
    this.build();
    document.addEventListener('keydown', this.keyHandler, true);
    setTimeout(() => this.root?.classList.add('open'), 20);
  }

  close(): void {
    if (this.busy) return;
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

  private get isMessageMode(): boolean {
    return Boolean(this.request?.turn);
  }

  private build(): void {
    const options = this.options!;
    this.host = document.createElement('div');
    this.host.id = 'gptx-modal-host';
    const shadow = this.host.attachShadow({ mode: 'open' });

    const provider = this.request!.provider;
    const style = document.createElement('style');
    style.textContent = themeVars(provider.theme) + shadowStyles;
    shadow.appendChild(style);

    this.root = document.createElement('div');
    this.root.className = 'gptx-root';
    this.root.dataset.theme = provider.isDarkTheme() ? 'dark' : 'light';
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
    title.textContent = this.isMessageMode ? t('exportMessageTitle') : t('exportTitle');
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

    if (this.isMessageMode) {
      body.appendChild(this.buildPreview());
    }

    body.appendChild(this.sectionLabel(t('format')));
    body.appendChild(this.buildFormatSelect());

    if (this.isMessageMode) {
      body.appendChild(this.buildActionChoice());
    }

    body.appendChild(this.sectionLabel(t('content')));
    for (const definition of this.basicToggles()) {
      body.appendChild(this.buildToggleRow(definition));
    }

    const disclosure = document.createElement('button');
    disclosure.className = 'gptx-disclosure';
    disclosure.setAttribute('aria-expanded', 'false');
    disclosure.innerHTML = `<span class="chev">${chevronIconSvg}</span><span>${t('advancedOptions')}</span>`;
    body.appendChild(disclosure);

    const advanced = document.createElement('div');
    advanced.className = 'gptx-adv';
    body.appendChild(advanced);
    for (const definition of this.advancedToggles()) {
      advanced.appendChild(this.buildToggleRow(definition));
    }
    if (!this.isMessageMode) {
      advanced.appendChild(this.sectionLabel(t('messageCount')));
      advanced.appendChild(this.buildScope());
    }
    disclosure.addEventListener('click', () => {
      const open = disclosure.getAttribute('aria-expanded') === 'true';
      disclosure.setAttribute('aria-expanded', String(!open));
      advanced.classList.toggle('open', !open);
    });

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

    void options;
    document.body.appendChild(this.host);
    this.refreshConditionalRows();
  }

  private sectionLabel(text: string): HTMLElement {
    const label = document.createElement('div');
    label.className = 'gptx-section-label';
    label.textContent = text;
    return label;
  }

  private basicToggles(): ToggleDefinition[] {
    if (this.isMessageMode) {
      return [
        { key: 'includeCitations', label: t('includeCitations'), hint: t('includeCitationsHint') },
        { key: 'includeMetadataHeader', label: t('includeMetadataHeader'), hint: t('includeMetadataHeaderHint') },
      ];
    }
    return [
      { key: 'includeCitations', label: t('includeCitations'), hint: t('includeCitationsHint') },
      { key: 'includeTimestamps', label: t('includeTimestamps'), hint: t('includeTimestampsHint') },
    ];
  }

  private advancedToggles(): ToggleDefinition[] {
    const shared: ToggleDefinition[] = [
      { key: 'includeThoughts', label: t('includeThoughts'), hint: t('includeThoughtsHint') },
      { key: 'includeToolBlocks', label: t('includeToolBlocks'), hint: t('includeToolBlocksHint') },
      { key: 'embedImages', label: t('embedImages'), hint: t('embedImagesHint') },
    ];
    if (this.isMessageMode) {
      return [
        { key: 'includeTimestamps', label: t('includeTimestamps'), hint: t('includeTimestampsHint') },
        ...shared,
      ];
    }
    return [
      { key: 'includeUserMessages', label: t('includeUserMessages'), hint: t('includeUserMessagesHint') },
      { key: 'includeAssistantMessages', label: t('includeAssistantMessages'), hint: t('includeAssistantMessagesHint') },
      ...shared,
      { key: 'includeMetadataHeader', label: t('includeMetadataHeader'), hint: t('includeMetadataHeaderHint') },
    ];
  }

  private previewThread: HTMLElement | null = null;
  private previewUserRow: HTMLElement | null = null;

  private refreshPreviewFade(): void {
    const thread = this.previewThread;
    if (!thread) return;
    setTimeout(() => {
      thread.classList.toggle('short', thread.scrollHeight <= thread.clientHeight + 1);
    }, 0);
  }

  private syncPreviewSelection(): void {
    const turn = this.request?.turn;
    if (!this.previewUserRow || !turn) return;
    const showUser = turn.role === 'user' || this.includeUserTurn;
    this.previewUserRow.style.display = showUser ? '' : 'none';
    this.previewUserRow.classList.toggle('muted', !showUser);
    this.refreshPreviewFade();
  }

  private buildPreview(): HTMLElement {
    const turn = this.request!.turn!;
    const card = document.createElement('div');
    card.className = 'gptx-preview';

    const thread = document.createElement('div');
    thread.className = 'gptx-preview-thread';
    this.previewThread = thread;

    if (turn.userPreview) {
      const user = document.createElement('div');
      user.className = 'gptx-preview-user';
      const bubble = document.createElement('div');
      bubble.className = 'gptx-preview-bubble';
      bubble.textContent = turn.userPreview;
      user.appendChild(bubble);
      thread.appendChild(user);
      this.previewUserRow = user;
    }

    if (turn.assistantPreview) {
      const assistant = document.createElement('div');
      assistant.className = 'gptx-preview-assistant';
      assistant.textContent = turn.assistantPreview;
      thread.appendChild(assistant);
    }

    card.appendChild(thread);
    this.syncPreviewSelection();
    return card;
  }

  private buildActionChoice(): HTMLElement {
    const turn = this.request!.turn!;
    const row = document.createElement('div');
    row.className = 'gptx-actions';

    const hasPrompt =
      turn.userMessageId !== null ||
      (turn.userMessageIndex !== null && turn.userMessageIndex >= 0);
    if (turn.role === 'assistant' && hasPrompt) {
      const withUser = document.createElement('button');
      withUser.className = 'gptx-chip';
      withUser.textContent = t('withUserMessage');
      withUser.setAttribute('aria-pressed', 'false');
      withUser.addEventListener('click', () => {
        this.includeUserTurn = !this.includeUserTurn;
        withUser.classList.toggle('selected', this.includeUserTurn);
        withUser.setAttribute('aria-pressed', String(this.includeUserTurn));
        this.syncPreviewSelection();
      });
      row.appendChild(withUser);
    }

    const group = document.createElement('div');
    group.className = 'gptx-segment';

    const download = document.createElement('button');
    download.className = 'gptx-segment-item selected';
    download.innerHTML = `${downloadIconSvg}<span>${t('downloadFile')}</span>`;

    const copy = document.createElement('button');
    copy.className = 'gptx-segment-item';
    copy.innerHTML = `${copyIconSvg}<span>${t('copyToClipboard')}</span>`;

    const select = (clipboard: boolean) => {
      this.toClipboard = clipboard;
      download.classList.toggle('selected', !clipboard);
      copy.classList.toggle('selected', clipboard);
    };
    download.addEventListener('click', () => select(false));
    copy.addEventListener('click', () => select(true));

    group.append(download, copy);
    row.appendChild(group);
    return row;
  }

  private buildScope(): HTMLElement {
    const options = this.options!;
    const scope = document.createElement('div');
    scope.className = 'gptx-scope';

    const allChip = document.createElement('button');
    allChip.className = 'gptx-chip';
    allChip.textContent = t('allMessages');

    const lastChip = document.createElement('button');
    lastChip.className = 'gptx-chip';
    lastChip.textContent = t('lastN');

    const stepper = document.createElement('div');
    stepper.className = 'gptx-stepper';
    const minus = document.createElement('button');
    minus.className = 'gptx-step';
    minus.textContent = '−';
    const count = document.createElement('input');
    count.className = 'gptx-count';
    count.type = 'text';
    count.inputMode = 'numeric';
    count.value = String(options.messageLimit ?? 10);
    count.setAttribute('aria-label', t('lastNMessages'));
    const plus = document.createElement('button');
    plus.className = 'gptx-step';
    plus.textContent = '+';
    stepper.append(minus, count, plus);

    const clamp = (value: number) => Math.max(1, Math.min(999, value));
    const syncScope = () => {
      const limited = options.messageLimit !== null;
      allChip.classList.toggle('selected', !limited);
      lastChip.classList.toggle('selected', limited);
      stepper.classList.toggle('visible', limited);
    };
    const setLimit = (value: number) => {
      options.messageLimit = clamp(value);
      count.value = String(options.messageLimit);
      syncScope();
    };

    allChip.addEventListener('click', () => {
      options.messageLimit = null;
      syncScope();
    });
    lastChip.addEventListener('click', () => setLimit(Number(count.value) || 10));
    minus.addEventListener('click', () => setLimit((Number(count.value) || 1) - 1));
    plus.addEventListener('click', () => setLimit((Number(count.value) || 0) + 1));
    count.addEventListener('input', () => {
      count.value = count.value.replace(/\D/g, '').slice(0, 3);
      if (count.value) options.messageLimit = clamp(Number(count.value));
    });
    count.addEventListener('blur', () => setLimit(Number(count.value) || 10));

    scope.append(allChip, lastChip, stepper);
    syncScope();
    return scope;
  }

  private buildFormatSelect(): HTMLElement {
    const options = this.options!;
    const wrap = document.createElement('div');
    wrap.className = 'gptx-select-wrap';

    const trigger = document.createElement('button');
    trigger.className = 'gptx-select';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');

    const menu = document.createElement('div');
    menu.className = 'gptx-menu';
    menu.setAttribute('role', 'listbox');

    const labelFor = (format: ExportFormat) => t(FORMAT_LABEL_KEYS[format]);
    const syncTrigger = () => {
      trigger.innerHTML = `<span class="fmt-icon">${formatIcons[options.format]}</span><span>${labelFor(options.format)}</span><span class="chev">${chevronIconSvg}</span>`;
    };

    const closeMenu = () => {
      trigger.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
    };
    this.closeMenus.push(closeMenu);

    const items = new Map<ExportFormat, HTMLButtonElement>();
    for (const format of EXPORT_FORMATS) {
      const item = document.createElement('button');
      item.className = 'gptx-menu-item';
      item.setAttribute('role', 'option');
      item.innerHTML = `<span class="fmt-icon">${formatIcons[format.id]}</span><span>${labelFor(format.id)}</span><span class="tick">${checkIconSvg}</span>`;
      item.addEventListener('click', () => {
        options.format = format.id;
        for (const [id, el] of items) el.classList.toggle('selected', id === format.id);
        syncTrigger();
        closeMenu();
        this.refreshConditionalRows();
      });
      items.set(format.id, item);
      menu.appendChild(item);
    }
    items.get(options.format)?.classList.add('selected');

    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      const open = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('open', !open);
    });
    this.root?.addEventListener('click', () => closeMenu());

    syncTrigger();
    wrap.append(trigger, menu);
    return wrap;
  }

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
    if (this.busy || !this.options || !this.request) return;
    this.busy = true;
    submit.disabled = true;
    cancel.disabled = true;
    const submitWidth = submit.getBoundingClientRect().width;
    submit.style.minWidth = `${Math.ceil(submitWidth)}px`;
    submit.innerHTML = spinnerSvg;
    status.className = 'gptx-status visible';
    status.textContent = this.phaseLabel('fetching');

    void saveOptions(this.options);

    try {
      await runExport({
        provider: this.request.provider,
        conversationId: this.request.conversationId,
        options: this.options,
        messageId: this.request.turn?.messageId ?? undefined,
        extraMessageId: this.includeUserTurn ? this.request.turn?.userMessageId : undefined,
        messageIndex: this.request.turn?.messageIndex ?? undefined,
        extraMessageIndex: this.includeUserTurn
          ? this.request.turn?.userMessageIndex
          : undefined,
        toClipboard: this.toClipboard,
        onPhase: (phase) => {
          status.textContent = this.phaseLabel(phase);
        },
      });
      status.className = 'gptx-status visible success';
      status.innerHTML = `<span class="gptx-check">${checkIconSvg}</span><span>${this.toClipboard ? t('copiedToClipboard') : t('done')}</span>`;
      submit.textContent = t('export');
      this.busy = false;
      const toastMessage = this.toClipboard ? t('copiedToClipboard') : t('done');
      const provider = this.request.provider;
      setTimeout(() => {
        this.close();
        showToast(provider, toastMessage);
      }, 700);
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
