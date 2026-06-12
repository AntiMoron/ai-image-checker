# AI Watermark Checker

Local CLI for checking image files for AI provenance markers and hidden watermark risk heuristics.

It has two detection layers:

- Deterministic evidence: C2PA, JUMBF, Content Credentials, XMP/EXIF-like strings, PNG chunks, JPEG APP segments, and provider keywords.
- Frequency heuristics: local 8x8 DCT analysis that estimates possible hidden frequency-domain watermark risk.

The heuristic score is not proof of SynthID or any specific watermark system. Public local verification for SynthID is not available, so this tool keeps proven metadata evidence separate from risk scoring.

## Install

```bash
npm install
```

## Usage

```bash
node cli.js image.png
node cli.js --json image.png image.jpg
node cli.js --recursive ./images
node cli.js --csv report.csv ./images
```

After package linking or global install:

```bash
watermark-check image.png
```

## Output Fields

- `metadata.hasDeterministicEvidence`: true when local bytes contain provenance keywords or markers.
- `metadata.keywords`: matched terms such as `c2pa`, `jumbf`, `content credentials`, `openai`, `gemini`, or `synthid`.
- `metadata.evidence`: short printable snippets around matched evidence.
- `metadata.pngChunks`: PNG chunk types found in the file.
- `metadata.jpegSegments`: JPEG APP segment summaries.
- `heuristics.heuristicScore`: 0 to 1 local risk estimate for frequency-domain regularity.
- `heuristics.riskLevel`: `low`, `medium`, or `high`.
- `heuristics.notes`: limitations and analysis notes.

## Exit Codes

- `0`: scan completed.
- `1`: invalid command-line arguments.
- `2`: no readable supported image files were scanned.

## Supported Formats

- PNG
- JPEG
- WebP

## Limitations

This tool does not remove or modify watermarks. It cannot locally prove SynthID presence. Treat medium or high heuristic risk as a prompt for additional review, not as a definitive finding.
