chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.info('[GPT Exporter] installed');
  }
});
