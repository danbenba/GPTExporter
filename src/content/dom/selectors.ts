export const selectors = {
  headerActions: '#conversation-header-actions',
  shareButton: '[data-testid="share-chat-button"]',
  copyTurnButton: '[data-testid="copy-turn-action-button"]',
  conversationTurn: '[data-testid^="conversation-turn"]',
  acrobatHeaderButton: '#acrobat-chatgpt-convert-to-pdf',
  acrobatTurnButton: '.acrobat-chatgpt-response-convert-btn',
  main: 'main',
} as const;
