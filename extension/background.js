// QuickNotes — background service worker
// Bridges keyboard commands → popup actions.
chrome.commands.onCommand.addListener(async (command) => {
  const map = {
    'take-note': 'note',
    'save-link': 'link',
    'clip-selection': 'clip',
    'screenshot': 'screenshot',
  };
  const action = map[command];
  if (!action) return;
  await chrome.storage.local.set({ pending_action: action });
  try { await chrome.action.openPopup(); } catch (_) { /* popup must be opened by user gesture in some cases */ }
});
