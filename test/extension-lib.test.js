const assert = require('node:assert/strict');
const test = require('node:test');

const { scanMetadata } = require('../extension/lib/metadata');
const { shouldInspectImage } = require('../extension/lib/page-filter');

function jpegWithAppSegment(text) {
  const payload = Buffer.from(text, 'utf8');
  const length = Buffer.alloc(2);
  length.writeUInt16BE(payload.length + 2, 0);
  return Buffer.concat([
    Buffer.from([0xff, 0xd8]),
    Buffer.from([0xff, 0xe1]),
    length,
    payload,
    Buffer.from([0xff, 0xd9])
  ]);
}

test('extension metadata scanner detects C2PA/JUMBF provider evidence', () => {
  const result = scanMetadata(jpegWithAppSegment('c2pa JUMBF Content Credentials OpenAI Media Service API'), 'image.jpg');

  assert.equal(result.format, 'jpeg');
  assert.equal(result.hasDeterministicEvidence, true);
  assert.ok(result.keywords.includes('c2pa'));
  assert.ok(result.keywords.includes('openai'));
  assert.deepEqual(result.jpegSegments.map((segment) => segment.marker), ['APP1']);
});

test('extension page filter only accepts images larger than 300x300 with usable source URLs', () => {
  assert.equal(shouldInspectImage({ src: 'https://example.com/a.png', naturalWidth: 301, naturalHeight: 301 }), true);
  assert.equal(shouldInspectImage({ src: 'https://example.com/a.png', naturalWidth: 300, naturalHeight: 301 }), false);
  assert.equal(shouldInspectImage({ src: '', naturalWidth: 800, naturalHeight: 800 }), false);
  assert.equal(shouldInspectImage({ src: 'data:image/png;base64,aaa', naturalWidth: 800, naturalHeight: 800 }), true);
});
