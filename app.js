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
  0:['☀️','Ciel dégagé','មេឃស្រឡះ'], 1:['🌤️','Peu nuageux','មានពពកតិចតួច'],
  2:['⛅','Partiellement nuageux','ពពកខ្លះ'], 3:['☁️','Couvert','ពពកគ្របដណ្តប់'],
  45:['🌫️','Brouillard','អ័ព្ទ'], 48:['🌫️','Brouillard givrant','អ័ព្ទ'],
  51:['🌦️','Bruine légère','ភ្លៀងស្រាល'], 53:['🌦️','Bruine','ភ្លៀងស្រាល'], 55:['🌦️','Bruine forte','ភ្លៀងស្រាលខ្លាំង'],
  61:['🌧️','Pluie légère','ភ្លៀងស្រាល'], 63:['🌧️','Pluie','ភ្លៀង'], 65:['🌧️','Pluie forte','ភ្លៀងខ្លាំង'],
  71:['🌨️','Neige','ព្រិល'], 73:['🌨️','Neige','ព្រិល'], 75:['❄️','Neige forte','ព្រិលខ្លាំង'],
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

/* Horloge + ciel + statut pour un lieu */
function updatePlace(k){
  var p = PLACES[k], now = new Date();
  document.getElementById('time-'+k).textContent = fmt(p.tz, {hour:'2-digit', minute:'2-digit'}, now);
  document.getElementById('sec-'+k).textContent  = fmt(p.tz, {second:'2-digit'}, now);

  var h = parseInt(fmt(p.tz, {hour:'2-digit', hour12:false}, now), 10);
  var m = parseInt(fmt(p.tz, {minute:'2-digit'}, now), 10);
  var lh = h + m/60;

  for (var i=0; i<SLOTS.length; i++){
    var sl = SLOTS[i];
    var inSlot = sl[0] < sl[1] ? (lh >= sl[0] && lh < sl[1]) : (lh >= sl[0] || lh < sl[1]);
    if (inSlot){
      document.getElementById('status-'+k).textContent  = sl[2];
      document.getElementById('statusfr-'+k).textContent = sl[3];
      break;
    }
  }

  /* Position du soleil/lune sur son arc, à partir des heures réelles lever/coucher */
  var st = state[k], frac = null, isSun = true;
  if (st && st.rise != null && st.set != null){
    var mins = lh*60, rise = st.rise, set = st.set;
    if (set < rise) set += 1440;
    if (mins >= rise && mins <= set){
      frac = (mins - rise) / (set - rise);
    } else {
      isSun = false;
      var nStart = set, nEnd = rise + 1440, nm = mins < rise ? mins + 1440 : mins;
      if (nm >= nStart && nm <= nEnd) frac = (nm - nStart) / (nEnd - nStart);
    }
  }
  var orb = document.getElementById('orb-'+k);
  var sky = document.getElementById('sky-'+k);
  var f = (frac == null) ? 0.5 : Math.min(Math.max(frac, 0), 1);

  orb.classList.toggle('is-sun', isSun);
  orb.classList.toggle('is-moon', !isSun);
  orb.style.left = (8 + f*84) + '%';
  orb.style.top  = (8 + (1 - Math.sin(Math.PI*f))*30) + 'px';

  /* Phase du ciel : nuit / dorée (lever-coucher) / jour */
  var phase = 'night';
  if (isSun) phase = (f < .12 || f > .88) ? 'golden' : 'day';
  sky.dataset.phase = phase;

  /* Point sur l'arc solaire */
  var dot = document.getElementById('arcdot-'+k);
  if (dot){
    if (frac != null){
      dot.setAttribute('cx', (10 + f*180).toFixed(1));
      dot.setAttribute('cy', (62 - 52*Math.sin(Math.PI*f)).toFixed(1));
      dot.style.opacity = 1;
    } else dot.style.opacity = 0;
  }
}

/* Étoiles scintillantes */
function makeStars(k){
  var box = document.getElementById('stars-'+k), n = RM ? 0 : 42;
  var frag = document.createDocumentFragment();
  for (var i=0; i<n; i++){
    var s = document.createElement('i');
    s.className = 'star';
    var sz = (Math.random()*1.8 + .8).toFixed(1);
    s.style.cssText = 'left:'+(Math.random()*100).toFixed(1)+'%;top:'+(Math.random()*70).toFixed(1)
      + '%;width:'+sz+'px;height:'+sz+'px;--d:'+(2+Math.random()*4).toFixed(1)
      + 's;animation-delay:'+(-Math.random()*6).toFixed(1)+'s';
    frag.appendChild(s);
  }
  box.appendChild(frag);
}

/* Écart horaire dynamique Cambodge - France (5h été / 6h hiver) — compact */
function showGap(){
  var g = offsetMin(PLACES.kh.tz) - offsetMin(PLACES.fr.tz);
  var el = document.getElementById('gapline');
  if (el) el.innerHTML = '<span class="fi fi-kh"></span> = <span class="fi fi-fr"></span> <b>+' + (g/60) + 'h</b>';
}

/* Météo Open-Meteo (gratuite, sans clé, CORS ouvert) + cache 10 min */
function paint(k){
  var st = state[k] || {}, wx = wxLabel(st.code);
  if (st.code != null) document.getElementById('wx-'+k).textContent = wx[0] + ' ' + wx[2];
  document.getElementById('temp-'+k).textContent = st.temp != null ? Math.round(st.temp) + '°C' : '—';
  document.getElementById('rise-'+k).textContent = minsToHM(st.rise);
  document.getElementById('set-'+k).textContent  = minsToHM(st.set);
}
function apply(all){
  state = all;
  ['fr','kh'].forEach(paint);
  var up = document.getElementById('updated');
  if (up) up.textContent = 'Météo & soleils : Open-Meteo · màj ' + fmt('Europe/Paris', {hour:'2-digit', minute:'2-digit'}) + ' (Paris)';
}
function fetchWeather(){
  var cached = null;
  try { cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch(e){}
  if (cached && Date.now() - cached.at < 10*60*1000){ apply(cached); return; }
  var done = 0, fresh = { at: Date.now(), fr: {}, kh: {} };
  ['fr','kh'].forEach(function(k){
    var p = PLACES[k];
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + p.lat + '&longitude=' + p.lon
      + '&current=temperature_2m,weather_code,is_day&daily=sunrise,sunset&timezone=auto&forecast_days=1';
    fetch(url).then(function(r){ return r.json(); }).then(function(j){
      var cur = j.current || {}, day = j.daily || {};
      fresh[k] = {
        temp: cur.temperature_2m, code: cur.weather_code, isDay: cur.is_day === 1,
        rise: parseHM((day.sunrise || [])[0]), set: parseHM((day.sunset || [])[0])
      };
      if (++done === 2){
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(fresh)); } catch(e){}
        apply(fresh);
      }
    }).catch(function(){
      if (++done === 2){ if (cached) apply(cached); }
    });
  });
  if (cached){ state = cached; ['fr','kh'].forEach(paint); }
}

/* Boot */
makeStars('fr'); makeStars('kh');
updatePlace('fr'); updatePlace('kh');
showGap();
setInterval(function(){ updatePlace('fr'); updatePlace('kh'); }, 1000);
setInterval(showGap, 60000);
fetchWeather();
setInterval(fetchWeather, 10*60*1000);
})();

