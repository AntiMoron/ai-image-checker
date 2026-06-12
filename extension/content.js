(function initContent() {
  const { shouldInspectImage } = globalThis.AIImageCheckerPageFilter;
  const { getImageTreatment } = globalThis.AIImageCheckerPresentation;
  const MAX_CONCURRENT = 3;
  const seen = new WeakSet();
  const bySrc = new Set();
  let queue = [];
  let active = 0;
  let panel;

  function ensurePanel() {
    if (panel) return panel;
    panel = document.createElement('div');
    panel.id = 'ai-image-checker-panel';
    panel.textContent = 'AI Image Checker: scanning page images...';
    Object.assign(panel.style, {
      position: 'fixed',
      right: '12px',
      bottom: '12px',
      zIndex: '2147483647',
      maxWidth: '360px',
      padding: '10px 12px',
      border: '1px solid #222',
      borderRadius: '6px',
      background: '#111',
      color: '#fff',
      font: '12px/1.4 system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      boxShadow: '0 8px 24px rgba(0,0,0,.28)'
    });
    document.documentElement.appendChild(panel);
    return panel;
  }

  function updatePanel() {
    const total = document.querySelectorAll('[data-ai-image-checker-result]').length;
    const flagged = document.querySelectorAll('[data-ai-image-checker-flagged="true"]').length;
    ensurePanel().textContent = `AI Image Checker: ${total} scanned, ${flagged} flagged, ${queue.length + active} pending`;
  }

  function markerText(result) {
    return getImageTreatment(result).label;
  }

  function markImage(image, response) {
    const result = response.result;
    const treatment = getImageTreatment(result);
    image.dataset.aiImageCheckerResult = treatment.flagged ? 'flagged' : 'clear';
    image.dataset.aiImageCheckerFlagged = treatment.flagged ? 'true' : 'false';
    image.title = `AI Image Checker - ${markerText(result)}. Frequency risk is not proof of SynthID.`;
    image.style.outline = treatment.outline;
    image.style.outlineOffset = '2px';
    image.style.filter = treatment.filter;
    updatePanel();
  }

  function markError(image, error) {
    image.dataset.aiImageCheckerResult = 'error';
    image.title = `AI Image Checker - scan failed: ${error}`;
    image.style.outline = '2px dashed #f39c12';
    image.style.outlineOffset = '2px';
    updatePanel();
  }

  function runNext() {
    while (active < MAX_CONCURRENT && queue.length > 0) {
      const item = queue.shift();
      active += 1;
      chrome.runtime.sendMessage({
        type: 'AI_IMAGE_CHECKER_SCAN',
        image: item.payload
      }, (response) => {
        active -= 1;
        if (chrome.runtime.lastError) {
          markError(item.image, chrome.runtime.lastError.message);
        } else if (!response || !response.ok) {
          markError(item.image, response?.error || 'Unknown scan error');
        } else {
          markImage(item.image, response);
        }
        runNext();
      });
    }
    updatePanel();
  }

  function enqueueImage(image) {
    if (seen.has(image) || !shouldInspectImage(image) || bySrc.has(image.currentSrc || image.src)) return;
    seen.add(image);
    const src = image.currentSrc || image.src;
    bySrc.add(src);
    queue.push({
      image,
      payload: {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        src,
        width: image.naturalWidth,
        height: image.naturalHeight
      }
    });
  }

  function collectImages() {
    document.querySelectorAll('img').forEach(enqueueImage);
    runNext();
  }

  const observer = new MutationObserver(() => collectImages());
  observer.observe(document.documentElement, { childList: true, subtree: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', collectImages, { once: true });
  } else {
    collectImages();
  }
})();
