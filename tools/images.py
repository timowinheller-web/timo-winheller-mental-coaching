#!/usr/bin/env python3
"""Erzeugt aus img/*.jpg (687x1024) die Web-Varianten: WebP in 687 und 420 px Breite plus JPEG 420 px.
Aufruf: python3 tools/images.py   (nur nötig, wenn Bilder neu/ersetzt wurden)"""
import pathlib
from PIL import Image
IMG = pathlib.Path(__file__).resolve().parent.parent / "img"
SKIP = {"og"}
for src in sorted(IMG.glob("*.jpg")):
    if src.stem in SKIP or src.stem.endswith("-420"):
        continue
    im = Image.open(src).convert("RGB")
    w, h = im.size
    im.save(src.with_suffix(".webp"), "WEBP", quality=82, method=6)
    small = im.resize((420, round(h * 420 / w)), Image.LANCZOS)
    small.save(IMG / f"{src.stem}-420.webp", "WEBP", quality=80, method=6)
    small.save(IMG / f"{src.stem}-420.jpg", "JPEG", quality=84, optimize=True, progressive=True)
    print(f"{src.name}: {w}x{h} -> webp, 420er webp/jpg")
