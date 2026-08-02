import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

const SS = 4;

function segDist(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;
  let tt = lengthSq === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / lengthSq;
  tt = Math.max(0, Math.min(1, tt));
  const cx = x1 + tt * dx;
  const cy = y1 + tt * dy;
  return Math.hypot(px - cx, py - cy);
}

function insideRoundedRect(x, y, size, radius) {
  if (x < 0 || y < 0 || x > size || y > size) return false;
  const rx = Math.min(Math.max(x, radius), size - radius);
  const ry = Math.min(Math.max(y, radius), size - radius);
  return Math.hypot(x - rx, y - ry) <= radius || (x >= radius && x <= size - radius) || (y >= radius && y <= size - radius)
    ? Math.hypot(x - rx, y - ry) <= radius
    : false;
}

function renderIcon(size) {
  const radius = size * 0.23;
  const stroke = Math.max(1.4, size * 0.085) / 2;
  const cx = size / 2;
  const top = size * 0.24;
  const bottom = size * 0.62;
  const wing = size * 0.16;
  const baseY = size * 0.76;
  const segments = [
    [cx, bottom, cx, top],
    [cx - wing, top + wing, cx, top],
    [cx + wing, top + wing, cx, top],
    [size * 0.3, baseY, size * 0.7, baseY],
  ];

  const pixels = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      let aSum = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = x + (sx + 0.5) / SS;
          const py = y + (sy + 0.5) / SS;
          if (!insideRoundedRect(px, py, size, radius)) continue;
          const tGrad = (px + py) / (2 * size);
          let r = Math.round(0x12 + (0x0d - 0x12) * tGrad);
          let g = Math.round(0xb4 + (0x8f - 0xb4) * tGrad);
          let b = Math.round(0x8b + (0x6c - 0x8b) * tGrad);
          for (const [x1, y1, x2, y2] of segments) {
            if (segDist(px, py, x1, y1, x2, y2) <= stroke) {
              r = 255;
              g = 255;
              b = 255;
              break;
            }
          }
          rSum += r;
          gSum += g;
          bSum += b;
          aSum += 255;
        }
      }
      const samples = SS * SS;
      const offset = (y * size + x) * 4;
      const alpha = aSum / samples;
      const norm = aSum === 0 ? 0 : 255 / (aSum / samples);
      pixels[offset] = Math.round((rSum / samples) * (alpha === 0 ? 0 : norm) * (alpha / 255));
      pixels[offset + 1] = Math.round((gSum / samples) * (alpha === 0 ? 0 : norm) * (alpha / 255));
      pixels[offset + 2] = Math.round((bSum / samples) * (alpha === 0 ? 0 : norm) * (alpha / 255));
      pixels[offset + 3] = Math.round(alpha);
    }
  }
  return pixels;
}

const CRC_TABLE = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return c;
});

function crc32(buffer) {
  let crc = -1;
  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePng(size, pixels) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    pixels.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const size of [16, 32, 48, 128]) {
  const png = encodePng(size, renderIcon(size));
  writeFileSync(join(outDir, `icon-${size}.png`), png);
  console.log(`icon-${size}.png (${png.length} bytes)`);
}
