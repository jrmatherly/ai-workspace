/**
 * Generates the Beam explainer illustrations (public/images/explainers/explainer-beam-*.svg) in the logo system's
 * language: the Core A mark and the four accents. Run: node tools/develop/gen-explainer-art/gen-beam-explainers.mjs
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(process.cwd(), 'public/images/explainers');

// logo.registry.ts accents; neutral reads on both the light popup and the dark one
const ACCENTS = ['#2FE3C4', '#FFB13D', '#9B8CFF', '#FF6B57', '#2FE3C4'];
const NEUTRAL = '#8A93A6';
const TILE = '#1F2430';

/** Core A mark from AppLogoIcon, 24-unit box, centered at (cx, cy) with the given size */
function coreMark(cx, cy, size, fg, accent) {
  const s = size / 24;
  return `<g transform="translate(${cx - size / 2} ${cy - size / 2}) scale(${s})">
    <rect width="24" height="24" rx="5.3" fill="${TILE}"/>
    <path d="M4.5 19.5 L12 4.5 L19.5 19.5" fill="none" stroke="${fg}" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="9.9" y="12.6" width="4.2" height="4.2" rx="1.1" fill="${accent}"/>
  </g>`;
}

/** A model node: ring + core dot in its accent */
function modelNode(cx, cy, r, color) {
  return `<g>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" fill-opacity="0.14"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="2.5"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.32}" fill="${color}"/>
  </g>`;
}

/** A beam: a cubic curve with a soft halo and a travelling spark */
function beam(x1, y1, x2, y2, color, delay) {
  const dx = (x2 - x1) * 0.45;
  const d = `M${x1} ${y1} C${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  return `<g>
    <path d="${d}" fill="none" stroke="${color}" stroke-width="7" stroke-opacity="0.12" stroke-linecap="round"/>
    <path d="${d}" fill="none" stroke="${color}" stroke-width="2.25" stroke-opacity="0.9" stroke-linecap="round"/>
    <circle r="4" fill="${color}" fill-opacity="0"><animateMotion dur="2.6s" begin="${delay}s" repeatCount="indefinite" path="${d}"/><animate attributeName="fill-opacity" to="1" begin="${delay}s" dur="0.01s" fill="freeze"/></circle>
  </g>`;
}

function svg(w, h, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
${body}
</svg>
`;
}

// Scatter: one prompt, five models
{
  const W = 1200, H = 400;
  const src = { x: 190, y: 200 };
  const targets = [60, 130, 200, 270, 340].map((y, i) => ({ x: 1010, y, color: ACCENTS[i] }));
  const body = [
    ...targets.map((t, i) => beam(src.x + 48, src.y, t.x - 30, t.y, t.color, i * 0.35)),
    ...targets.map(t => modelNode(t.x, t.y, 24, t.color)),
    `<circle cx="${src.x}" cy="${src.y}" r="64" fill="${NEUTRAL}" fill-opacity="0.08"/>`,
    coreMark(src.x, src.y, 84, '#FFFFFF', ACCENTS[0]),
  ].join('\n');
  writeFileSync(join(OUT, 'explainer-beam-scatter.svg'), svg(W, H, body));
}

// Gather: five responses, one merged answer
{
  const W = 1600, H = 540;
  const sources = [70, 170, 270, 370, 470].map((y, i) => ({ x: 250, y, color: ACCENTS[i] }));
  const dst = { x: 1330, y: 270 };
  const body = [
    `<defs><linearGradient id="fuse" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${ACCENTS[0]}"/><stop offset="1" stop-color="${ACCENTS[1]}"/>
    </linearGradient></defs>`,
    ...sources.map((s, i) => beam(s.x + 30, s.y, dst.x - 70, dst.y, s.color, i * 0.35)),
    ...sources.map(s => modelNode(s.x, s.y, 24, s.color)),
    `<circle cx="${dst.x}" cy="${dst.y}" r="150" fill="none" stroke="${NEUTRAL}" stroke-opacity="0.18" stroke-width="1.5" stroke-dasharray="4 10"/>`,
    `<circle cx="${dst.x}" cy="${dst.y}" r="108" fill="none" stroke="url(#fuse)" stroke-opacity="0.55" stroke-width="2"/>`,
    `<circle cx="${dst.x}" cy="${dst.y}" r="82" fill="url(#fuse)" fill-opacity="0.16"/>`,
    coreMark(dst.x, dst.y, 112, '#FFFFFF', 'url(#fuse)'),
  ].join('\n');
  writeFileSync(join(OUT, 'explainer-beam-gather.svg'), svg(W, H, body));
}
console.log('wrote explainer-beam-scatter.svg and explainer-beam-gather.svg');
