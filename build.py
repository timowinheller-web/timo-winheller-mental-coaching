#!/usr/bin/env python3
"""Baut die HTML-Seiten aus parts/*.body.html.

Aufruf im Projektordner:   python3 build.py

- <head>, Navigation und Footer stehen nur hier (einmal ändern, alle Seiten neu bauen).
- {{icon:name}}                → Lucide-Icon aus img/icons/name.svg (inline)
- {{img:name|Alt|klasse|opts}} → <picture> mit WebP/JPEG-Varianten (siehe tools/images.py); opts: eager, sizes=…
- {{include:name}}             → parts/_name.html
- {{if:KEY}}…{{endif}} / {{ifnot:KEY}}…{{endif}} → Block nur, wenn CONFIG[KEY] gesetzt (bzw. leer) ist
- {{KEY}}                      → Wert aus CONFIG, außerdem {{BASE_URL}} und {{EMAIL}}
- Zusätzlich entstehen sitemap.xml, robots.txt und .well-known/security.txt.
"""
import datetime
import html
import os
import re
import sys
import secrets
import subprocess
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent
BASE_URL = "https://timowinheller.de/"
EMAIL = "info@timowinheller.de"
NODE = "/opt/homebrew/bin/node" if os.path.exists("/opt/homebrew/bin/node") else "node"

# ---------------------------------------------------------------------------------------------
# Einstellungen, die du selbst pflegst. Leer = die zugehörigen Elemente werden nicht angezeigt.
# ---------------------------------------------------------------------------------------------
CONFIG = {
    # Qualifikation: muss zum Launch-Tag exakt den vorliegenden Zertifikaten entsprechen.
    "QUALI": "Neuro-Resonanz-Practitioner (Denys Scharnweber Akademie), Master-Ausbildung läuft, Abschluss April 2027",
    "QUALI_KURZ": "Neuro-Resonanz-Practitioner, Master in Ausbildung",
    # Porträt: Dateiname in img/ (z. B. "portrait.jpg"). Leer = Porträt-Block wird nicht angezeigt.
    "PORTRAIT": "",
    # Wendepunkt-Story für „Über mich" (2 bis 3 Sätze). Leer = Absatz wird nicht angezeigt.
    "WENDEPUNKT": "",
    # Videodienst für Online-Sitzungen (z. B. "Zoom" oder "Google Meet"). Leer = FAQ nennt keinen Dienst.
    "VIDEO_TOOL": "",
    # Online-Terminbuchung (z. B. https://cal.com/timo-winheller/erstgespraech oder Calendly).
    # Gesetzt: „Termin direkt buchen"-Buttons erscheinen zusätzlich zum Formular.
    "BOOKING_URL": "",
    # Geschäftliche Telefonnummer, wie sie angezeigt werden soll (z. B. "02296 123456") und als Link ("+492296123456")
    "PHONE": "",
    "PHONE_LINK": "",
    # WhatsApp-Business-Nummer international ohne + und Leerzeichen (z. B. "4915112345678")
    "WHATSAPP": "",
    # Instagram-Profil-URL
    "INSTAGRAM": "",
    # Cookieloses Analyse-Tool (Plausible, Umami, Fathom): komplettes <script>-Tag hier eintragen,
    # den Host zusätzlich in ANALYTICS_HOST (für die Content-Security-Policy). Beispiel:
    # '<script defer data-domain="timowinheller.de" src="https://plausible.io/js/script.tagged-events.js"></script>'
    "ANALYTICS_HTML": "",
    "ANALYTICS_HOST": "",
}

# Passwortschutz: steht in .password (gitignored) ein Passwort, werden alle Seiten damit verschlüsselt
# und hinter der Vorschalt-Seite „Hier entsteht etwas Neues" ausgeliefert. Datei leer/fehlend = offen.
PASSWORD = (ROOT / ".password").read_text().strip() if (ROOT / ".password").exists() else ""
# Salt bleibt stabil (.salt, gitignored), damit „Auf diesem Gerät merken" auch nach neuen Builds gilt.
SALT_FILE = ROOT / ".salt"
SALT = SALT_FILE.read_text().strip() if SALT_FILE.exists() else ""
if not SALT:
    SALT = secrets.token_hex(16)
    SALT_FILE.write_text(SALT + "\n")

