// Generates responsive WebP versions of media/originals/*.jpg into public/images/
// and writes src/data/image-manifest.json: intrinsic size, available widths and
// dominant colour (painted behind each image while it loads).
// Originals keep their colour: only resize + WebP encode, no filters.
import sharp from 'sharp';
import { readdir, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC_DIR = path.join(ROOT, 'media', 'originals');
const OUT_DIR = path.join(ROOT, 'public', 'images');
const MANIFEST = path.join(ROOT, 'src', 'data', 'image-manifest.json');
// Covers 1x and 2x (retina) for the gallery, artist and hero slots.
const TARGET_WIDTHS = [480, 720, 960, 1280, 1600, 2000];
const WEBP_QUALITY = 78;
const LOGO_FILE = 'logo-premium-tattoo-perfil.jpg';
// Page background (--ink). The logo's black field is lifted to this colour so the
// header needs no CSS blend mode or filter.
const INK = [14, 13, 12];
const PLACEHOLDER_WEIGHT = 0.35;
// Instagram video covers with baked-in black letterbox bars: trim only the bars.
const TRIM_BARS = new Set(['estudio-hannya-black-grey.jpg']);

function toHex([r, g, b]) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

async function loadInput(file) {
  const source = path.join(SRC_DIR, file);
  if (TRIM_BARS.has(file)) return sharp(source).trim({ background: '#000000', threshold: 18 }).toBuffer();
  if (file === LOGO_FILE) {
    const scale = INK.map((c) => (255 - c) / 255);
    return sharp(source).linear(scale, INK).toBuffer();
  }
  return source;
}

async function processImage(file) {
  const name = path.parse(file).name;
  const input = await loadInput(file);
  const { width, height } = await sharp(input).metadata();
  const widths = [...new Set([...TARGET_WIDTHS.filter((w) => w < width), Math.min(width, TARGET_WIDTHS.at(-1))])].sort((a, b) => a - b);

  for (const w of widths) {
    await sharp(input)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(path.join(OUT_DIR, `${name}-${w}.webp`));
  }

  // Discreet placeholder: the photo's average colour pulled 65% towards the page ink.
  const { channels } = await sharp(input).stats();
  const color = toHex(INK.map((ink, i) => Math.round(channels[i].mean * PLACEHOLDER_WEIGHT + ink * (1 - PLACEHOLDER_WEIGHT))));
  return [name, { width, height, widths, color }];
}

async function buildBrandAssets() {
  const logo = await loadInput(LOGO_FILE);
  await sharp(logo).resize(96).png().toFile(path.join(ROOT, 'public', 'favicon.png'));
  await sharp(logo).resize(180, 180, { kernel: 'lanczos3' }).png().toFile(path.join(ROOT, 'public', 'apple-touch-icon.png'));
  // Open Graph card: the eagle piece, crop focused on the most salient area.
  await sharp(path.join(SRC_DIR, 'steven-enriquez-aguila-realismo.jpg'))
    .resize(1200, 630, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: 82 })
    .toFile(path.join(ROOT, 'public', 'og-premium-tattoo.jpg'));
}

async function main() {
  // Start clean so widths dropped from TARGET_WIDTHS do not linger.
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(path.dirname(MANIFEST), { recursive: true });
  const files = (await readdir(SRC_DIR)).filter((f) => /\.(jpe?g|png)$/i.test(f));
  const entries = [];
  for (const file of files) {
    entries.push(await processImage(file));
    console.log('ok', file);
  }
  await buildBrandAssets();
  await writeFile(MANIFEST, JSON.stringify(Object.fromEntries(entries), null, 2) + '\n');
  console.log(`manifest: ${entries.length} images`);
}

main().catch((err) => {
  console.error('Image optimisation failed:', err);
  process.exit(1);
});
