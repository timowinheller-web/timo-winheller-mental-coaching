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
EMAIL = "info@timowinheller.de"

# (dateiname, Menü-Label oder None, <title>, Beschreibung)
PAGES = [
    ("index", "Start", "Mental Coaching Oberberg & online · Timo Winheller – Mentale Stärke",
     "Mentales Coaching für Leistung und mentale Stärke: Blockaden und Glaubenssätze, Stress, Ziele und Entscheidungen, Alltagsängste. Vor Ort in Reichshof (Oberberg, Gummersbach, Wiehl), Köln, Bergisch Gladbach – und bundesweit online. Kostenloses Erstgespräch."),
    ("ueber-mich", "Über mich", "Über mich · Timo Winheller – Macher statt Esoteriker",
     "Timo Winheller: Trader, Meister mit Führungspraxis, Neuro-Resonanz-Practitioner und -Master. Mentales Coaching aus der Praxis – in Reichshof und online."),
    ("angebot", "Angebot", "Angebot & Preise · Mental Coaching Timo Winheller",
     "Einzelsitzung 150 € (60 Min), Themenpaket „Mentale Stärke“ mit 4 Sitzungen für 600 €, kostenloses Erstgespräch (20 Min) mit Fragebogen. Online oder in Reichshof."),
    ("methoden", "Methoden", "Methoden: NLP, Neuro-Resonanz, Hypnose · Timo Winheller",
     "Wie mentales Coaching mit NLP, Neuro-Resonanz und Hypnose funktioniert: Blockaden lösen, Glaubenssätze umbauen, Zustände steuern – ohne Heilversprechen."),
    ("faq", "FAQ", "Fragen & Antworten · Mental Coaching Timo Winheller",
     "Kosten, Ablauf, online oder vor Ort, Termine, Abgrenzung zur Therapie – die häufigsten Fragen zum Mental Coaching bei Timo Winheller."),
    ("kontakt", "Kontakt", "Erstgespräch anfragen · Mental Coaching Timo Winheller",
     "Kostenloses 20-minütiges Erstgespräch anfragen – mit kurzem Fragebogen. Online oder in Reichshof, Termine abends und am Wochenende."),
    ("fallbeispiele", None, "Fallbeispiele · Mental Coaching Timo Winheller",
     "Vier anonymisierte Verläufe aus dem Coaching: Lampenfieber, Perfektionismus, Trading-Psychologie, Entscheidung im Umbruch."),
    ("danke", None, "Danke · Timo Winheller Mental Coaching", "Deine Anfrage ist angekommen."),
    ("impressum", None, "Impressum · Timo Winheller Mental Coaching", "Impressum und Anbieterkennzeichnung."),
    ("datenschutz", None, "Datenschutz · Timo Winheller Mental Coaching", "Datenschutzerklärung nach DSGVO."),
    ("agb", None, "AGB · Timo Winheller Mental Coaching", "Allgemeine Geschäftsbedingungen für Coaching-Leistungen."),
]
NAV = [(slug, label) for slug, label, _, _ in PAGES if label]
ICON_DIR = ROOT / "img" / "icons"
NO_STICKY = {"kontakt", "danke"}


def icon(name, extra_class=""):
    path = ICON_DIR / f"{name}.svg"
    if not path.exists():
        sys.exit(f"Icon fehlt: {name} (erwartet: img/icons/{name}.svg)")
    svg = re.sub(r"<!--.*?-->", "", path.read_text(), flags=re.S)
    inner = re.search(r"<svg[^>]*>(.*)</svg>", svg, re.S).group(1).strip()
    cls = ("ic " + extra_class).strip()
    return (f'<svg class="{cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{inner}</svg>')


def render_icons(html):
    return re.sub(r"\{\{icon:([a-z0-9-]+)\}\}", lambda m: icon(m.group(1)), html)


LOGO = ('<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><circle cx="32" cy="32" r="4.5" fill="currentColor"/>'
        '<path d="M32 18.5a13.5 13.5 0 0 1 13.5 13.5" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>'
        '<path d="M32 18.5A13.5 13.5 0 0 0 18.5 32" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".45"/>'
        '<path d="M32 8a24 24 0 0 1 24 24" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>'
        '<path d="M32 8A24 24 0 0 0 8 32" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".3"/>'
        '<path d="M32 56a24 24 0 0 1-24-24" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".55"/></svg>')


def brand():
    return ('<a class="brand" href="index.html" aria-label="Timo Winheller Mental Coaching – Startseite">' + LOGO +
            '<span class="brand__text"><span class="brand__name">TIMO WINHELLER</span><span class="brand__sub">MENTAL COACHING</span></span></a>')


