// Génère og.jpg 1200x630 — deux soleils, deux mondes
const sharp = require('sharp');
const path = require('path');

const W = 1200, H = 630;

const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="skyL" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3f7fd9"/><stop offset="0.7" stop-color="#8fc1ee"/><stop offset="1" stop-color="#cfe6f7"/>
    </linearGradient>
    <linearGradient id="skyR" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2b2f6b"/><stop offset="0.55" stop-color="#c96f8e"/><stop offset="1" stop-color="#ffb36b"/>
    </linearGradient>
    <radialGradient id="sun" cx="0.35" cy="0.35" r="1">
      <stop offset="0" stop-color="#fff3c4"/><stop offset="0.6" stop-color="#ffd166"/><stop offset="1" stop-color="#ff9a3c"/>
    </radialGradient>
    <radialGradient id="moon" cx="0.35" cy="0.35" r="1">
      <stop offset="0" stop-color="#fdfdff"/><stop offset="0.7" stop-color="#cfd4ee"/><stop offset="1" stop-color="#aab2d8"/>
    </radialGradient>
  </defs>

  <rect x="0" y="0" width="${W/2}" height="${H}" fill="url(#skyL)"/>
  <rect x="${W/2}" y="0" width="${W/2}" height="${H}" fill="url(#skyR)"/>

  <!-- étoiles côté nuit -->
  <g fill="#ffffff">
    <circle cx="660" cy="60" r="2.2" opacity=".9"/><circle cx="730" cy="120" r="1.6" opacity=".7"/>
    <circle cx="800" cy="45" r="1.8" opacity=".8"/><circle cx="870" cy="95" r="2.4" opacity=".9"/>
    <circle cx="940" cy="60" r="1.5" opacity=".6"/><circle cx="1010" cy="130" r="2" opacity=".8"/>
    <circle cx="1080" cy="70" r="1.7" opacity=".7"/><circle cx="1140" cy="150" r="2.2" opacity=".9"/>
    <circle cx="700" cy="180" r="1.4" opacity=".5"/><circle cx="990" cy="35" r="1.6" opacity=".7"/>
  </g>

  <!-- soleil côté jour -->
  <circle cx="300" cy="185" r="88" fill="url(#sun)"/>
  <circle cx="300" cy="185" r="118" fill="none" stroke="#ffd166" stroke-width="2" opacity=".45" stroke-dasharray="4 10"/>
  <!-- lune côté soir -->
  <circle cx="930" cy="185" r="66" fill="url(#moon)"/>
  <circle cx="955" cy="165" r="14" fill="#aab2d8" opacity=".55"/>
  <circle cx="912" cy="205" r="9" fill="#aab2d8" opacity=".45"/>

  <!-- nuages -->
  <g fill="#ffffff" opacity=".35">
    <ellipse cx="180" cy="300" rx="95" ry="22"/><ellipse cx="230" cy="285" rx="55" ry="26"/>
  </g>
  <g fill="#ffffff" opacity=".22">
    <ellipse cx="1020" cy="320" rx="80" ry="18"/><ellipse cx="1065" cy="308" rx="45" ry="20"/>
  </g>

  <!-- colines -->
  <path d="M-60 ${H} Q160 380 420 ${H} Z" fill="#1a2554" opacity=".9"/>
  <path d="M340 ${H} Q620 400 900 ${H} Z" fill="#141c40" opacity=".95"/>
  <path d="M760 ${H} Q1020 370 1280 ${H} Z" fill="#0e1430"/>

  <!-- palmier côté khmer -->
  <g stroke="#0e1430" fill="none" stroke-linecap="round">
    <path d="M1040 630 Q1036 480 1044 400" stroke-width="10"/>
  </g>
  <g fill="#0e1430">
    <path d="M1044 400 Q1000 380 975 400 Q1015 395 1044 415 Z"/>
    <path d="M1044 400 Q1090 380 1112 402 Q1075 393 1044 415 Z"/>
    <path d="M1044 400 Q1020 355 1030 340 Q1046 375 1044 415 Z"/>
    <path d="M1044 400 Q1072 362 1090 362 Q1062 390 1044 415 Z"/>
    <path d="M1044 400 Q1015 368 998 370 Q1030 385 1044 415 Z"/>
  </g>

  <!-- tour Eiffel stylisée côté France -->
  <g fill="#1a2554">
    <path d="M170 630 L196 500 206 500 232 630 206 630 200 585 192 585 186 630 Z" opacity=".95"/>
    <path d="M176 560 L226 560" stroke="#1a2554" stroke-width="6"/>
  </g>

  <!-- arc entre les deux soleils -->
  <path d="M300 185 Q615 -40 930 185" fill="none" stroke="#ffd166" stroke-width="4" stroke-dasharray="6 14" opacity=".8"/>
  <g transform="translate(615,105)">
    <path d="M22 0L-18 -12 -12 0 -18 12Z" fill="#ff7aa2"/>
    <path d="M8 0L-6 -22 -11 -22 -3 0 -11 22 -6 22Z" fill="#ff9db8"/>
  </g>

  <!-- carte pointillée -->
  <g>
    <rect x="90" y="415" width="1020" height="130" rx="24" fill="#0b1026" opacity=".82"/>
    <!-- drapeau France -->
    <g>
      <rect x="316" y="496" width="20" height="14" fill="#26408b"/><rect x="336" y="496" width="20" height="14" fill="#ffffff"/><rect x="356" y="496" width="20" height="14" fill="#c3352b"/>
      <text x="600" y="522" text-anchor="middle" font-family="DejaVu Sans, sans-serif" font-size="30" fill="#eef1ff">Montévrain</text>
      <text x="768" y="522" text-anchor="middle" font-family="DejaVu Sans, sans-serif" font-size="30" fill="#eef1ff">↔</text>
      <text x="905" y="522" text-anchor="middle" font-family="DejaVu Sans, sans-serif" font-size="30" fill="#eef1ff">Trapeang Ampil</text>
      <!-- drapeau Cambodge -->
      <g>
        <rect x="1108" y="496" width="26" height="14" fill="#032ea1"/><rect x="1134" y="496" width="13" height="14" fill="#e00025"/><rect x="1147" y="496" width="26" height="14" fill="#032ea1"/>
        <path d="M1147 508 L1147 502 M1140 508 L1140 503 Q1147 498 1154 503 L1154 508 M1144 508 L1144 504 M1150 508 L1150 504" stroke="#e00025" stroke-width="2.4" fill="none"/>
      </g>
    </g>
    <text x="600" y="470" text-anchor="middle" font-family="DejaVu Sans, sans-serif" font-size="62" font-weight="bold" fill="#ffd166">Deux soleils</text>
  </g>
</svg>`;

sharp(Buffer.from(svg), { density: 96 })
  .resize(1200, 630)
  .jpeg({ quality: 88 })
  .toFile(path.join(__dirname, 'og.jpg'))
  .then(info => console.log('OK', info))
  .catch(e => { console.error('ERR', e.message); process.exit(1); });
