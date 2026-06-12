# AI Image Checker Extension

Chrome/Edge Manifest V3 extension for scanning page images larger than 300x300.

## What It Does

- Finds `<img>` elements with `naturalWidth > 300` and `naturalHeight > 300`.
- Fetches the image bytes from the extension background service worker.
- Checks deterministic provenance markers such as C2PA, JUMBF, Content Credentials, XMP, OpenAI, Gemini, and SynthID strings.
- Attempts local browser-side image decoding and DCT heuristic scoring.
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

## Notes

Some sites block image fetching or serve images behind authenticated URLs. Those images will show scan errors instead of results.