TODAY = datetime.date.today().isoformat()
# Versionskennung für CSS/JS aus dem Dateiinhalt: Browser und CDN holen nach jeder Änderung die neue Datei.
import hashlib
GATE_V = hashlib.sha1((ROOT / "js/gate.js").read_bytes()).hexdigest()[:8]
ASSET_V = hashlib.sha1(b"".join((ROOT / f).read_bytes() for f in ("css/style.css", "js/main.js", "js/neural.js", "js/field.js", "js/theme.js"))).hexdigest()[:8]

# (dateiname, Menü-Label oder None, <title>, Beschreibung)
PAGES = [
    ("index", "Start", "Mental Coaching Oberberg & online · Timo Winheller",
     "Mental Coaching für Leistung unter Druck: Blockaden lösen, Stress regulieren, klar entscheiden. Führung, Finanzen & Investments, Sport. Reichshof (Oberberg), Köln und bundesweit online. Kostenloses Erstgespräch."),
    ("ueber-mich", "Über mich", "Über mich · Timo Winheller Mental Coaching",
     "Timo Winheller: Investor, Meister mit Führungspraxis, Neuro-Resonanz-Practitioner. Mental Coaching aus der Praxis, Macher statt Esoteriker. Reichshof und online."),
    ("angebot", "Angebot", "Angebot & Preise · Mental Coaching Reichshof & online",
     "Einzelsitzung 150 € (60 Min), Themenpaket „Mentale Stärke“ mit 4 Sitzungen für 600 €, kostenloses Erstgespräch (20 Min). Transparent, ohne Mindestlaufzeit. Online oder in Reichshof."),
    ("methoden", "Methoden", "Methoden: NLP, Neuro-Resonanz, Hypnose · Timo Winheller",
     "Wie Mental Coaching mit NLP, Neuro-Resonanz und Hypnose funktioniert: Blockaden lösen, Glaubenssätze umbauen, Zustände steuern, verständlich erklärt, ohne Heilversprechen."),
    ("faq", "FAQ", "Fragen & Antworten · Mental Coaching Timo Winheller",
     "Kosten, Ablauf, online oder vor Ort, Termine, Wirkung, Abgrenzung zur Therapie, die häufigsten Fragen zum Mental Coaching bei Timo Winheller, ehrlich beantwortet."),
    ("kontakt", "Kontakt", "Kostenloses Erstgespräch anfragen · Timo Winheller",
     "Kostenloses 20-minütiges Erstgespräch anfragen, mit kurzem Fragebogen. Online oder in Reichshof, Termine abends und am Wochenende. Persönliche Antwort innerhalb von 24 Stunden."),
    ("check", None, "Mentale-Stärke-Check: 10 Fragen, 2 Minuten · Timo Winheller",
     "Wie stark bremst dich dein Kopf gerade? 10 Aussagen, 2 Minuten, sofortige Einordnung mit konkreter Empfehlung. Läuft komplett im Browser, nichts wird gespeichert."),
    ("mentalcoaching-oberberg", None, "Mental Coaching Reichshof, Gummersbach, Wiehl & Köln",
     "Mental Coaching vor Ort im Oberbergischen Kreis: Reichshof, Gummersbach, Wiehl, Waldbröl, Bergneustadt, und für Köln, Bergisch Gladbach, Olpe. Alternativ per Video, bundesweit."),
    ("reset", None, "Der 3-Minuten-Reset: 3 Übungen für klare Entscheidungen",
     "Drei Übungen aus dem Mental Coaching, die sofort wirken: Atem-Anker 4-4-6, Fokus-Punkt und die Regel-Frage. Zum Ausdrucken und Mitnehmen."),
    ("fallbeispiele", None, "Fallbeispiele · Mental Coaching Timo Winheller",
     "Vier Beispielverläufe, wie Coaching wirken kann: Lampenfieber vor dem Vorstand, Perfektionismus, impulsive Anlageentscheidungen, Entscheidung im Umbruch."),
    ("danke", None, "Danke · Timo Winheller Mental Coaching", "Deine Anfrage ist angekommen."),
    ("impressum", None, "Impressum · Timo Winheller Mental Coaching", "Impressum und Anbieterkennzeichnung."),
    ("datenschutz", None, "Datenschutz · Timo Winheller Mental Coaching", "Datenschutzerklärung nach DSGVO."),
    ("agb", None, "AGB · Timo Winheller Mental Coaching", "Allgemeine Geschäftsbedingungen für Coaching-Leistungen."),
    ("404", None, "Seite nicht gefunden · Timo Winheller Mental Coaching", "Diese Seite gibt es nicht."),
]
NAV = [(slug, label) for slug, label, _, _ in PAGES if label]
ICON_DIR = ROOT / "img" / "icons"
NO_STICKY = {"kontakt", "danke", "check", "404"}
NOINDEX = {"danke", "404"}
NOT_IN_SITEMAP = {"danke", "404"}


