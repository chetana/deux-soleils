// Évalue les traductions khmères de deux-soleils avec GLM-5.3-flash (moteur de traduction de prod lys.chetana.fr).
// Usage: node eval-khmer.mjs  → rapport/rapport-traduction.md
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const ENV = Object.fromEntries(
  readFileSync(new URL('./.gemini.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.startsWith('#')).map(l => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')];
    })
);
const { createSign } = await import('crypto');

function parseSA(raw) {
  let s = raw.trim();
  if (s.startsWith('"')) s = JSON.parse(s);
  const c = JSON.parse(s);
  c.private_key = c.private_key.replace(/\\n/g, '\n').trim() + '\n';
  return c;
}
async function getAccessToken() {
  const c = parseSA(ENV.GCS_SERVICE_ACCOUNT_JSON);
  const now = Math.floor(Date.now() / 1000);
  const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({ iss: c.client_email, scope: 'https://www.googleapis.com/auth/cloud-platform', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })}`;
  const sig = createSign('RSA-SHA256').update(unsigned).sign(c.private_key, 'base64url');
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${sig}` }),
  });
  const j = await r.json();
  if (!j.access_token) throw new Error('token KO: ' + JSON.stringify(j).slice(0, 200));
  return j.access_token;
}
const PROJECT = ENV.VERTEX_PROJECT_ID || 'cykt-399216';
const LOC = ENV.VERTEX_LOCATION || 'us-central1';
const MODEL = 'gemini-2.5-flash';

// Toutes les chaînes khmères du site, avec le français attendu et le contexte
const STRINGS = [
  { id: 'titre', fr: 'Deux soleils (titre du site)', kh: 'ពន្លឺពីរ', ctx: 'titre du site horloges/meteo famille' },
  { id: 'lieu-montevrain', fr: 'Montévrain (translittération)', kh: 'ម៉ុងតេវ្រែន', ctx: 'nom de ville' },
  { id: 'lieu-seine-marne', fr: 'Seine-et-Marne (translittération)', kh: 'ស៊ែន អេ ម៉ារន', ctx: 'nom de departement' },
  { id: 'lieu-trapeang-ampil', fr: 'Trapeang Ampil', kh: 'ត្រពាំងអំពិល', ctx: 'nom de village au Cambodge' },
  { id: 'lieu-samraong-tong', fr: 'district de Samraong Tong', kh: 'ស្រុកសំរោងទង', ctx: 'district de Kampong Speu' },
  { id: 'lieu-kampong-speu', fr: 'province de Kampong Speu', kh: 'កំពង់ស្ពឺ', ctx: 'province du Cambodge' },
  { id: 'ecart-horaire', fr: 'écart horaire (label)', kh: 'គម្លាតម៉ោង', ctx: 'label au-dessus de "+5h" entre deux drapeaux' },
  { id: 'statut-5-7', fr: 'Le soleil se lève, nouvelle journée', kh: 'បានភ្ញាក់ពីដេក ពន្លឺព្រឹកថ្មី', ctx: 'commentaire 5h-7h du matin' },
  { id: 'statut-7-9', fr: 'Petit-déjeuner, on se prépare', kh: 'អាហារព្រឹក និងរៀបចំខ្លួន', ctx: 'commentaire 7h-9h' },
  { id: 'statut-9-12', fr: 'Bon matin, au travail', kh: 'ពេលព្រឹក ធ្វើការងារ', ctx: 'commentaire 9h-12h' },
  { id: 'statut-12-14', fr: 'Déjeuner et pause méritée', kh: 'អាហារថ្ងៃត្រង់ និងសម្រាក', ctx: 'commentaire 12h-14h' },
  { id: 'statut-14-17', fr: 'Bel après-midi, on continue', kh: 'ពេលរសៀល បន្តកិច្ចការ', ctx: 'commentaire 14h-17h' },
  { id: 'statut-17-19', fr: 'Le soleil se couche, heure du dîner', kh: 'ថ្ងៃលិច ពេលស៊ីបាយល្ហឹម', ctx: 'commentaire 17h-19h' },
  { id: 'statut-19-22', fr: 'Soirée tranquille', kh: 'ពេលយប់ សម្រាកតូចតាច', ctx: 'commentaire 19h-22h' },
  { id: 'statut-22-5', fr: 'Tout le monde dort… chut 😉', kh: 'ម៉ោងគេងហើយ សុំកុំផ្ញើសារ', ctx: 'commentaire 22h-5h, ton affectueux/humoristique' },
  { id: 'wx-0', fr: 'Ciel dégagé', kh: 'អាកាសចំកណ្តាល', ctx: 'météo, code WMO 0' },
  { id: 'wx-1', fr: 'Peu nuageux', kh: 'ភ្លៀងតិច', ctx: 'météo, code WMO 1 (SUSPECT: semble dire "pluie légère")' },
  { id: 'wx-2', fr: 'Partiellement nuageux', kh: 'ពពកខ្លះ', ctx: 'météo, code WMO 2' },
  { id: 'wx-3', fr: 'Couvert', kh: 'ពពកគ្របដណ្តប់', ctx: 'météo, code WMO 3' },
  { id: 'wx-45', fr: 'Brouillard', kh: 'អាប់', ctx: 'météo, code WMO 45 (SUSPECT: semble dire "rance/stagnant")' },
  { id: 'wx-51', fr: 'Bruine légère', kh: 'ភ្លៀងស្រាល', ctx: 'météo, code WMO 51' },
  { id: 'wx-63', fr: 'Pluie', kh: 'ភ្លៀង', ctx: 'météo, code WMO 63' },
  { id: 'wx-71', fr: 'Neige', kh: 'ភ្រៀក', ctx: 'météo, code WMO 71 (SUSPECT: typo? mot inexistant?)' },
  { id: 'wx-80', fr: 'Averses', kh: 'ភ្លៀងផ្តេសផ្តាស', ctx: 'météo, code WMO 80' },
  { id: 'wx-95', fr: 'Orage', kh: 'ព្យុះកន្ត្រាក់', ctx: 'météo, code WMO 95' },
  { id: 'footer', fr: 'Fait avec amour, pour maman', kh: 'ធ្វើដោយក្តីស្រឡាញ់ សម្រាប់ម៉ែ', ctx: 'footer du site, destinataire: la mère de l\'épouse, personne âgée' },
];

