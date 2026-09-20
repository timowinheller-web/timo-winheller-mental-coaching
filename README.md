# Timo Winheller Mental Coaching – Website

Statische Website ohne Build-Tool. Alle Seiten liegen fertig als `.html` im Hauptordner
und können direkt auf jeden Webspace hochgeladen werden.

## Struktur

| Datei | Inhalt |
|---|---|
| `index.html` | Startseite |
| `angebot.html` | Pakete, Preise, Ablauf |
| `methode.html` | Neuro-Resonanz erklärt |
| `fallbeispiele.html` | 4 anonymisierte Fallbeispiele |
| `ueber-mich.html` | Werdegang, Zertifikat |
| `kontakt.html` | Formular für Erstgespräch |
| `impressum.html` | § 5 DDG |
| `datenschutz.html` | DSGVO |
| `css/style.css` | Design (Farben oben in `:root`) |
| `js/main.js` | Mobile-Menü, Formular |
| `img/` | Platzhalter-Grafiken |
| `parts/*.body.html` + `build.sh` | Quelltexte der Seiteninhalte + Generator (optional) |

## Texte ändern

Zwei Wege:

**A – direkt (einfach):** Die fertige `.html`-Datei im Editor öffnen und den Text ändern.
Nachteil: Header und Footer stehen in allen 8 Dateien; eine Änderung am Menü musst du 8× machen.

**B – über den Generator:** Inhalt in `parts/<seite>.body.html` ändern, Menü/Footer in `build.sh`,
dann im Terminal:

```bash
bash build.sh parts .
```

Das schreibt alle 8 Seiten neu.

## Platzhalter (vor Veröffentlichung ausfüllen)

Alle Platzhalter sind gelb hinterlegt (`<span class="placeholder">…</span>`). Suche im Ordner nach `[`:

```bash
grep -n "placeholder" *.html
```

| Platzhalter | Wo |
|---|---|
| `[STADT]`, `[STRASSE NR]`, `[PLZ]` | Footer (alle Seiten), angebot, kontakt, impressum, datenschutz |
| `[E-MAIL]`, `[TELEFON]` | Footer, kontakt (auch `data-mail="[E-MAIL]"` im Formular!), impressum, datenschutz |
| `[JAHR]` | ueber-mich (Ausbildungsjahr) |
| `[Kurzbiografie …]` | ueber-mich |
| `[Variante A/B Umsatzsteuer]` | impressum, angebot (Preishinweis) |
| `[HOSTING-ANBIETER]`, `[DATUM]`, `[Formulardienst]`, `[Videodienst]`, `[Aufsichtsbehörde]` | datenschutz |
| `img/portrait.svg` | durch echtes Foto ersetzen (z. B. `portrait.jpg`, dann `src` in index + ueber-mich anpassen) |
| `img/zertifikat.svg` | durch Scan ersetzen |

## Kontaktformular aktivieren

Aktuell öffnet das Formular das E-Mail-Programm des Besuchers (`data-fallback="mailto"`).
Für echten Versand ohne E-Mail-Programm:

1. Konto bei einem Formulardienst anlegen (Formspark ~ kostenlos für kleine Mengen, Formspree, oder Netlify Forms wenn bei Netlify gehostet).
2. In `kontakt.html`: `action="#"` durch die URL des Dienstes ersetzen und `data-fallback="mailto"` entfernen.
3. In `datenschutz.html` Abschnitt 4 den Platzhalter zum Formulardienst ausfüllen.

## Live-Website & Veröffentlichen

- Repository: https://github.com/timowinheller-web/timo-winheller-mental-coaching
- Live (GitHub Pages): https://timowinheller-web.github.io/timo-winheller-mental-coaching/

Jede Änderung wird veröffentlicht, sobald sie auf `main` gepusht ist (Aufbau dauert 1–3 Minuten):

```bash
git add -A && git commit -m "Texte angepasst" && git push
```

Eigene Domain (z. B. `timo-winheller-coaching.de`): im Repo unter Settings → Pages → „Custom domain" eintragen
und beim Domain-Anbieter einen CNAME auf `timowinheller-web.github.io` setzen.

## Hosting (Alternativen)

- **Klassischer Webspace (Strato, IONOS, All-Inkl):** alle Dateien und Ordner per FTP/SFTP in das Web-Root hochladen. Fertig.
- **Netlify / Cloudflare Pages / GitHub Pages:** Ordner hochladen bzw. Repository verbinden. Kein Build-Befehl nötig, Publish-Directory = `.`
- SSL/HTTPS bei allen genannten Anbietern inklusive – einschalten.

## Rechtlicher Hinweis

Impressum und Datenschutzerklärung sind sorgfältig erstellte Vorlagen, aber keine Rechtsberatung.
Vor Veröffentlichung einmal von einem Anwalt oder einem Generator (z. B. e-recht24.de) gegenprüfen lassen,
insbesondere wenn später Tracking, Newsletter, Buchungstools oder Google Fonts hinzukommen.