# ---------------------------------------------------------------------------------------------
# Bausteine
# ---------------------------------------------------------------------------------------------
def icon(name, extra_class=""):
    path = ICON_DIR / f"{name}.svg"
    if not path.exists():
        sys.exit(f"Icon fehlt: {name} (erwartet: img/icons/{name}.svg)")
    svg = re.sub(r"<!--.*?-->", "", path.read_text(), flags=re.S)
    inner = re.search(r"<svg[^>]*>(.*)</svg>", svg, re.S).group(1).strip()
    cls = ("ic " + extra_class).strip()
    return (f'<svg class="{cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{inner}</svg>')


def picture(name, alt="", cls="", opts=""):
    """<picture> mit WebP (687/420) und JPEG-Fallback. opts: 'eager' (Hero), 'sizes=…'."""
    for f in (f"{name}.jpg", f"{name}.webp", f"{name}-420.webp", f"{name}-420.jpg"):
        if not (ROOT / "img" / f).exists():
            sys.exit(f"Bildvariante fehlt: img/{f}, bitte python3 tools/images.py ausführen")
    o = [x.strip() for x in opts.split(",") if x.strip()]
    eager = "eager" in o
    sizes = next((x[6:] for x in o if x.startswith("sizes=")), "(max-width: 700px) 100vw, 50vw")
    load = 'fetchpriority="high"' if eager else 'loading="lazy" decoding="async"'
    clsattr = f' class="{cls}"' if cls else ""
    return (f'<picture><source type="image/webp" srcset="img/{name}-420.webp 420w, img/{name}.webp 687w" sizes="{sizes}">'
            f'<img{clsattr} src="img/{name}.jpg" srcset="img/{name}-420.jpg 420w, img/{name}.jpg 687w" sizes="{sizes}" '
            f'width="687" height="1024" alt="{html.escape(alt, quote=True)}" {load}></picture>')


def render_tokens(body):
    body = re.sub(r"\{\{include:([a-z0-9-]+)\}\}", lambda m: (ROOT / "parts" / f"_{m.group(1)}.html").read_text(), body)
    # Bedingte Blöcke (nicht verschachtelt)
    def cond(m):
        neg, key, inner = m.group(1) == "ifnot", m.group(2), m.group(3)
        val = CONFIG.get(key, "")
        return inner if (bool(val) != neg) else ""
    body = re.sub(r"\{\{(if|ifnot):([A-Z_]+)\}\}(.*?)\{\{endif\}\}", cond, body, flags=re.S)
    body = re.sub(r"\{\{img:([a-z0-9-]+)\|([^|}]*)\|?([^|}]*)\|?([^}]*)\}\}", lambda m: picture(*m.groups()), body)
    body = re.sub(r"\{\{icon:([a-z0-9-]+)\}\}", lambda m: icon(m.group(1)), body)
    body = body.replace("{{BASE_URL}}", BASE_URL).replace("{{EMAIL}}", EMAIL)
    for key, val in CONFIG.items():
        body = body.replace("{{" + key + "}}", val)
    return body


def brand():
    return ('<a class="brand" href="index.html" aria-label="Timo Winheller Mental Coaching, Startseite">'
            '<img class="brand__mark logo-light" src="img/logo-mark-64.png" alt="" width="103" height="24">'
            '<img class="brand__mark logo-dark" src="img/logo-mark-64-dark.png" alt="" width="103" height="24">'
            '<span class="brand__text"><span class="brand__name"><span class="brand__first">TIMO</span> WINHELLER</span>'
            '<span class="brand__sub"><span class="brand__accent">MIND &amp;</span> <span class="brand__accent2">PERFORMANCE</span></span></span></a>')


