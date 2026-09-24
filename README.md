# Timo Winheller Mental Coaching – Website

Statische Website (HTML/CSS/JS, kein Build-Tool nötig zum Hosten). Design „Creme & Tinte“: Creme-Grund im
dunklen Rahmen, große Versal-Headline (Inter Tight), Manrope als Textschrift, Haarlinien, schwarze Pill-Buttons,
ein Akzent (Moosgrün). Hero: animierter Mesh-Kopf mit Blättern (js/neural.js).

- Live (GitHub Pages): https://timowinheller-web.github.io/timo-winheller-mental-coaching/
- Repository: https://github.com/timowinheller-web/timo-winheller-mental-coaching

## Struktur

| Pfad | Inhalt |
|---|---|
| `index.html` … `datenschutz.html` | Die 8 fertigen Seiten (werden aus `parts/` gebaut) |
| `parts/<seite>.body.html` | **Seiteninhalte – hier Texte ändern** |
| `build.py` | Baut alle Seiten: setzt `<head>`, Navigation, Footer und Icons ein |
| `css/style.css` | Komponenten (Buttons, Karten, Nav, Hero …) |
| `css/fonts/` | Schriften lokal (Inter Tight, Manrope) – kein Google-Fonts-Aufruf |
| `img/*.jpg` | Die 10 Markenfotos (komprimiert), `img/icons/` Lucide-Icons, `img/logo.svg` Favicon |
| `js/main.js` | Mobile-Menü, Karussell, Akkordeon, Selbstcheck, Atem-Übung, Formular (Web3Forms/Mail-Fallback) |
| `desing/` | älterer Design-System-Export (nicht mehr genutzt). **Nicht im Repo** (.gitignore) |

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

## Kontaktformular aktivieren (Web3Forms)

1. Auf https://web3forms.com einen Access Key für info@timowinheller.de anlegen (kostenlos).
2. In `parts/kontakt.body.html` den Wert von `access_key` (`[WEB3FORMS-ACCESS-KEY]`) durch den Key ersetzen, `python3 build.py`.
3. In `parts/datenschutz.body.html` Abschnitt 4 die Anbieterangaben zu Web3Forms ergänzen.
Solange der Platzhalter steht, öffnet das Formular das E-Mail-Programm des Besuchers mit allen Angaben (Fallback).

## Eigene Domain

Im Repo unter Settings → Pages → „Custom domain" eintragen und beim Domain-Anbieter einen CNAME
auf `timowinheller-web.github.io` setzen. Danach `BASE_URL` in `build.py` anpassen und neu bauen.

## Rechtlicher Hinweis

Impressum und Datenschutzerklärung sind sorgfältig erstellte Vorlagen, aber keine Rechtsberatung.
Vor Veröffentlichung von einem Anwalt oder Generator (z. B. e-recht24.de) gegenprüfen lassen.
