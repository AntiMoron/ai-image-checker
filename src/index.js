const fs = require('node:fs/promises');
const path = require('node:path');

const { decodeImage } = require('./image-decode');
const { analyzeFrequencyHeuristics } = require('./heuristics');
const { detectFormat, scanMetadata } = require('./metadata');

const SUPPORTED_FORMATS = new Set(['png', 'jpeg', 'webp']);

async function scanImage(filePath) {
  const buffer = await fs.readFile(filePath);
  const format = detectFormat(buffer, path.basename(filePath));

  if (!SUPPORTED_FORMATS.has(format)) {
    return {
      filePath,
      supported: false,
      error: `Unsupported image format: ${format}`
    };
  }

  const metadata = scanMetadata(buffer, filePath);

  try {
    const grayImage = await decodeImage(buffer, format);
    return {
      filePath,
      supported: true,
      metadata,
      heuristics: analyzeFrequencyHeuristics(grayImage)
    };
  } catch (error) {
    return {
      filePath,
      supported: true,
      metadata,
      heuristics: {
        heuristicScore: 0,
        riskLevel: 'low',
        signals: [],
        notes: [
          'Frequency analysis could not be completed.',
          error.message
        ]
      }
    };
  }
}

module.exports = {
  scanImage
};
