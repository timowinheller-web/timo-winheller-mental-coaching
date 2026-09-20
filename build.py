#!/usr/bin/env python3
"""Baut die HTML-Seiten aus parts/*.body.html.

Aufruf im Projektordner:   python3 build.py

- <head>, Navigation und Footer stehen nur hier (einmal ändern, alle Seiten neu bauen).
- {{icon:name}} in den Parts wird durch das Lucide-Icon aus img/icons/name.svg ersetzt.
"""
import re
import sys
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent
BASE_URL = "https://timowinheller-web.github.io/timo-winheller-mental-coaching/"

# (dateiname, Menü-Label oder None, <title>, Beschreibung)
PAGES = [
    ("index", "Start", "Timo Winheller · Mental Coaching",
     "Mentales Coaching für Menschen, die viel tragen. Neuro-Resonanz, online und in Wiesbaden. Kostenfreies Erstgespräch."),
    ("angebot", "Angebot", "Angebot & Preise · Timo Winheller Mental Coaching",
     "Einzelsitzung, 5er-Paket, 3-Monats-Begleitung. Transparente Preise, kostenfreies Erstgespräch."),
    ("methode", "Methode", "Methode: Neuro-Resonanz · Timo Winheller Mental Coaching",
     "Wie Neuro-Resonanz-Coaching funktioniert: NLP, Körperarbeit und Meditation, verständlich erklärt."),
    ("fallbeispiele", None, "Fallbeispiele · Timo Winheller Mental Coaching",
     "Vier anonymisierte Verläufe aus dem Coaching: Ausgangslage, Vorgehen, Ergebnis."),
    ("ueber-mich", "Über mich", "Über mich · Timo Winheller Mental Coaching",
     "Timo Winheller, Neuro-Resonanz-Practitioner: Weg, Ausbildung, Haltung."),
    ("kontakt", "Kontakt", "Erstgespräch anfragen · Timo Winheller Mental Coaching",
     "Kostenfreies 30-minütiges Erstgespräch anfragen. Online oder in Wiesbaden."),
    ("impressum", None, "Impressum · Timo Winheller Mental Coaching", "Impressum und Anbieterkennzeichnung."),
    ("datenschutz", None, "Datenschutz · Timo Winheller Mental Coaching", "Datenschutzerklärung nach DSGVO."),
]
NAV = [(slug, label) for slug, label, _, _ in PAGES if label]
ICON_DIR = ROOT / "img" / "icons"


def icon(name, extra_class=""):
    path = ICON_DIR / f"{name}.svg"
    if not path.exists():
        sys.exit(f"Icon fehlt: {name} (erwartet: img/icons/{name}.svg)")
    svg = re.sub(r"<!--.*?-->", "", path.read_text(), flags=re.S)
    inner = re.search(r"<svg[^>]*>(.*)</svg>", svg, re.S).group(1).strip()
    cls = ("ic " + extra_class).strip()
    return (f'<svg class="{cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{inner}</svg>')


def render_icons(html):
    return re.sub(r"\{\{icon:([a-z0-9-]+)\}\}", lambda m: icon(m.group(1)), html)


LOGO_MARK = (
    '<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">'
    '<circle cx="32" cy="32" r="4.5" fill="#FF6A1F"/>'
    '<path d="M32 18.5a13.5 13.5 0 0 1 13.5 13.5" stroke="#FF6A1F" stroke-width="3" stroke-linecap="round"/>'
    '<path d="M32 18.5A13.5 13.5 0 0 0 18.5 32" stroke="#FF6A1F" stroke-width="3" stroke-linecap="round" opacity=".45"/>'
    '<path d="M32 8a24 24 0 0 1 24 24" stroke="#FF6A1F" stroke-width="3" stroke-linecap="round"/>'
    '<path d="M32 8A24 24 0 0 0 8 32" stroke="#FF6A1F" stroke-width="3" stroke-linecap="round" opacity=".3"/>'
    '<path d="M32 56a24 24 0 0 1-24-24" stroke="#FF6A1F" stroke-width="3" stroke-linecap="round" opacity=".55"/>'
    '</svg>'
)


def logo():
    return ('<a class="logo" href="index.html" aria-label="Timo Winheller Mental Coaching – Startseite">'
            + LOGO_MARK +
            '<span class="logo__text"><span class="logo__name">TIMO WINHELLER</span>'
            '<span class="logo__sub">MENTAL COACHING</span></span></a>')


def head(slug, title, desc):
    canonical = BASE_URL + ("" if slug == "index" else slug + ".html")
    return f"""<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#070C17">
<link rel="canonical" href="{canonical}">
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{BASE_URL}img/open-door.jpg">
<meta property="og:locale" content="de_DE">
<link rel="icon" href="img/logo.svg" type="image/svg+xml">
<link rel="preload" href="css/fonts/instrument-serif-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="css/fonts/manrope-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="css/style.css">
</head>
<body>
<canvas class="neural neural--bg" data-neural="field" aria-hidden="true"></canvas>
"""


def nav(active):
    links, mobile = [], []
    for slug, label in NAV:
        cur = ' aria-current="page"' if slug == active else ""
        links.append(f'<li><a href="{slug}.html"{cur}>{label}</a></li>')
        mobile.append(f'<a href="{slug}.html"{cur}>{label}</a>')
    return f"""<header class="nav">
  <div class="nav__pill">
    {logo()}
    <ul class="nav__links">{"".join(links)}</ul>
    <div class="nav__right">
      <a class="btn btn--sm nav__cta" href="kontakt.html">Erstgespräch</a>
      <button class="nav__toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="mobilmenu">{icon("menu", "ic--menu")}{icon("x", "ic--x")}</button>
    </div>
  </div>
  <nav class="nav__menu glass" id="mobilmenu" aria-label="Menü">{"".join(mobile)}<a class="btn" href="kontakt.html">Kostenfreies Erstgespräch</a></nav>
</header>
<main id="inhalt">
"""


def footer():
    return f"""</main>
<footer class="footer">
  <div class="wrap">
    <div class="footer__grid">
      <div class="footer__brand">{logo()}<p>Mentales Coaching für Menschen, die viel tragen. Wiesbaden und online.</p></div>
      <div class="footer__col"><span class="footer__title">Angebot</span><a href="angebot.html">Angebot &amp; Preise</a><a href="methode.html">Methode</a><a href="fallbeispiele.html">Fallbeispiele</a></div>
      <div class="footer__col"><span class="footer__title">Mehr</span><a href="ueber-mich.html">Über mich</a><a href="index.html#fragen">Fragen</a><a href="kontakt.html">Erstgespräch</a></div>
      <div class="footer__col"><span class="footer__title">Kontakt</span><span class="ph">[E-MAIL]</span><span class="ph">[TELEFON]</span><span>Praxis Wiesbaden · online</span></div>
    </div>
    <div class="footer__bottom"><span>© <span id="jahr">2026</span> Timo Winheller Mental Coaching</span><span class="footer__legal"><a href="impressum.html">Impressum</a><a href="datenschutz.html">Datenschutz</a></span></div>
  </div>
</footer>
<script src="js/neural.js"></script>
<script src="js/main.js"></script>
</body>
</html>
"""


def main():
    for slug, _label, title, desc in PAGES:
        body = (ROOT / "parts" / f"{slug}.body.html").read_text()
        page = head(slug, title, desc) + nav(slug) + render_icons(body) + footer()
        (ROOT / f"{slug}.html").write_text(page)
        print(f"gebaut: {slug}.html")


if __name__ == "__main__":
    main()
