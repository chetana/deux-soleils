// Génère les icônes PWA (192, 512) — deux soleils pastel sur fond bleu ciel
const { createRequire } = await import('module');
const require = createRequire(import.meta.url);
const sharp = require('sharp');

const icon = size => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#a9d7f6"/><stop offset="1" stop-color="#e8f2fc"/>
    </linearGradient>
    <radialGradient id="s1" cx="0.35" cy="0.35" r="1">
      <stop offset="0" stop-color="#fff8e3"/><stop offset="0.6" stop-color="#ffe3a8"/><stop offset="1" stop-color="#f7c988"/>
    </radialGradient>
    <radialGradient id="s2" cx="0.35" cy="0.35" r="1">
      <stop offset="0" stop-color="#ffeef4"/><stop offset="0.6" stop-color="#f9c6d8"/><stop offset="1" stop-color="#eba8c4"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size*0.22}" fill="url(#bg)"/>
  <circle cx="${size*0.38}" cy="${size*0.62}" r="${size*0.26}" fill="url(#s1)"/>
  <circle cx="${size*0.68}" cy="${size*0.36}" r="${size*0.18}" fill="url(#s2)"/>
  <path d="M${size*0.08} ${size*0.86} Q${size*0.38} ${size*0.5} ${size*0.68} ${size*0.86} Z" fill="#9fc49c" opacity=".75"/>
</svg>`;

Promise.all([
  sharp(Buffer.from(icon(512))).png().toFile('icon-512.png'),
  sharp(Buffer.from(icon(192))).png().toFile('icon-192.png'),
]).then(() => console.log('icônes OK')).catch(e => { console.error(e.message); process.exit(1); });
