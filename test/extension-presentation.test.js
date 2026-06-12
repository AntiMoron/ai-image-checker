const assert = require('node:assert/strict');
const test = require('node:test');

const { getImageTreatment } = require('../extension/lib/presentation');

test('presentation applies red filter to deterministic AI evidence', () => {
  const treatment = getImageTreatment({
    metadata: { hasDeterministicEvidence: true, keywords: ['c2pa', 'openai'] },
    heuristics: { riskLevel: 'low', heuristicScore: 0.1 }
  });

  assert.equal(treatment.flagged, true);
  assert.equal(treatment.outline, '3px solid #ff3b30');
  assert.match(treatment.filter, /sepia/);
  assert.match(treatment.label, /AI provenance/);
});

test('presentation applies red filter to medium or high heuristic risk', () => {
  const treatment = getImageTreatment({
    metadata: { hasDeterministicEvidence: false, keywords: [] },
    heuristics: { riskLevel: 'medium', heuristicScore: 0.45 }
  });

  assert.equal(treatment.flagged, true);
  assert.match(treatment.filter, /hue-rotate/);
  assert.match(treatment.label, /Heuristic risk: medium/);
});

test('presentation leaves low-risk images without a red filter', () => {
  const treatment = getImageTreatment({
    metadata: { hasDeterministicEvidence: false, keywords: [] },
    heuristics: { riskLevel: 'low', heuristicScore: 0.12 }
  });

  assert.equal(treatment.flagged, false);
  assert.equal(treatment.filter, '');
  assert.equal(treatment.outline, '2px solid #2ecc71');
});
