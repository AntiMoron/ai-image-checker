const assert = require('node:assert/strict');
const test = require('node:test');

const { analyzeFrequencyHeuristics } = require('../src/heuristics');

function makeFlatGray(width, height, value = 128) {
  return {
    width,
    height,
    gray: new Uint8Array(width * height).fill(value)
  };
}

function makePeriodicGray(width, height) {
  const gray = new Uint8Array(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const wave = ((x + y) % 8 === 0 || (x - y + width) % 8 === 0) ? 44 : -18;
      gray[y * width + x] = Math.max(0, Math.min(255, 128 + wave));
    }
  }
  return { width, height, gray };
}

test('flat grayscale images produce low hidden watermark risk', () => {
  const result = analyzeFrequencyHeuristics(makeFlatGray(64, 64));

  assert.equal(result.riskLevel, 'low');
  assert.ok(result.heuristicScore <= 0.2);
  assert.ok(result.signals.some((signal) => signal.name === 'blockCount'));
});

test('periodic block perturbations produce higher hidden watermark risk than flat images', () => {
  const clean = analyzeFrequencyHeuristics(makeFlatGray(64, 64));
  const perturbed = analyzeFrequencyHeuristics(makePeriodicGray(64, 64));

  assert.ok(perturbed.heuristicScore > clean.heuristicScore + 0.35);
  assert.match(perturbed.riskLevel, /medium|high/);
  assert.ok(perturbed.signals.some((signal) => signal.name === 'midFrequencyRegularity'));
});

test('images with too few blocks return an inconclusive low score', () => {
  const result = analyzeFrequencyHeuristics(makeFlatGray(8, 8));

  assert.equal(result.riskLevel, 'low');
  assert.equal(result.heuristicScore, 0);
  assert.ok(result.notes.some((note) => note.includes('too small')));
});