def brand_full(width=240):
    h = round(width * 551 / 1671)
    return (f'<a class="brand-full" href="index.html" aria-label="Timo Winheller Mental Coaching, Startseite">'
            f'<img class="logo-light" src="img/logo-480.png" alt="Timo Winheller Mental Coaching" width="{width}" height="{h}">'
            f'<img class="logo-dark" src="img/logo-480-dark.png" alt="Timo Winheller Mental Coaching" width="{width}" height="{h}"></a>')


def json_ld(slug, title, body):
    same_as = f',"sameAs":["{CONFIG["INSTAGRAM"]}"]' if CONFIG["INSTAGRAM"] else ""
    phone = f',"telephone":"{CONFIG["PHONE_LINK"]}"' if CONFIG["PHONE_LINK"] else ""
    org = (
        '{"@context":"https://schema.org","@type":"ProfessionalService","@id":"' + BASE_URL + '#business",'
        '"name":"Timo Winheller Mental Coaching","alternateName":"Mental Coaching Timo Winheller",'
        '"description":"Mental Coaching für Leistung und mentale Stärke: Blockaden und Glaubenssätze, Stress und Selbstregulation, '
        'Ziele und Entscheidungen, Alltagsängste. NLP, Neuro-Resonanz und Hypnose. Vor Ort in Reichshof (Oberberg) und bundesweit online.",'
        f'"url":"{BASE_URL}","image":"{BASE_URL}img/og.jpg","logo":"{BASE_URL}img/logo-full.png","email":"{EMAIL}"{phone}{same_as},'
        '"founder":{"@type":"Person","name":"Timo Winheller","jobTitle":"Mental Coach (Neuro-Resonanz-Practitioner)"},'
        '"address":{"@type":"PostalAddress","addressLocality":"Reichshof","addressRegion":"Nordrhein-Westfalen","postalCode":"51580","addressCountry":"DE"},'
        '"areaServed":[{"@type":"City","name":"Reichshof"},{"@type":"City","name":"Gummersbach"},{"@type":"City","name":"Wiehl"},'
        '{"@type":"City","name":"Waldbröl"},{"@type":"City","name":"Bergneustadt"},{"@type":"AdministrativeArea","name":"Oberbergischer Kreis"},'
        '{"@type":"City","name":"Köln"},{"@type":"City","name":"Bergisch Gladbach"},{"@type":"City","name":"Olpe"},{"@type":"Country","name":"Deutschland"}],'
        '"knowsAbout":["Mentaltraining","Mental Coaching","Leistung unter Druck","Finanz- und Investment-Psychologie","Mentaltraining Sport","Führungskräfte-Coaching","NLP","Neuro-Resonanz","Hypnose"],'
        '"openingHoursSpecification":[{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday"],"opens":"17:00","closes":"21:00"},'
        '{"@type":"OpeningHoursSpecification","dayOfWeek":["Saturday","Sunday"],"opens":"09:00","closes":"18:00"}],'
        '"priceRange":"150 € pro Sitzung",'
        '"makesOffer":[{"@type":"Offer","name":"Kostenloses Erstgespräch (20 Minuten, online)","price":"0","priceCurrency":"EUR"},'
        '{"@type":"Offer","name":"Einzelsitzung (60 Minuten)","price":"150","priceCurrency":"EUR"},'
        '{"@type":"Offer","name":"Themenpaket Mentale Stärke (4 Sitzungen)","price":"600","priceCurrency":"EUR"}]}'
    )
    blocks = [org]
    if slug != "index":
        blocks.append('{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":['
                      f'{{"@type":"ListItem","position":1,"name":"Start","item":"{BASE_URL}"}},'
                      f'{{"@type":"ListItem","position":2,"name":"{html.escape(title.split(" · ")[0].split(": ")[0])}","item":"{BASE_URL}{slug}.html"}}]}}')
    if slug == "faq":
        qa = re.findall(r'<button class="acc__btn"[^>]*><span>(.*?)</span>.*?<div class="acc__panel">(.*?)</div>', body, flags=re.S)
        items = []
        for q, a in qa:
            q = html.unescape(re.sub(r"<[^>]+>", "", q)).strip()
            a = html.unescape(re.sub(r"<[^>]+>", "", a)).strip()
            if "[" in a:  # Platzhalter nicht an Google geben
                continue
            items.append('{"@type":"Question","name":' + _js(q) + ',"acceptedAnswer":{"@type":"Answer","text":' + _js(a) + '}}')
        blocks.append('{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[' + ",".join(items) + ']}')
    return "".join(f'<script type="application/ld+json">{b}</script>\n' for b in blocks)