const system = `Tu es un linguiste khmer natif (Cambodge, registre courant et chaleureux). On te donne des traductions khmères utilisées sur un site météo/horloges familial (France ↔ Cambodge), destiné à une FEMME ÂGÉE cambodgienne (la mère de l'épouse). Pour chaque chaîne : dis ce que le khmer dit LITTÉRALEMENT, verdict (OK / MALADROIT / FAUX), et si besoin une meilleure formulation khmère naturelle. Sois strict et honnête — l'objectif est de détecter les erreurs, typos et calques du français. Réponds UNIQUEMENT en JSON: {"items":[{"id":"...","litteral":"...","verdict":"OK|MALADROIT|FAUX","explication":"...","suggestion":"khmer corrigé ou chaîne identique si OK"}]}`;

const user = STRINGS.map(s => `${s.id} | attendu FR: "${s.fr}" | khmer actuel: "${s.kh}" | contexte: ${s.ctx}`).join('\n');

const r = await fetch(`https://${LOC}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${LOC}/publishers/google/models/${MODEL}:generateContent`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${await getAccessToken()}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: 'user', parts: [{ text: user }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 8192, thinkingConfig: { thinkingBudget: 0 } },
  }),
});
const d = await r.json();
if (!r.ok) { console.error('ERREUR API', r.status, JSON.stringify(d).slice(0, 300)); process.exit(1); }
let raw = (d?.candidates?.[0]?.content?.parts?.map(p => p.text ?? '').join('') ?? '').replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
let report;
try { report = JSON.parse(raw); } catch (e) {
  // fallback: premier bloc {...}
  const m = /\{[\s\S]*\}/.exec(raw);
  report = m ? JSON.parse(m[0]) : { items: [{ id: 'PARSE', litteral: raw.slice(0, 2000) }] };
}

const icon = v => v === 'OK' ? '✅' : v === 'FAUX' ? '❌' : '⚠️';
let md = `# Rapport — traductions khmères de deux-soleils\n\nModèle : ${MODEL} (Vertex AI) · ${new Date().toISOString()}\n\n`;
for (const it of report.items) {
  md += `## ${icon(it.verdict)} ${it.id} — ${it.verdict}\n`;
  md += `- Littéral : ${it.litteral}\n- Explication : ${it.explication}\n`;
  if (it.suggestion && it.suggestion !== STRINGS.find(s => s.id === it.id)?.kh)
    md += `- 💡 Suggestion : **${it.suggestion}**\n`;
  md += '\n';
}
mkdirSync(new URL('./rapport/', import.meta.url), { recursive: true });
writeFileSync(new URL('./rapport/rapport-traduction.md', import.meta.url), md);
console.log(md);
