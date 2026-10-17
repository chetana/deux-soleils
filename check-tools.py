#!/usr/bin/env python3
try:
    import PIL
    print("PIL OK", PIL.__version__)
except Exception as e:
    print("PIL KO:", e)
import shutil
for t in ["convert", "rsvg-convert", "inkscape", "magick"]:
    print(t, shutil.which(t))
