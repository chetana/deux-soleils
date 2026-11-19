# Deux soleils ☀️

Site statique **public** — les heures, la météo et les levers/couchers de soleil des deux côtés de la famille :

- 🇫🇷 **Montévrain** (Seine-et-Marne, France) — `48.872, 2.754`
- 🇰🇭 **Trapeang Ampil**, district de Samraong Tong, province de Kampong Speu (Cambodge) — `11.467, 104.533`

> Live : https://soleils.chetana.fr

## Fonctionnalités

- 🕐 Horloges en direct des deux endroits (fuseaux `Europe/Paris` / `Asia/Phnom_Penh`), avec secondes
- 🌤️ **Météo en direct** via l'API [Open-Meteo](https://open-meteo.com) (gratuite, sans clé) : température, conditions (emoji + libellé khmer)
- ⏳ **Prévisions des 8 prochaines heures** pour chaque ville : heure locale, emoji, température, probabilité de pluie (💧 affichée à partir de 30 %) — même appel Open-Meteo, aucune clé supplémentaire
- ✈️ **Distance et temps de vol** entre les deux villes (9 892 km à vol d'oiseau, ~11 h), affichés près de l'avion
- 🌅/🌇 **Heures de lever et coucher du soleil** pour chaque ville, façon montre connectée
- 🎨 Ciel animé par carte : dégradé qui suit l'heure **locale** de chaque endroit (aube, matin, jour, coucher, crépuscule, nuit), soleil qui parcourt son arc en temps réel, lune et étoiles scintillantes la nuit, nuages qui défilent
- 💬 Statuts contextuels bilingues khmer/français (« ម៉ោងគេងហើយ 😴 / Il est l'heure de dormir »)
- 📱 Pensé **mobile-first** (empilé) ; passe en deux colonnes sur grand écran

## Stack

HTML + CSS + JS **purs**, zéro dépendance, zéro build. Le seul appel externe est l'API Open-Meteo (CORS ouvert, rafraîchie toutes les 10 min).

## Déploiement

Le site est servi par Caddy sur **chetbox** (VM Scaleway) et publié par **GitHub Actions** (workflow `.github/workflows/ci.yml`) :

- push sur `main` → publication sur chetbox (clé SSH dédiée, environnement `prod` qui attend l'approbation)
- à chaque changement d'assets : bumper `?v=N` de `style.css` / `app.js` dans `index.html` **et** le `CACHE` de `sw.js`
- rollback : onglet Actions → « Run workflow » (revenir à la version précédente)
