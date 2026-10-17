/* Deux soleils — Montévrain ↔ Trapeang Ampil
   Heures live (tz IANA => DST France géré automatiquement), météo + soleils via Open-Meteo. */
(function(){
'use strict';

var PLACES = {
  fr: { tz:'Europe/Paris',    lat:48.8721, lon:2.7542 },
  kh: { tz:'Asia/Phnom_Penh', lat:11.467,  lon:104.533 }
};

/* Statuts contextuels [debut, fin[, kh, fr] — heure locale du lieu */
var SLOTS = [
  [ 5,  7, 'បានភ្ញាក់ពីដេក ពន្លឺព្រឹកថ្មី 🌅',  'Le soleil se lève, nouvelle journée 🌅'],
  [ 7,  9, 'អាហារព្រឹក និងរៀបចំខ្លួន ☕',     'Petit-déjeuner, on se prépare ☕'],
  [ 9, 12, 'ពេលព្រឹក ធ្វើការងារ 💪',            'Bon matin, au travail 💪'],
  [12, 14, 'អាហារថ្ងៃត្រង់ និងសម្រាក 🍚',       'Déjeuner et pause méritée 🍚'],
  [14, 17, 'ពេលរសៀល បន្តកិច្ចការ ☀️',            'Bel après-midi ☀️'],
  [17, 19, 'ថ្ងៃលិច ពេលស៊ីបាយល្ហឹម 🌇',         'Le soleil se couche, c\'est l\'heure du dîner 🌇'],
  [19, 22, 'ពេលយប់ សម្រាកតូចតាច 🌙',          'Soirée tranquille 🌙'],
  [22,  5, 'ម៉ោងគេងហើយ សុំកុំផ្ញើសារ 😉',      'Tout le monde dort… chut 😉']
];

/* Weather codes Open-Meteo -> [emoji, fr, km] */
var WX = {
  0:['☀️','Ciel dégagé','អាកាសចំកណ្តាល'], 1:['🌤️','Peu nuageux','ភ្លៀងតិច'],
  2:['⛅','Partiellement nuageux','ពពកខ្លះ'], 3:['☁️','Couvert','ពពកគ្របដណ្តប់'],
  45:['🌫️','Brouillard','អាប់'], 48:['🌫️','Brouillard givrant','អាប់'],
  51:['🌦️','Bruine légère','ភ្លៀងស្រាល'], 53:['🌦️','Bruine','ភ្លៀងស្រាល'], 55:['🌦️','Bruine forte','ភ្លៀងស្រាលខ្លាំង'],
  61:['🌧️','Pluie légère','ភ្លៀងស្រាល'], 63:['🌧️','Pluie','ភ្លៀង'], 65:['🌧️','Pluie forte','ភ្លៀងខ្លាំង'],
  71:['🌨️','Neige','ភ្រៀក'], 73:['🌨️','Neige','ភ្រៀក'], 75:['❄️','Neige forte','ភ្រៀកខ្លាំង'],
  80:['🌦️','Averses','ភ្លៀងផ្តេសផ្តាស'], 81:['🌧️','Averses','ភ្លៀង'], 82:['⛈️','Fortes averses','ភ្លៀងខ្លាំង'],
  95:['⛈️','Orage','ព្យុះកន្ត្រាក់'], 96:['⛈️','Orage','ព្យុះកន្ត្រាក់'], 99:['⛈️','Orage grêle','ព្យុះកន្ត្រាក់']
};

var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
var state = { fr:{}, kh:{} };
var CACHE_KEY = 'deux-soleils-v1';

function fmt(tz, opts, d){
  try { return new Intl.DateTimeFormat('fr-FR', Object.assign({timeZone:tz}, opts)).format(d || new Date()); }
  catch(e){ return '--'; }
}
function parseHM(iso){
  if (!iso) return null;
  var m = /T(\d{2}):(\d{2})/.exec(iso);
  return m ? (+m[1])*60 + (+m[2]) : null;
}
function minsToHM(v){
  if (v == null) return '--:--';
  v = ((v % 1440) + 1440) % 1440;
  var h = Math.floor(v/60), m = v % 60;
  return (h<10?'0':'')+h+':'+(m<10?'0':'')+m;
}
function wxLabel(code){ return WX[code] || ['🌡️','Météo','អាកាសធាតុ']; }

/* Offset local du lieu en minutes (gère DST automatiquement) */
function offsetMin(tz, d){
  d = d || new Date();
  var parts = new Intl.DateTimeFormat('en-US', {timeZone:tz, hour12:false,
    year:'numeric', month:'2-digit', day:'2-digit',
    hour:'2-digit', minute:'2-digit', second:'2-digit'}).formatToParts(d);
  var o = {};
  parts.forEach(function(p){ o[p.type] = p.value; });
  var asUTC = Date.UTC(o.year, o.month-1, o.day, o.hour % 24, o.minute, o.second);
  return Math.round((asUTC - d.getTime()) / 60000);
}

/*__PART2__*/
