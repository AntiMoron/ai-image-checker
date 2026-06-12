# AI Image Checker Extension

Chrome/Edge Manifest V3 extension for scanning page images larger than 300x300.

## What It Does

- When you click the extension button, finds currently visible `<img>` elements with `naturalWidth > 300` and `naturalHeight > 300`.
- Fetches the image bytes from the extension background service worker.
- Checks deterministic provenance markers such as C2PA, JUMBF, Content Credentials, XMP, OpenAI, Gemini, and SynthID strings.
- Uses quick mode by default: metadata/provenance checks only, with frequency analysis skipped to avoid high CPU usage.
- Outlines flagged images in red and applies a red tint filter; clear images get a green outline, and failed scans get a dashed amber outline.

## Cost and Privacy

- API calls: none.
- Uploads: none.
- Compute: local browser CPU only.

The frequency score is heuristic. It is not proof of SynthID or any specific watermark system.

## Install for Development

1. Open `chrome://extensions` or `edge://extensions`.
2. Enable Developer mode.
3. Choose "Load unpacked".
4. Select this `extension/` directory.
5. Open a page with images larger than 300x300.
6. Click the extension icon, then click "Rescan page".

## Notes

Some sites block image fetching or serve images behind authenticated URLs. Those images will show scan errors instead of results. The extension scans at most 25 visible images per run and processes one image at a time.
