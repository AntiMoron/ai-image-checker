# AI Watermark Checker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Node.js CLI that scans images for deterministic AI provenance markers and heuristic hidden frequency-domain watermark risk.

**Architecture:** The CLI expands files and directories, then delegates each supported image to a scan API. The scan API combines byte/container metadata inspection with decoded grayscale DCT heuristics and returns a structured report for text, JSON, or CSV output.

**Tech Stack:** Node.js 18+, CommonJS, Node built-in test runner, `pngjs`, `jpeg-js`, and `sharp` for WebP decode fallback.

---

## File Structure

- `package.json`: package metadata, scripts, dependencies, and CLI bin mapping.
- `cli.js`: command-line parser, directory expansion, output formatting, and exit codes.
- `src/index.js`: `scanImage(filePath)` orchestration.
- `src/metadata.js`: deterministic metadata/container marker scanner.
- `src/image-decode.js`: decode PNG/JPEG/WebP to grayscale samples.
- `src/dct.js`: 8x8 DCT helpers.
- `src/heuristics.js`: frequency-domain feature extraction and scoring.
- `test/metadata.test.js`: metadata scanner tests.
- `test/heuristics.test.js`: DCT heuristic tests.
- `test/cli.test.js`: CLI integration tests.

## Tasks

### Task 1: Package and Metadata Scanner

**Files:**
- Create: `package.json`
- Create: `src/metadata.js`
- Test: `test/metadata.test.js`

- [ ] Write failing tests for C2PA/JUMBF and PNG textual provenance detection.
- [ ] Run `rtk npm test -- test/metadata.test.js` and confirm the tests fail because `src/metadata.js` does not exist.
- [ ] Implement `scanMetadata(buffer, fileName)` with keyword evidence and basic PNG/JPEG segment summaries.
- [ ] Run `rtk npm test -- test/metadata.test.js` and confirm the tests pass.

### Task 2: Image Decode and Frequency Heuristics

**Files:**
- Create: `src/image-decode.js`
- Create: `src/dct.js`
- Create: `src/heuristics.js`
- Test: `test/heuristics.test.js`

- [ ] Write failing tests for clean low-risk image data and periodic perturbed higher-risk image data.
- [ ] Run `rtk npm test -- test/heuristics.test.js` and confirm expected failures.
- [ ] Implement grayscale decode for PNG/JPEG/WebP, 8x8 DCT, and heuristic scoring.
- [ ] Run `rtk npm test -- test/heuristics.test.js` and confirm the tests pass.

### Task 3: Scan API

**Files:**
- Create: `src/index.js`
- Test: `test/index.test.js`

- [ ] Write failing tests for `scanImage(filePath)` returning deterministic metadata and heuristic fields.
- [ ] Run `rtk npm test -- test/index.test.js` and confirm expected failures.
- [ ] Implement `scanImage(filePath)` orchestration.
- [ ] Run `rtk npm test -- test/index.test.js` and confirm the tests pass.

### Task 4: CLI Output

**Files:**
- Create: `cli.js`
- Test: `test/cli.test.js`

- [ ] Write failing CLI tests for JSON output, text output, and unsupported input handling.
- [ ] Run `rtk npm test -- test/cli.test.js` and confirm expected failures.
- [ ] Implement argument parsing, file expansion, JSON/text/CSV output, and exit codes.
- [ ] Run `rtk npm test -- test/cli.test.js` and confirm the tests pass.

### Task 5: Docs and Final Verification

**Files:**
- Create: `README.md`

- [ ] Document install, usage, output fields, and SynthID limitation.
- [ ] Run `rtk npm test`.
- [ ] Run `rtk node cli.js --json test/fixtures/sample-c2pa.jpg`.
- [ ] Run `rtk node cli.js test/fixtures`.
- [ ] If inside a git repo, commit the completed work.

## Self-Review

Spec coverage:

- Deterministic provenance checks are covered by Task 1.
- Heuristic frequency scoring is covered by Task 2.
- Structured scan API is covered by Task 3.
- CLI formats and exit codes are covered by Task 4.
- Usage documentation and limitation disclosure are covered by Task 5.

Placeholder scan:

- No placeholders are left in implementation tasks.

Type consistency:

- The plan consistently uses `scanMetadata(buffer, fileName)` and `scanImage(filePath)`.
