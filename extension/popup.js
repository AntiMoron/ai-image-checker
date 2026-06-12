document.getElementById('rescan').addEventListener('click', async () => {
  const status = document.getElementById('status');
  status.textContent = 'Reloading page scanner...';
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    status.textContent = 'No active tab found.';
    return;
  }
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['lib/page-filter.js', 'content.js']
  });
  status.textContent = 'Scanner injected. Images larger than 300x300 will be checked.';
});
