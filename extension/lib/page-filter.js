(function initPageFilter(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.AIImageCheckerPageFilter = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function factory() {
  const MIN_IMAGE_SIZE = 300;

  function shouldInspectImage(image) {
    if (!image || !image.src) return false;
    return image.naturalWidth > MIN_IMAGE_SIZE && image.naturalHeight > MIN_IMAGE_SIZE;
  }

  return { MIN_IMAGE_SIZE, shouldInspectImage };
});
