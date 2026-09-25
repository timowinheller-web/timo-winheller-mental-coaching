# Timo Winheller Mental Coaching – Website

Statische Website (HTML/CSS/JS, kein Framework, keine externen Skripte). Design „Stone & Moss“ nach dem
Claude-Design-Export (Stein-Beige, Moosgrün als einziger Akzent, Glas-Panels, Instrument Sans für Display und Text,
Geist Mono für Labels). Alle Schriften liegen lokal, kein Google-Fonts-Aufruf.

- Live (GitHub Pages): https://timowinheller-web.github.io/timo-winheller-mental-coaching/
- Repository: https://github.com/timowinheller-web/timo-winheller-mental-coaching
- Vor dem Launch lesen: [docs/LAUNCH-CHECKLISTE.md](docs/LAUNCH-CHECKLISTE.md), Hintergrund: [docs/STRATEGIE-UND-SEO.md](docs/STRATEGIE-UND-SEO.md)

## Seiten

| Datei | Zweck |
|---|---|
| `index.html` | Start: Versprechen, Für wen, Selbstcheck, Themen, interaktives Gehirn, Ablauf, Angebot, Über-mich-Teaser, Atem-Übung, Praxis, FAQ, CTA |
| `ueber-mich.html`, `angebot.html`, `methoden.html`, `faq.html`, `kontakt.html` | Hauptseiten (im Menü) |
| `check.html` | Mentale-Stärke-Check: 10 Fragen, Auswertung im Browser, Ergebnis wird optional mit der Anfrage mitgeschickt |
| `reset.html` | Der 3-Minuten-Reset: drei Übungen, druckbar (Freebie) |
| `mentalcoaching-oberberg.html` | Regionale Seite für Reichshof, Gummersbach, Wiehl, Köln (lokales SEO) |
| `fallbeispiele.html`, `danke.html`, `404.html` | Fallbeispiele, Danke-Seite nach dem Formular, Fehlerseite |
| `impressum.html`, `datenschutz.html`, `agb.html` | Rechtliches (Vorlagen, anwaltlich prüfen lassen) |
| `sitemap.xml`, `robots.txt`, `.well-known/security.txt` | werden vom Build erzeugt |

## Struktur

| Pfad | Inhalt |
|---|---|
| `parts/<seite>.body.html` | **Seiteninhalte – hier Texte ändern.** `parts/_brain.html` (Gehirn) und `parts/_cta.html` (CTA-Band) werden per `{{include:name}}` eingefügt |
| `build.py` | Baut alle Seiten: `<head>` mit SEO-/Social-Tags, strukturierte Daten, Navigation, Footer, Sitemap. **Oben in `CONFIG` stehen Telefon, Buchungslink, WhatsApp, Instagram, Analyse-Tool.** |
| `css/style.css`, `css/fonts.css`, `css/fonts/` | Stylesheet und lokale Schriften |
| `js/main.js` | Menü, Karussell, Akkordeon, Reveal, Selbstcheck, Atem-Übung, Check-Auswertung, Formular, Ereignis-Tracking |
| `js/neural.js` | Interaktives Gehirn (Areale, Methoden, ziehbare Blockade; bewegt sich nur bei Interaktion) |
| `js/gate.js`, `tools/encrypt.js` | Passwortschutz (siehe unten) |
| `img/*.jpg` + `*.webp` + `*-420.*` | 10 Bildmotive mit Web-Varianten (`python3 tools/images.py` erzeugt sie neu), `img/og.jpg` Social-Vorschaubild, `img/apple-touch-icon.png`, `img/logo.svg`, `img/icons/` Lucide-Icons, `img/portrait-platzhalter.svg` |
| `tools/og.html` | Vorlage für das Social-Vorschaubild (1200×630), mit Chrome headless gerendert |
| `docs/` | Launch-Checkliste, Strategie und SEO-Notizen |

## Texte ändern und veröffentlichen

1. Text in `parts/<seite>.body.html` ändern (Menü/Footer/Titel/Beschreibungen in `build.py`, Liste `PAGES`).
2. Bauen:

```bash
python3 build.py
```

3. Veröffentlichen (GitHub Pages baut in 1–3 Minuten):

```bash
git add -A && git commit -m "Texte angepasst" && git push
```

Platzhalter im Markup: `{{icon:name}}` (Lucide-Icon aus `img/icons/`), `{{img:name|Alt-Text|css-klasse|eager,sizes=…}}`
(erzeugt `<picture>` mit WebP/JPEG), `{{if:BOOKING_URL}}…{{endif}}` (nur wenn der Wert in `CONFIG` gesetzt ist), `{{EMAIL}}`, `{{BASE_URL}}`.

