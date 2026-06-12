#!/usr/bin/env node

const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');

const { scanImage } = require('./src');

const SUPPORTED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

function usage() {
  return `Usage:
  watermark-check <image-or-directory...> [--recursive] [--json] [--csv <file>]

Checks deterministic AI provenance metadata and heuristic hidden frequency-domain watermark risk.
`;
}

function parseArgs(argv) {
  const options = {
    json: false,
    recursive: false,
    csv: null,
    inputs: []
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--recursive' || arg === '-r') {
      options.recursive = true;
    } else if (arg === '--csv') {
      i += 1;
      if (i >= argv.length) throw new Error('Missing value for --csv');
      options.csv = argv[i];
    } else if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`);
    } else {
      options.inputs.push(arg);
    }
  }

  return options;
}

function isSupportedFile(filePath) {
  return SUPPORTED_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

async function expandInput(input, recursive) {
  const stat = await fsp.stat(input);
  if (stat.isFile()) return isSupportedFile(input) ? [input] : [];
  if (!stat.isDirectory()) return [];

  const entries = await fsp.readdir(input, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(input, entry.name);
    if (entry.isFile() && isSupportedFile(entryPath)) {
      files.push(entryPath);
    } else if (entry.isDirectory() && recursive) {
      files.push(...await expandInput(entryPath, recursive));
    }
  }
  return files;
}

async function expandInputs(inputs, recursive) {
  const files = [];
  for (const input of inputs) {
    try {
      files.push(...await expandInput(input, recursive));
    } catch (error) {
      files.push({ input, error: error.message });
    }
  }
  return files;
}

function formatText(results) {
  return results.map((result) => {
    if (!result.supported) {
      return `${result.filePath}\n  Error: ${result.error}`;
    }

    const evidence = result.metadata.hasDeterministicEvidence ? 'yes' : 'no';
    const keywords = result.metadata.keywords.length > 0
      ? result.metadata.keywords.join(', ')
      : 'none';
    return [
      result.filePath,
      `  Format: ${result.metadata.format}`,
      `  Deterministic evidence: ${evidence}`,
      `  Keywords: ${keywords}`,
      `  Heuristic risk: ${result.heuristics.riskLevel} (${result.heuristics.heuristicScore})`,
      '  Note: heuristic risk is not proof of SynthID or any specific watermark system.'
    ].join('\n');
  }).join('\n\n');
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

async function writeCsv(filePath, results) {
  const rows = [
    ['filePath', 'supported', 'format', 'deterministicEvidence', 'keywords', 'heuristicScore', 'riskLevel', 'error']
  ];

  for (const result of results) {
    rows.push([
      result.filePath,
      result.supported,
      result.metadata?.format ?? '',
      result.metadata?.hasDeterministicEvidence ?? false,
      result.metadata?.keywords?.join('|') ?? '',
      result.heuristics?.heuristicScore ?? '',
      result.heuristics?.riskLevel ?? '',
      result.error ?? ''
    ]);
  }

  await fsp.writeFile(filePath, `${rows.map((row) => row.map(csvEscape).join(',')).join('\n')}\n`);
}

async function main(argv = process.argv.slice(2)) {
  let options;
  try {
    options = parseArgs(argv);
  } catch (error) {
    console.error(error.message);
    console.error(usage());
    return 1;
  }

  if (options.help) {
    console.log(usage());
    return 0;
  }

  if (options.inputs.length === 0) {
    console.error(usage());
    return 1;
  }

  const expanded = await expandInputs(options.inputs, options.recursive);
  const files = expanded.filter((item) => typeof item === 'string');
  const expansionErrors = expanded
    .filter((item) => typeof item === 'object')
    .map((item) => ({ filePath: item.input, supported: false, error: item.error }));

  if (files.length === 0) {
    console.error('No supported readable image files were scanned.');
    return 2;
  }

  const results = [...expansionErrors];
  for (const filePath of files) {
    results.push(await scanImage(filePath));
  }

  if (options.csv) await writeCsv(options.csv, results);

  if (options.json) {
    console.log(JSON.stringify({ results }, null, 2));
  } else {
    console.log(formatText(results));
  }

  return results.some((result) => result.supported) ? 0 : 2;
}

if (require.main === module) {
  main().then((code) => {
    process.exitCode = code;
  }).catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  main,
  parseArgs,
  formatText
};
