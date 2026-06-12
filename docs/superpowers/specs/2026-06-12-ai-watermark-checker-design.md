# AI Watermark Checker Design

## Goal

Build a local command-line tool that checks images for AI provenance markers and hidden watermark risk. The tool reports deterministic evidence when it can prove it locally, and uses clearly labeled heuristics for frequency-domain watermark risk.

## Scope

The tool scans PNG, JPEG, and WebP files. It does not remove, modify, or bypass watermarks. It detects visible and invisible provenance indicators only for audit/reporting purposes.

## Detection Layers

Deterministic metadata and container checks:

- Search image container bytes for C2PA, JUMBF, Content Credentials, XMP, EXIF, OpenAI, Google, Gemini, SynthID, Adobe, and related provenance strings.
- Parse PNG chunks enough to list chunk types and inspect textual chunks.
- Parse JPEG markers enough to list APP segments and inspect segment payloads.
- Report short evidence strings without dumping large binary data.

Heuristic frequency checks:

- Decode the image and convert sampled pixels to grayscale.
- Split the grayscale plane into 8x8 blocks.
- Run a small local DCT implementation over sampled blocks.
- Score mid-frequency coefficient regularity, cross-block consistency, and suspicious periodicity.
- Return `heuristicScore`, `riskLevel`, and `signals`.

The frequency score is not a SynthID proof. Public local verification for SynthID is not available, so the report must say "possible hidden frequency-domain watermark" rather than "SynthID detected".

## CLI

Command:

```bash
watermark-check <image-or-directory...> [--recursive] [--json] [--csv <file>]
```

Behavior:

- Default output is a readable text summary.
- `--json` emits JSON to stdout.
- `--csv <file>` writes a CSV report.
- `--recursive` expands directories recursively.
- Unsupported files are reported as errors per file and do not stop the full scan.

Exit codes:

- `0`: scan completed, including cases where markers or risk were found.
- `1`: invalid command-line arguments.
- `2`: no readable supported image files were scanned.

## File Structure

- `package.json`: package metadata, CLI bin, dependencies, test script.
- `cli.js`: argument parsing, file expansion, output formatting, exit code mapping.
- `src/index.js`: public scan API.
- `src/metadata.js`: deterministic byte/container/keyword detection.
- `src/image-decode.js`: image decode and grayscale conversion.
- `src/dct.js`: small 8x8 DCT and coefficient helpers.
- `src/heuristics.js`: frequency-domain scoring.
- `test/*.test.js`: Node test runner tests and generated fixtures.

## Testing

Use Node's built-in `node:test` runner. Tests should cover:

- C2PA/JUMBF strings are detected in synthetic JPEG APP data.
- PNG textual provenance strings are detected.
- Clean synthetic images produce low heuristic risk.
- Synthetic periodic DCT-like perturbations produce higher heuristic risk than clean images.
- CLI JSON output includes deterministic findings and heuristic fields.

## Limitations

The tool cannot prove SynthID locally. It can detect local metadata/container evidence and provide a heuristic risk score for hidden frequency-domain signals. Reports must keep those categories separate.