def _js(s):
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ") + '"'


def csp():
    extra = (" " + CONFIG["ANALYTICS_HOST"]) if CONFIG["ANALYTICS_HOST"] else ""
    return ("default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; "
            f"script-src 'self'{extra}; connect-src 'self'{extra}; form-action 'self' https://api.web3forms.com; "
            "base-uri 'self'; object-src 'none'; frame-src 'none'")


def bg_lines():
    """Fließende Linien nach dem Logo-Schwung als leiser Seitenhintergrund."""
    paths = []
    for i in range(14):
        y = 60 + i * 68; a = 46 + (i % 4) * 9; sh = (i * 37) % 120
        paths.append(f'<path d="M-100 {y} C {180+sh} {y-a}, {380+sh} {y-a}, {560+sh} {y+a*0.6} S {980+sh} {y+a*1.1}, {1180+sh} {y-a*0.4} S {1560} {y-a*0.9}, {1760} {y-a*0.2}"/>')
    return ('<div class="bg-lines" aria-hidden="true"><svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">'
            '<g fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">' + "".join(paths) + '</g></svg></div>')


def head(slug, title, desc, body):
    canonical = BASE_URL + ("" if slug == "index" else slug + ".html")
    robots = '<meta name="robots" content="noindex,nofollow">' if slug in NOINDEX else '<meta name="robots" content="index,follow,max-image-preview:large">'
    hero_preload = '<link rel="preload" as="image" href="img/kopf-natur.webp" type="image/webp" fetchpriority="high">' if slug == "index" else ""
    return f"""<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="{csp()}">
<title>{title}</title>
<meta name="description" content="{desc}">
{robots}
<meta name="author" content="Timo Winheller">
<meta name="theme-color" content="#06090F">
<link rel="canonical" href="{canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Timo Winheller Mental Coaching">
<meta property="og:locale" content="de_DE">
<meta property="og:url" content="{canonical}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{BASE_URL}img/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Timo Winheller Mental Coaching, Dein Gehirn kann umlernen">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{BASE_URL}img/og.jpg">
<link rel="icon" href="img/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="img/apple-touch-icon.png">
<link rel="preload" href="css/fonts/bricolage-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="css/fonts/geist-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="css/fonts/geist-mono-normal-400.woff2" as="font" type="font/woff2" crossorigin>
{hero_preload}
<script src="js/theme.js?v={ASSET_V}"></script>
<link rel="stylesheet" href="css/style.css?v={ASSET_V}">
{json_ld(slug, title, body)}{CONFIG["ANALYTICS_HTML"]}
</head>
<body>
<div class="bg" aria-hidden="true"></div>
{bg_lines()}
<a class="skip" href="#inhalt">Zum Inhalt springen</a>
"""


def nav(active):
    links, mobile = [], []
    for slug, label in NAV:
        cur = ' aria-current="page"' if slug == active else ""
        links.append(f'<li><a href="{slug}.html"{cur}>{label}</a></li>')
        mobile.append(f'<a href="{slug}.html"{cur}>{label}</a>')
    mobile.append(f'<a href="check.html"{" aria-current=\"page\"" if active == "check" else ""}>Mentale-Stärke-Check</a>')
    return f"""<header class="nav">
  <div class="nav__bar">
    {brand()}
    <nav aria-label="Hauptmenü"><ul class="nav__links">{"".join(links)}</ul></nav>
    <div class="nav__right">
      <button class="iconbtn theme-toggle" type="button" aria-label="Dunkle Ansicht" aria-pressed="false">{icon("moon", "ic--moon")}{icon("sun", "ic--sun")}</button>
      <a class="btn btn--sm nav__cta" href="kontakt.html">Erstgespräch</a>
      <button class="nav__toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="mobilmenu">{icon("menu", "ic--menu")}{icon("x", "ic--x")}</button>
    </div>
  </div>
  <nav class="nav__menu glass" id="mobilmenu" aria-label="Menü">{"".join(mobile)}<a class="btn" href="kontakt.html">Kostenloses Erstgespräch</a></nav>
</header>
<main id="inhalt" tabindex="-1">
"""


