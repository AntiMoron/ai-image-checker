(function initHeuristics(root, factory) {
  const deps = root.AIImageCheckerDct || (typeof require === 'function' ? require('./dct') : null);
  const api = factory(deps);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.AIImageCheckerHeuristics = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function factory(dct) {
  const MID_FREQUENCIES = [
    [1, 2], [2, 1], [2, 2], [3, 1], [1, 3],
    [2, 3], [3, 2], [4, 1], [1, 4], [3, 3]
  ].map(([u, v]) => v * 8 + u);

  function clamp01(value) {
    return Math.max(0, Math.min(1, value));
  }

  function mean(values) {
    return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  function stddev(values, avg = mean(values)) {
    if (values.length === 0) return 0;
    return Math.sqrt(mean(values.map((value) => (value - avg) ** 2)));
  }

  function riskLevel(score) {
    if (score >= 0.7) return 'high';
    if (score >= 0.35) return 'medium';
    return 'low';
  }

  function analyzeFrequencyHeuristics(grayImage) {
    const blocks = dct.sampleDctBlocks(grayImage);
    const notes = ['Frequency analysis is heuristic and is not proof of SynthID or any specific watermark system.'];
    if (blocks.length < 4) {
      return {
        heuristicScore: 0,
        riskLevel: 'low',
        signals: [{ name: 'blockCount', value: blocks.length, weight: 0 }],
        notes: [...notes, 'Image is too small for meaningful 8x8 block frequency analysis.']
      };
    }

    const stats = MID_FREQUENCIES.map((index) => {
      const values = blocks.map((block) => Math.abs(block[index]));
      const avg = mean(values);
      const spread = stddev(values, avg);
      return { avg, regularity: avg <= 0.0001 ? 0 : clamp01(1 - spread / (avg + 0.0001)) };
    });
    const avgMidEnergy = mean(stats.map((item) => item.avg));
    const maxRegularity = Math.max(...stats.map((item) => item.regularity));
    const avgRegularity = mean(stats.map((item) => item.regularity));
    const energyScore = clamp01(avgMidEnergy / 20);
    const regularityScore = clamp01((maxRegularity * 0.65) + (avgRegularity * 0.35));
    const score = clamp01((energyScore * 0.45) + (regularityScore * 0.55));

    return {
      heuristicScore: Number(score.toFixed(3)),
      riskLevel: riskLevel(score),
      signals: [
        { name: 'blockCount', value: blocks.length, weight: 0 },
        { name: 'midFrequencyEnergy', value: Number(avgMidEnergy.toFixed(3)), weight: 0.45 },
        { name: 'midFrequencyRegularity', value: Number(regularityScore.toFixed(3)), weight: 0.55 }
      ],
      notes
    };
  }

  return { analyzeFrequencyHeuristics };
});
