// Builds a small static map of Plaça de Sant Antoni from OpenStreetMap tiles
// (© OpenStreetMap contributors, ODbL). Run once with `npm run map`; the result
// is committed so the page needs no third-party iframe, script or cookies.
// Output: media/originals/mapa-plaza-sant-antoni.png (then `npm run images`).
import sharp from 'sharp';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'media', 'originals', 'mapa-plaza-sant-antoni.png');
const LAT = 39.5720917;
const LON = 2.6556645;
const ZOOM = 17;
const TILE = 256;
const WIDTH = 960;
const HEIGHT = 720;
// Identify the client as required by the OSM tile usage policy.
const USER_AGENT = 'premium-tattoo-proposal/1.0 (one-off static map build)';
const ACCENT = '#b3a27f';

function project(lat, lon, zoom) {
  const n = 2 ** zoom;
  const x = ((lon + 180) / 360) * n;
  const rad = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n;
  return { x: x * TILE, y: y * TILE };
}

async function fetchTile(x, y) {
  const res = await fetch(`https://tile.openstreetmap.org/${ZOOM}/${x}/${y}.png`, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`Tile ${x}/${y} failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const centre = project(LAT, LON, ZOOM);
  const left = centre.x - WIDTH / 2;
  const top = centre.y - HEIGHT / 2;
  const x0 = Math.floor(left / TILE);
  const y0 = Math.floor(top / TILE);
  const x1 = Math.floor((left + WIDTH) / TILE);
  const y1 = Math.floor((top + HEIGHT) / TILE);

  const composites = [];
  for (let tx = x0; tx <= x1; tx += 1) {
    for (let ty = y0; ty <= y1; ty += 1) {
      composites.push({ input: await fetchTile(tx, ty), left: (tx - x0) * TILE, top: (ty - y0) * TILE });
    }
  }
  const canvas = await sharp({
    create: { width: (x1 - x0 + 1) * TILE, height: (y1 - y0 + 1) * TILE, channels: 3, background: '#ffffff' },
  })
    .composite(composites)
    .png()
    .toBuffer();

  // Crop to the frame and turn the light OSM style into a dark, low-contrast
  // map that matches the site (grayscale, inverted, slightly warmed).
  // sharp applies operations in a fixed internal order, so each step is its own pass.
  const inverted = await sharp(canvas)
    .extract({ left: Math.round(left - x0 * TILE), top: Math.round(top - y0 * TILE), width: WIDTH, height: HEIGHT })
    .grayscale()
    .negate({ alpha: false })
    .toBuffer();
  const darkened = await sharp(inverted).linear(0.8, 2).toBuffer();
  const cropped = await sharp(darkened).tint('#d8cfbe').png().toBuffer();

  const pin = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
    <circle cx="${WIDTH / 2}" cy="${HEIGHT / 2}" r="40" fill="${ACCENT}" fill-opacity="0.3"/>
    <circle cx="${WIDTH / 2}" cy="${HEIGHT / 2}" r="14" fill="${ACCENT}" stroke="#f1ede6" stroke-width="4"/>
  </svg>`);

  await sharp(cropped).composite([{ input: pin }]).png().toFile(OUT);
  console.log('map written to', OUT);
}

main().catch((err) => {
  console.error('Map build failed:', err);
  process.exit(1);
});