def footer(slug):
    sticky = "" if slug in NO_STICKY else '<div class="sticky-cta glass"><a class="btn" href="kontakt.html" data-track="CTA Sticky">Kostenloses Erstgespräch</a></div>'
    phone = f'<a href="tel:{CONFIG["PHONE_LINK"]}">{CONFIG["PHONE"]}</a>' if CONFIG["PHONE"] else ""
    wa = f'<a href="https://wa.me/{CONFIG["WHATSAPP"]}" rel="noopener" target="_blank">WhatsApp</a>' if CONFIG["WHATSAPP"] else ""
    insta = f'<a href="{CONFIG["INSTAGRAM"]}" rel="noopener" target="_blank">Instagram</a>' if CONFIG["INSTAGRAM"] else ""
    return f"""</main>
<footer class="footer">
  <div class="wrap">
    <div class="footer__grid">
      <div class="footer__brand">{brand_full(220)}<p>Mental Coaching für Menschen, die unter Druck liefern müssen. Reichshof (Oberberg) und bundesweit online.</p><a class="btn btn--sm btn--secondary" href="kontakt.html">Kostenloses Erstgespräch</a></div>
      <div class="footer__col"><span class="footer__title">Seiten</span><a href="index.html">Start</a><a href="ueber-mich.html">Über mich</a><a href="angebot.html">Angebot &amp; Preise</a><a href="methoden.html">Methoden</a><a href="faq.html">Fragen &amp; Antworten</a></div>
      <div class="footer__col"><span class="footer__title">Werkzeuge</span><a href="check.html">Mentale-Stärke-Check</a><a href="reset.html">Der 3-Minuten-Reset</a><a href="fallbeispiele.html">Fallbeispiele</a><a href="mentalcoaching-oberberg.html">Coaching in Oberberg &amp; Köln</a>{insta}</div>
      <div class="footer__col"><span class="footer__title">Kontakt</span><a href="mailto:{EMAIL}">{EMAIL}</a>{phone}{wa}<span>Reichshof, Oberbergischer Kreis</span><span>Termine abends und am Wochenende</span></div>
    </div>
    <p class="footer__region">Mental Coaching und Mentaltraining für Reichshof, Gummersbach, Wiehl, Waldbröl, Bergneustadt und den Oberbergischen Kreis, für Köln, Bergisch Gladbach und Olpe, und bundesweit online. Schwerpunkte: Leistung unter Druck, Führung, Finanzen und Investments, Mentaltraining für Sportler.</p>
    <div class="footer__bottom"><span>© <span id="jahr">2026</span> Timo Winheller Mental Coaching</span><span class="footer__legal"><a href="impressum.html">Impressum</a><a href="datenschutz.html">Datenschutz</a><a href="agb.html">AGB</a>{'<a href="index.html?logout=1">Vorschau beenden</a>' if PASSWORD else ''}</span></div>
  </div>
</footer>
<button class="iconbtn totop" type="button" aria-label="Nach oben">{icon("arrow-up")}</button>
{sticky}
<script src="js/neural.js?v={ASSET_V}"></script>
<script src="js/main.js?v={ASSET_V}"></script>
</body>
</html>
"""


def gate_shell(slug, title, payload):
    """Vorschalt-Seite mit verschlüsseltem Inhalt der eigentlichen Seite."""
    return f"""<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Bald online: Timo Winheller Mental Coaching</title>
<meta name="description" content="Hier entsteht etwas Neues: Timo Winheller Mental Coaching, Reichshof und online.">
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#06090F">
<link rel="icon" href="img/favicon.png" type="image/png">
<script src="js/theme.js"></script>
<link rel="stylesheet" href="css/style.css">
</head>
<body>
<div class="bg" aria-hidden="true"></div>
<main class="gate">
  <div class="panel gate__panel">
    <div class="glass gate__glass">
      {brand_full(260)}
      <span class="eyebrow">Bald</span>
      <h1 class="display">Hier entsteht<br>etwas Neues.</h1>
      <p class="lead">Timo Winheller · Mental Coaching für Leistung und mentale Stärke. Reichshof und bundesweit online. Die Seite ist noch in Arbeit.</p>
      <form id="gate" class="gate__form" autocomplete="off">
        <label class="field__label" for="pw">Zugang für Testleser</label>
        <div class="gate__row"><input class="input" type="password" id="pw" name="pw" placeholder="Passwort" autocomplete="current-password" required><button class="btn" type="submit">Öffnen</button></div>
        <label class="checkbox"><input type="checkbox" id="remember"><span class="checkbox__box" aria-hidden="true"></span><span>Auf diesem Gerät merken</span></label>
        <p class="gate__error caption" hidden>Das war nicht das richtige Passwort.</p>
      </form>
      <p class="caption faint">Fragen? <a href="mailto:{EMAIL}">{EMAIL}</a></p>
    </div>
    <div class="gate__media"><img src="img/kopf-natur.jpg" alt="" width="687" height="1024"></div>
  </div>
</main>
<script id="payload" type="text/plain" data-salt="{SALT}">{payload}</script>
<script src="js/gate.js?v={GATE_V}"></script>
</body>
</html>
"""


