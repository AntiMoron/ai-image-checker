importScripts('lib/metadata.js', 'lib/dct.js', 'lib/heuristics.js');

const CACHE = new Map();

async function decodeToGray(blob) {
  if (typeof createImageBitmap !== 'function' || typeof OffscreenCanvas === 'undefined') {
    throw new Error('Browser does not support service-worker image decoding.');
  }

  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, 768 / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.floor(bitmap.width * scale));
  const height = Math.max(1, Math.floor(bitmap.height * scale));
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(bitmap, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height).data;
  const gray = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i += 1) {
    const offset = i * 4;
    gray[i] = Math.round((0.299 * pixels[offset]) + (0.587 * pixels[offset + 1]) + (0.114 * pixels[offset + 2]));
  }
  bitmap.close();
  return { width, height, gray };
}

async function fetchImageBytes(url) {
  const response = await fetch(url, {
    credentials: 'omit',
    cache: 'force-cache'
  });
  if (!response.ok) throw new Error(`Fetch failed: HTTP ${response.status}`);
  const contentType = response.headers.get('content-type') || '';
  const blob = await response.blob();
  const buffer = await blob.arrayBuffer();
  return { buffer, blob, contentType };
}

async function scanImage(request) {
  const cacheKey = request.src;
  if (CACHE.has(cacheKey)) return CACHE.get(cacheKey);

  const { buffer, blob, contentType } = await fetchImageBytes(request.src);
  const metadata = globalThis.AIImageCheckerMetadata.scanMetadata(buffer, request.src);
  let heuristics;
  try {
    const grayImage = await decodeToGray(blob);
    heuristics = globalThis.AIImageCheckerHeuristics.analyzeFrequencyHeuristics(grayImage);
  } catch (error) {
    heuristics = {
      heuristicScore: 0,
      riskLevel: 'low',
      signals: [],
      notes: [
        'Frequency analysis could not be completed in this browser context.',
        error.message
      ]
    };
  }

  const result = {
    id: request.id,
    src: request.src,
    width: request.width,
    height: request.height,
    contentType,
    metadata,
    heuristics,
    scannedAt: new Date().toISOString()
  };
  CACHE.set(cacheKey, result);
  return result;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.type !== 'AI_IMAGE_CHECKER_SCAN') return false;
  scanImage(message.image)
    .then((result) => sendResponse({ ok: true, result }))
    .catch((error) => sendResponse({
      ok: false,
      id: message.image.id,
      src: message.image.src,
      error: error.message
    }));
  return true;
});
