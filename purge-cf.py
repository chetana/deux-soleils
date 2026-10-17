#!/usr/bin/env python3
"""Purge Cloudflare cache pour soleils.chetana.fr — n'affiche jamais les secrets."""
import json, sys, urllib.request

SEC = "/root/.config/chetana-secrets.json"
d = json.load(open(SEC))

def walk(o, path=""):
    if isinstance(o, dict):
        for k, v in o.items():
            yield from walk(v, path + "/" + str(k))
    else:
        yield path, o

# Cherche token CF + zone id
token = zone = None
for p, v in walk(d):
    lp = p.lower()
    if isinstance(v, str):
        if ("cloudflare" in lp or "cf" == lp.split("/")[-1]) and ("token" in lp or "key" in lp or "api" in lp):
            token = v
            print("token trouvé à:", p)
        if "zone" in lp and ("id" in lp):
            zone = v
            print("zone id trouvé à:", p)

if not token:
    print("Clés disponibles contenant cf/cloudflare :")
    for p, v in walk(d):
        if "cloudflare" in p.lower() or p.lower().endswith("/cf"):
            print("  ", p)
    sys.exit(1)

if not zone:
    # récupère la zone via l'API
    req = urllib.request.Request("https://api.cloudflare.com/client/v4/zones?name=chetana.fr",
                                 headers={"Authorization": "Bearer " + token})
    zone = json.load(urllib.request.urlopen(req))["result"][0]["id"]
    print("zone id via API:", zone)

body = json.dumps({"files": [
    "https://soleils.chetana.fr/og.jpg",
    "https://soleils.chetana.fr/",
    "https://soleils.chetana.fr/index.html"
]}).encode()
req = urllib.request.Request(
    f"https://api.cloudflare.com/client/v4/zones/{zone}/purge_cache",
    data=body, headers={"Authorization": "Bearer " + token, "Content-Type": "application/json"})
res = json.load(urllib.request.urlopen(req))
print("purge:", res.get("success"), res.get("errors"))