JSON_LD = (
    '{"@context":"https://schema.org","@type":"ProfessionalService","name":"Timo Winheller Mental Coaching",'
    '"description":"Mentales Coaching für Leistung und mentale Stärke: Blockaden und Glaubenssätze, Stress und Selbstregulation, '
    'Ziele und Entscheidungen, Alltagsängste. NLP, Neuro-Resonanz und Hypnose. Vor Ort in Reichshof und bundesweit online.",'
    f'"url":"{BASE_URL}","email":"{EMAIL}","founder":{{"@type":"Person","name":"Timo Winheller"}},'
    '"address":{"@type":"PostalAddress","addressLocality":"Reichshof","addressRegion":"Nordrhein-Westfalen","addressCountry":"DE"},'
    '"areaServed":["Reichshof","Gummersbach","Wiehl","Oberbergischer Kreis","Köln","Bergisch Gladbach","Deutschland (online)"],'
    '"knowsAbout":["Mentaltraining","Trading-Psychologie","Mentaltraining Sport","NLP","Neuro-Resonanz","Hypnose"],'
    '"priceRange":"150 € pro Sitzung",'
    '"makesOffer":[{"@type":"Offer","name":"Einzelsitzung (60 Minuten)","price":"150","priceCurrency":"EUR"},'
    '{"@type":"Offer","name":"Themenpaket Mentale Stärke (4 Sitzungen)","price":"600","priceCurrency":"EUR"}]}'
)


def head(slug, title, desc):
    canonical = BASE_URL + ("" if slug == "index" else slug + ".html")
    return f"""<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#EDE4D8">
<link rel="canonical" href="{canonical}">
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{BASE_URL}img/kopf-natur.jpg">
<meta property="og:locale" content="de_DE">
<link rel="icon" href="img/logo.svg" type="image/svg+xml">
<link rel="preload" href="css/fonts/instrument-sans-normal-400-700.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="css/fonts/geist-mono-normal-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="css/style.css">
<script type="application/ld+json">{JSON_LD}</script>
</head>
<body>
<div class="progress" aria-hidden="true"></div>
<div class="cursor-glow" aria-hidden="true"></div>
"""


def nav(active):
    links, mobile = [], []
    for slug, label in NAV:
        cur = ' aria-current="page"' if slug == active else ""
        links.append(f'<li><a href="{slug}.html"{cur}>{label}</a></li>')
        mobile.append(f'<a href="{slug}.html"{cur}>{label}</a>')
    return f"""<header class="nav">
  <div class="nav__bar">
    {brand()}
    <ul class="nav__links">{"".join(links)}</ul>
    <div class="nav__right">
      <a class="btn btn--sm nav__cta" href="kontakt.html">Erstgespräch</a>
      <button class="nav__toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="mobilmenu">{icon("menu", "ic--menu")}{icon("x", "ic--x")}</button>
    </div>
  </div>
  <nav class="nav__menu glass" id="mobilmenu" aria-label="Menü">{"".join(mobile)}<a class="btn" href="kontakt.html">Kostenloses Erstgespräch</a></nav>
</header>
<main id="inhalt">
"""


def footer(slug):
    sticky = "" if slug in NO_STICKY else '<div class="sticky-cta glass"><a class="btn" href="kontakt.html">Kostenloses Erstgespräch</a></div>'
    return f"""</main>
<footer class="footer">
  <div class="wrap">
    <div class="footer__grid">
      <div class="footer__brand">{brand()}<p>Neuro-Mentalcoaching für Menschen, die viel tragen. Reichshof (Oberberg) und bundesweit online.</p></div>
      <div class="footer__col"><span class="footer__title">Seiten</span><a href="index.html">Start</a><a href="ueber-mich.html">Über mich</a><a href="angebot.html">Angebot</a><a href="methoden.html">Methoden</a><a href="faq.html">FAQ</a></div>
      <div class="footer__col"><span class="footer__title">Mehr</span><a href="fallbeispiele.html">Fallbeispiele</a><a href="kontakt.html">Erstgespräch</a><span class="ph">[Instagram-Link]</span></div>
      <div class="footer__col"><span class="footer__title">Kontakt</span><a href="mailto:{EMAIL}">{EMAIL}</a><span class="ph">[TELEFON]</span><span>Reichshof · Oberberg · online</span></div>
    </div>
    <p class="footer__region">Mental Coaching und Mentaltraining für Reichshof, Gummersbach, Wiehl und den Oberbergischen Kreis, für Köln und Bergisch Gladbach – und bundesweit online. Schwerpunkte: Leistung unter Druck, Trading-Psychologie, Mentaltraining für Sportler, Führung.</p>
    <div class="footer__bottom"><span>© <span id="jahr">2026</span> Timo Winheller Mental Coaching</span><span class="footer__legal"><a href="impressum.html">Impressum</a><a href="datenschutz.html">Datenschutz</a><a href="agb.html">AGB</a></span></div>
  </div>
</footer>
<button class="iconbtn totop" type="button" aria-label="Nach oben">{icon("arrow-up")}</button>
{sticky}
<script src="js/neural.js"></script>
<script src="js/main.js"></script>
</body>
</html>
"""


def main():
    for slug, _label, title, desc in PAGES:
        body = (ROOT / "parts" / f"{slug}.body.html").read_text()
        body = re.sub(r"\{\{include:([a-z0-9-]+)\}\}", lambda m: (ROOT / "parts" / f"_{m.group(1)}.html").read_text(), body)
        body = body.replace("{{BASE_URL}}", BASE_URL).replace("{{EMAIL}}", EMAIL)
        page = head(slug, title, desc) + nav(slug) + render_icons(body) + footer(slug)
        (ROOT / f"{slug}.html").write_text(page)
        print(f"gebaut: {slug}.html")


if __name__ == "__main__":
    main()
