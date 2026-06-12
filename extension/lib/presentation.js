(function initPresentation(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.AIImageCheckerPresentation = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function factory() {
  const RED_FILTER = 'sepia(0.45) saturate(1.75) hue-rotate(315deg) brightness(0.96)';

  function getImageTreatment(result) {
    const hasEvidence = Boolean(result?.metadata?.hasDeterministicEvidence);
    const riskLevel = result?.heuristics?.riskLevel || 'low';
    const flagged = hasEvidence || riskLevel !== 'low';

    if (!flagged) {
      return {
        flagged: false,
        outline: '2px solid #2ecc71',
        filter: '',
        label: 'No local AI provenance evidence; heuristic risk: low'
      };
    }

    if (hasEvidence) {
      const keywords = result.metadata.keywords?.join(', ') || 'provenance marker';
      return {
        flagged: true,
        outline: '3px solid #ff3b30',
        filter: RED_FILTER,
        label: `AI provenance: ${keywords}`
      };
    }

    return {
      flagged: true,
      outline: '3px solid #ff3b30',
      filter: RED_FILTER,
      label: `Heuristic risk: ${riskLevel} (${result.heuristics.heuristicScore})`
    };
  }

  return { getImageTreatment };
});
