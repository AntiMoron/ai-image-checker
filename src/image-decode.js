const { PNG } = require('pngjs');
const jpeg = require('jpeg-js');
const sharp = require('sharp');

function rgbaToGray(data, width, height, channels = 4) {
  const gray = new Uint8Array(width * height);

  for (let i = 0; i < width * height; i += 1) {
    const offset = i * channels;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    gray[i] = Math.round((0.299 * r) + (0.587 * g) + (0.114 * b));
  }

  return { width, height, gray };
}

async function decodeImage(buffer, format) {
  if (format === 'png') {
    const png = PNG.sync.read(buffer);
    return rgbaToGray(png.data, png.width, png.height, 4);
  }

  if (format === 'jpeg') {
    const decoded = jpeg.decode(buffer, { useTArray: true });
    return rgbaToGray(decoded.data, decoded.width, decoded.height, 4);
  }

  if (format === 'webp') {
    const { data, info } = await sharp(buffer)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    return rgbaToGray(data, info.width, info.height, info.channels);
  }

  throw new Error(`Unsupported image format: ${format}`);
}

module.exports = {
  decodeImage
};
