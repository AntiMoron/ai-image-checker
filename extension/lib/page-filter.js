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

  function isVisibleInViewport(rect, viewportWidth, viewportHeight) {
    if (!rect) return false;
    return rect.bottom > 0 &&
      rect.right > 0 &&
      rect.top < viewportHeight &&
      rect.left < viewportWidth;
  }

  return { MIN_IMAGE_SIZE, shouldInspectImage, isVisibleInViewport };
});
