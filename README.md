# Timo Winheller Mental Coaching – Website

Statische Website (HTML/CSS/JS, kein Build-Tool nötig zum Hosten) im Design-System
**„Mitternacht & Ember"**: Nachtblau-Grund, Sand-Neutrale, ein Orange (`--ember-500`), Glas-Panels,
Instrument Serif + Manrope.

- Live (GitHub Pages): https://timowinheller-web.github.io/timo-winheller-mental-coaching/
- Repository: https://github.com/timowinheller-web/timo-winheller-mental-coaching

## Struktur

| Pfad | Inhalt |
|---|---|
| `index.html` … `datenschutz.html` | Die 8 fertigen Seiten (werden aus `parts/` gebaut) |
| `parts/<seite>.body.html` | **Seiteninhalte – hier Texte ändern** |
| `build.py` | Baut alle Seiten: setzt `<head>`, Navigation, Footer und Icons ein |
| `css/style.css` | Komponenten (Buttons, Karten, Nav, Hero …) |
| `css/tokens/*.css` | Design-Tokens: Farben, Typografie, Abstände, Radien, Schatten, Motion |
| `css/fonts/` | Schriften lokal (Manrope, Instrument Serif) – kein Google-Fonts-Aufruf |
| `img/*.jpg` | Die 10 Markenfotos (komprimiert), `img/icons/` Lucide-Icons, `img/logo.svg` Favicon |
| `js/main.js` | Mobile-Menü, Akkordeon, Formular |
| `desing/` | Design-System-Export (Tokens, Komponenten, Guidelines). **Nicht im Repo** (.gitignore) |

## Darstellung: Tag/Nacht und Akzentfarbe

Standard ist das helle Tag-Schema. Der Schalter in der Navigation wechselt zu Nacht und zwischen den
Akzenten Orange, Petrol und Violett (Auswahl bleibt per localStorage erhalten). Alle Farben stehen in
`css/tokens/theme.css`; neue Akzente = ein weiterer `:root[data-accent="…"]`-Block plus ein Punkt in `build.py`.

## Texte ändern und veröffentlichen

1. Text in `parts/<seite>.body.html` ändern (Navigation/Footer/Titel in `build.py`)
2. Seiten neu bauen:

```bash
python3 build.py
```

3. Veröffentlichen (GitHub Pages baut in 1–3 Minuten):

```bash
git add -A && git commit -m "Texte angepasst" && git push
```

Icons: `{{icon:name}}` in den Parts, Name = Lucide-Icon in `img/icons/` (weitere von https://lucide.dev als SVG dort ablegen).

## Platzhalter (vor Veröffentlichung ausfüllen)

Platzhalter sind orange gestrichelt hervorgehoben (`<span class="ph">…</span>`). Suche:

```bash
grep -n 'class="ph"' parts/*.html build.py
```

| Platzhalter | Wo |
|---|---|
| `[E-MAIL]`, `[TELEFON]`, `[Instagram-Link]` | `build.py` (Footer), kontakt (auch `data-mail="[E-MAIL]"`), impressum, datenschutz |
| `[GESCHÄFTSADRESSE]`, `[PLZ]` | impressum, datenschutz – bewusst keine Privatadresse (Postfach/Geschäftsadresse) |
| `[NR-Master …]` | methode, ueber-mich – Abschluss bestätigen oder Satz anpassen |
| `[Fachrichtung]`, `[Kurzbiografie …]`, `[JAHR / Status]` | ueber-mich |
| `[DATUM]`, `[HOSTING-ANBIETER]`, `[Formulardienst]`, `[Videodienst]`, Löschfristen | datenschutz, agb |
| AGB | `parts/agb.body.html` ist eine Vorlage (Ausfallregel 24 h, Widerruf) – anwaltlich prüfen lassen |

Feste Inhalte laut Konzept (24.09.2026): Reichshof (Oberberg) als Ort, Erstgespräch 20 Min + Fragebogen,
150 €/60 Min, Themenpaket „Mentale Stärke“ 4 × = 600 €, Kleinunternehmer (§ 19 UStG), Termine abends/Wochenende.
Heilkunde-Grenze: keine Behandlung von Angststörungen/Phobien/Trauma anbieten – Wording bleibt bei Coaching.
Der Fragebogen mit Ausschlusskriterien läuft per E-Mail, nicht über die Website (keine Gesundheitsdaten im Webformular).

## Kontaktformular aktivieren

Aktuell öffnet das Formular das E-Mail-Programm des Besuchers (`data-fallback="mailto"`).
Für echten Versand: Konto bei Formspark/Formspree anlegen, in `parts/kontakt.body.html`
`action="#"` durch die Dienst-URL ersetzen, `data-fallback="mailto"` entfernen, `python3 build.py`,
und in `parts/datenschutz.body.html` Abschnitt 4 den Dienst nennen.

## Eigene Domain

Im Repo unter Settings → Pages → „Custom domain" eintragen und beim Domain-Anbieter einen CNAME
auf `timowinheller-web.github.io` setzen. Danach `BASE_URL` in `build.py` anpassen und neu bauen.

## Rechtlicher Hinweis

Impressum und Datenschutzerklärung sind sorgfältig erstellte Vorlagen, aber keine Rechtsberatung.
Vor Veröffentlichung von einem Anwalt oder Generator (z. B. e-recht24.de) gegenprüfen lassen.
