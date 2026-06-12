document.getElementById('rescan').addEventListener('click', async () => {
  const status = document.getElementById('status');
  status.textContent = 'Starting lightweight scan...';
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    status.textContent = 'No active tab found.';
    return;
  }
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['lib/page-filter.js', 'lib/presentation.js', 'content.js']
  });
  const response = await chrome.tabs.sendMessage(tab.id, {
    type: 'AI_IMAGE_CHECKER_START_PAGE_SCAN'
  }).catch((error) => ({ ok: false, error: error.message }));
  status.textContent = response.ok
    ? 'Scanning visible images larger than 300x300. Quick mode avoids DCT CPU load.'
    : `Could not start scan: ${response.error}`;
});