Neue Bilder: JPEG mit 687 × 1024 px unter `img/<name>.jpg` ablegen, dann `python3 tools/images.py` (erzeugt WebP und 420-px-Varianten).

## Einstellungen (`build.py` → `CONFIG`)

| Schlüssel | Wirkung, wenn gesetzt |
|---|---|
| `BOOKING_URL` | „Termin direkt buchen“-Buttons auf Start, Angebot, Kontakt und im CTA-Band (z. B. cal.com, Calendly) |
| `PHONE`, `PHONE_LINK` | Telefonnummer im Footer, auf Kontakt und in den strukturierten Daten |
| `WHATSAPP` | WhatsApp-Link auf Kontakt und im Footer (Datenschutz-Abschnitt erscheint automatisch) |
| `INSTAGRAM` | Instagram-Link im Footer und `sameAs` in den strukturierten Daten |
| `ANALYTICS_HTML`, `ANALYTICS_HOST` | Cookieloses Analyse-Tool (Plausible/Umami); Ereignisse wie „Anfrage gesendet“ oder „Check abgeschlossen“ werden dann automatisch gemeldet. Ohne Tool passiert nichts. |

## Platzhalter (vor Veröffentlichung ausfüllen)

Platzhalter sind gelb gestrichelt hervorgehoben (`<span class="ph">…</span>`):

```bash
grep -n 'class="ph"' parts/*.html
```

Die vollständige Liste mit Fundorten steht in [docs/LAUNCH-CHECKLISTE.md](docs/LAUNCH-CHECKLISTE.md).

## Passwortschutz („Hier entsteht etwas Neues“)

Solange die Datei `.password` ein Passwort enthält, baut `python3 build.py` jede Seite **verschlüsselt**:
Besucher sehen nur die Vorschalt-Seite mit Passwortfeld. Erst das richtige Passwort entschlüsselt die
eigentliche Seite im Browser (AES-256-GCM, Schlüssel per PBKDF2 aus dem Passwort). Im öffentlichen
GitHub-Repo liegt damit nur Chiffretext.

- Passwort ändern: `.password` editieren → `python3 build.py` → `git push`. (`.password` und `.salt` sind gitignored.)
- Der Browser merkt sich den Schlüssel für die Sitzung; mit „Auf diesem Gerät merken“ dauerhaft. Abmelden: Footer-Link „Vorschau beenden“ (`index.html?logout=1`).
- Schutz aufheben (Launch): `.password` leeren oder löschen → `python3 build.py` → `git push`. `robots.txt` wechselt dann automatisch auf `Allow: /`.
- Im geschützten Modus tragen alle Seiten `noindex,nofollow`.

## Kontaktformular aktivieren (Web3Forms)

1. Auf https://web3forms.com einen Access Key für info@timowinheller.de anlegen (kostenlos).
2. In `parts/kontakt.body.html` den Wert von `access_key` (`[WEB3FORMS-ACCESS-KEY]`) ersetzen, `python3 build.py`.
3. In `parts/datenschutz.body.html` Abschnitt 4 die Anbieterangaben ergänzen.
Solange der Platzhalter steht, öffnet das Formular das E-Mail-Programm des Besuchers mit allen Angaben (Fallback).

## Eigene Domain und EU-Hosting

GitHub Pages: Settings → Pages → „Custom domain“, beim Domain-Anbieter CNAME auf `timowinheller-web.github.io`.
IONOS Deploy Now ist ebenfalls verbunden (Workflows in `.github/`) und hostet in Deutschland; für den Launch ist das
die bessere Wahl (DSGVO). Danach `BASE_URL` in `build.py` auf `https://timowinheller.de/` setzen und neu bauen.

## Technik, die „unsichtbar“ mitläuft

Content-Security-Policy (nur eigene Skripte/Stile), keine Cookies, kein Cookie-Banner nötig, Skip-Link und
Tastaturbedienung, sichtbare Fokus-Ringe, WCAG-AA-Kontraste, `prefers-reduced-motion`, WebP mit Größenvarianten und
Lazy Loading, vorgeladene Schriften und Hero-Bild, strukturierte Daten (ProfessionalService, FAQPage, BreadcrumbList),
Open-Graph-/Twitter-Karten, Sitemap, robots.txt, security.txt, eigene 404-Seite, Druck-Stylesheet.

## Rechtlicher Hinweis

Impressum, Datenschutzerklärung und AGB sind sorgfältig erstellte Vorlagen, aber keine Rechtsberatung.
Vor Veröffentlichung von einem Anwalt oder Generator (z. B. e-recht24.de) gegenprüfen lassen.