def encrypt(page):
    r = subprocess.run([NODE, str(ROOT / "tools" / "encrypt.js"), SALT], input=page, capture_output=True, text=True,
                       env={**os.environ, "SITE_PASSWORD": PASSWORD})
    if r.returncode != 0:
        sys.exit("Verschlüsselung fehlgeschlagen: " + r.stderr)
    return r.stdout.strip()


def field_svg():
    """Feines Neuronen-Netz als Hintergrundgrafik (deterministisch, ca. 30 KB)."""
    import math, random
    rnd = random.Random(7)
    W, H = 1600, 1000
    pts = [(rnd.random() * W, rnd.random() * H) for _ in range(170)]
    lines = []
    for i, (x1, y1) in enumerate(pts):
        for x2, y2 in pts[i + 1:]:
            d = math.hypot(x1 - x2, y1 - y2)
            if d < 150:
                lines.append(f'<line x1="{x1:.0f}" y1="{y1:.0f}" x2="{x2:.0f}" y2="{y2:.0f}" stroke-opacity="{(1 - d / 150) * .55:.2f}"/>')
    dots = "".join(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{rnd.uniform(1.4, 2.8):.1f}"/>' for x, y in pts)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice">'
           f'<g stroke="#8DA6FF" stroke-width="1" fill="none">{"".join(lines)}</g><g fill="#8DA6FF" fill-opacity=".55">{dots}</g></svg>')
    (ROOT / "img" / "field.svg").write_text(svg)


def sitemap():
    urls = []
    for slug, _l, _t, _d in PAGES:
        if slug in NOT_IN_SITEMAP:
            continue
        loc = BASE_URL + ("" if slug == "index" else slug + ".html")
        prio = "1.0" if slug == "index" else ("0.8" if slug in {"angebot", "kontakt", "ueber-mich", "methoden", "check", "mentalcoaching-oberberg"} else "0.5")
        urls.append(f"  <url><loc>{loc}</loc><lastmod>{TODAY}</lastmod><priority>{prio}</priority></url>")
    (ROOT / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "\n".join(urls) + "\n</urlset>\n")
    (ROOT / "robots.txt").write_text(f"User-agent: *\n{'Disallow: /' if PASSWORD else 'Allow: /'}\nDisallow: /danke.html\n\nSitemap: {BASE_URL}sitemap.xml\n")
    wk = ROOT / ".well-known"
    wk.mkdir(exist_ok=True)
    exp = (datetime.date.today() + datetime.timedelta(days=365)).isoformat()
    (wk / "security.txt").write_text(f"Contact: mailto:{EMAIL}\nExpires: {exp}T00:00:00.000Z\nPreferred-Languages: de, en\nCanonical: {BASE_URL}.well-known/security.txt\n")


def main():
    for slug, _label, title, desc in PAGES:
        body = render_tokens((ROOT / "parts" / f"{slug}.body.html").read_text())
        if re.search(r"\{\{[a-z]", body):
            sys.exit(f"Unaufgelöster Platzhalter in {slug}: " + re.search(r"\{\{[a-z][^}]*\}\}", body).group(0))
        page = head(slug, title, desc, body) + nav(slug) + body + footer(slug)
        if PASSWORD:
            page = gate_shell(slug, title, encrypt(page))
        (ROOT / f"{slug}.html").write_text(page)
        print(f"gebaut: {slug}.html" + (" (verschlüsselt)" if PASSWORD else ""))
    field_svg()
    sitemap()
    print("sitemap.xml, robots.txt, .well-known/security.txt geschrieben")
    print("Passwortschutz:", "AN, Passwort aus .password" if PASSWORD else "AUS (keine .password-Datei)")


if __name__ == "__main__":
    main()
