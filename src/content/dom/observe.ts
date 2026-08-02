export function observeDom(callback: () => void): MutationObserver {
  const observer = new MutationObserver(() => callback());
  observer.observe(document.body, { childList: true, subtree: true });
  return observer;
}

export function isDarkTheme(): boolean {
  return document.documentElement.classList.contains('dark');
}
