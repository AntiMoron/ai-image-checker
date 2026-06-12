const N = 8;

const COS_TABLE = Array.from({ length: N }, (_, u) =>
  Array.from({ length: N }, (_, x) => Math.cos(((2 * x + 1) * u * Math.PI) / 16))
);

function alpha(index) {
  return index === 0 ? 1 / Math.sqrt(2) : 1;
}

function dct8x8(block) {
  const coefficients = new Array(64).fill(0);

  for (let v = 0; v < N; v += 1) {
    for (let u = 0; u < N; u += 1) {
      let sum = 0;
      for (let y = 0; y < N; y += 1) {
        for (let x = 0; x < N; x += 1) {
          sum += block[y * N + x] * COS_TABLE[u][x] * COS_TABLE[v][y];
        }
      }
      coefficients[v * N + u] = 0.25 * alpha(u) * alpha(v) * sum;
    }
  }

  return coefficients;
}

function extractBlock(gray, width, startX, startY) {
  const block = new Array(64);
  let mean = 0;

  for (let y = 0; y < N; y += 1) {
    for (let x = 0; x < N; x += 1) {
      const value = gray[(startY + y) * width + startX + x];
      block[y * N + x] = value;
      mean += value;
    }
  }

  mean /= 64;
  for (let i = 0; i < block.length; i += 1) {
    block[i] -= mean;
  }

  return block;
}

function sampleDctBlocks(grayImage, maxBlocks = 1024) {
  const { gray, width, height } = grayImage;
  const blocksWide = Math.floor(width / N);
  const blocksHigh = Math.floor(height / N);
  const totalBlocks = blocksWide * blocksHigh;
  if (totalBlocks === 0) return [];

  const stride = Math.max(1, Math.ceil(Math.sqrt(totalBlocks / maxBlocks)));
  const blocks = [];

  for (let by = 0; by < blocksHigh; by += stride) {
    for (let bx = 0; bx < blocksWide; bx += stride) {
      blocks.push(dct8x8(extractBlock(gray, width, bx * N, by * N)));
    }
  }

  return blocks;
}

module.exports = {
  dct8x8,
  sampleDctBlocks
};
