# Deux soleils ☀️

Site statique **public** — les heures, la météo et les levers/couchers de soleil des deux côtés de la famille :

- 🇫🇷 **Montévrain** (Seine-et-Marne, France) — `48.872, 2.754`
- 🇰🇭 **Trapeang Ampil**, district de Samraong Tong, province de Kampong Speu (Cambodge) — `11.467, 104.533`

> Live : https://soleils.chetana.fr

## Fonctionnalités

- 🕐 Horloges en direct des deux endroits (fuseaux `Europe/Paris` / `Asia/Phnom_Penh`), avec secondes
- 🌤️ **Météo en direct** via l'API [Open-Meteo](https://open-meteo.com) (gratuite, sans clé) : température, conditions (emoji + libellé khmer)
- 🌅/🌇 **Heures de lever et coucher du soleil** pour chaque ville, façon montre connectée
- 🎨 Ciel animé par carte : dégradé qui suit l'heure **locale** de chaque endroit (aube, matin, jour, coucher, crépuscule, nuit), soleil qui parcourt son arc en temps réel, lune et étoiles scintillantes la nuit, nuages qui défilent
- 💬 Statuts contextuels bilingues khmer/français (« ម៉ោងគេងហើយ 😴 / Il est l'heure de dormir »)
- 📱 Pensé **mobile-first** (empilé) ; passe en deux colonnes sur grand écran

## Stack

HTML + CSS + JS **purs**, zéro dépendance, zéro build. Le seul appel externe est l'API Open-Meteo (CORS ouvert, 15 min de rafraîchissement).

## Déploiement

Le site est servi par Caddy sur **chetbox** (VM Scaleway) via le bloc générique des sites statiques :

```bash
# publier = déposer le dossier dans /srv/static/sites/
ssh root@chetbox "rm -rf /srv/static/sites/soleils && mkdir -p /srv/static/sites/soleils"
scp -r index.html style.css app.js root@chetbox:/srv/static/sites/soleils/
```

`soleils.chetana.fr` sert automatiquement `/srv/static/sites/soleils/` (voir `infra/box/Caddyfile` du repo `chet-workspace`).
