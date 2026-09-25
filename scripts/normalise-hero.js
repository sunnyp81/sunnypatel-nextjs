// Mandatory step for every new blog/service hero: normalise its subject size before use.
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const sharp = require('sharp');

function subjectBounds(data, width, height, channels) {
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      if (Math.max(data[i], data[i + 1], data[i + 2]) > 40) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  if (right < left || bottom < top) return null;
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

function pct(value, total) {
  return `${(value / total * 100).toFixed(1)}%`;
}

function median(values) {
  values.sort((a, b) => a - b);
  const middle = Math.floor(values.length / 2);
  return values.length % 2 ? values[middle] : Math.round((values[middle - 1] + values[middle]) / 2);
}

function borderMedian(data, width, height, channels) {
  const strip = Math.max(1, Math.ceil(Math.min(width, height) * 0.02));
  const samples = [[], [], []];
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (x >= strip && x < width - strip && y >= strip && y < height - strip) continue;
    const i = (y * width + x) * channels;
    for (let c = 0; c < 3; c++) samples[c].push(data[i + c]);
  }
  return samples.map(median);
}

async function main() {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const files = args.filter((arg) => arg !== '--check');
  if (args.filter((arg) => arg === '--check').length > 1 ||
      files.some((arg) => arg.startsWith('--')) ||
      files.length < 1 || files.length > (check ? 1 : 2)) {
    throw new Error('Usage: node scripts/normalise-hero.js <input> [<output>] | --check <input>');
  }
  const inputPath = path.resolve(files[0]);
  const outputPath = path.resolve(files[1] || files[0]);
  const format = path.extname(inputPath).slice(1).toLowerCase();
  if (!['webp', 'png'].includes(format)) throw new Error('Input must be .webp or .png.');
  if (!check && path.extname(outputPath).slice(1).toLowerCase() !== format) {
    throw new Error('Output extension must match the input format.');
  }
  const input = await fs.promises.readFile(inputPath);
  const metadata = await sharp(input).metadata();
  if (metadata.format !== format) throw new Error('Input extension must match its image format.');
  const { data, info } = await sharp(input).toColourspace('srgb').removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const bounds = subjectBounds(data, info.width, info.height, info.channels);
  if (!bounds) throw new Error(`No lit subject found in ${inputPath}`);
  if (check) {
    console.log(`Subject width: ${pct(bounds.width, info.width)}; height: ${pct(bounds.height, info.height)}`);
    if (bounds.width / info.width > 0.70 || bounds.height / info.height > 0.64) process.exitCode = 1;
    return;
  }
  const background = borderMedian(data, info.width, info.height, info.channels);
  const pad = Math.ceil(info.width * 0.02);
  const left = Math.max(0, bounds.left - pad);
  const top = Math.max(0, bounds.top - pad);
  const right = Math.min(info.width, bounds.left + bounds.width + pad);
  const bottom = Math.min(info.height, bounds.top + bounds.height + pad);
  const cropWidth = right - left;
  const cropHeight = bottom - top;
  const fit = Math.min(info.width * 0.64 / cropWidth, info.height * 0.58 / cropHeight);
  const resizedWidth = Math.max(1, Math.round(cropWidth * fit));
  const resizedHeight = Math.max(1, Math.round(cropHeight * fit));
  const resized = await sharp(input).toColourspace('srgb').extract({ left, top, width: cropWidth, height: cropHeight })
    .resize(resizedWidth, resizedHeight).removeAlpha().raw().toBuffer();
  const feather = Math.max(1, Math.ceil(info.width * 0.03));
  const rgba = Buffer.alloc(resizedWidth * resizedHeight * 4);
  for (let y = 0; y < resizedHeight; y++) for (let x = 0; x < resizedWidth; x++) {
    const src = (y * resizedWidth + x) * 3;
    const dst = (y * resizedWidth + x) * 4;
    rgba[dst] = resized[src]; rgba[dst + 1] = resized[src + 1]; rgba[dst + 2] = resized[src + 2];
    const distance = Math.min(x + 1, y + 1, resizedWidth - x, resizedHeight - y);
    rgba[dst + 3] = Math.max(0, Math.min(255, Math.round(distance / feather * 255)));
  }
  const crop = await sharp(rgba, { raw: { width: resizedWidth, height: resizedHeight, channels: 4 } }).png().toBuffer();
  const canvas = sharp({ create: { width: info.width, height: info.height, channels: 3, background: { r: background[0], g: background[1], b: background[2] } } });
  const result = canvas.composite([{ input: crop, left: Math.floor((info.width - resizedWidth) / 2), top: Math.floor((info.height - resizedHeight) / 2) }]);
  const encoded = format === 'webp' ? result.webp({ quality: 90 }) : result.png();
  // Stage beside the destination so rename also safely supports in-place use.
  const tempPath = path.join(path.dirname(outputPath), `.${path.basename(outputPath)}.${randomUUID()}.tmp`);
  try {
    await encoded.toFile(tempPath);
    await fs.promises.rename(tempPath, outputPath);
  } finally {
    await fs.promises.rm(tempPath, { force: true });
  }
  console.log(`Normalised ${outputPath} (${info.width}x${info.height}, ${format}).`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
