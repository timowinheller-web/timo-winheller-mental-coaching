# Launch-Checkliste – timowinheller.de

Reihenfolge von oben nach unten. Jeder Punkt ist in einer Sitzung machbar.

## 1. Inhalte, die nur du liefern kannst (vor dem Launch)

| Was | Wo | Status |
|---|---|---|
| Ausbildungsstand ehrlich formulieren (Practitioner / Master: abgeschlossen oder „in Ausbildung, Abschluss MM/JJJJ“) | `parts/ueber-mich.body.html`, `parts/methoden.body.html`, `build.py` (Beschreibung „ueber-mich“), Impressum | offen |
| Zertifikatsdaten `[Daten]` / `[Abschlussdaten]` | ueber-mich, methoden | offen |
| Meister-Fachrichtung `[Fachrichtung]`, Arbeitgeber nennen oder Satz streichen | ueber-mich | offen |
| Wendepunkt-Story (2–3 Sätze) | ueber-mich | offen |
| Porträtfoto 4:5 (mind. 800×1000 px) als `img/portrait.jpg`; dann in `parts/index.body.html` `portrait-platzhalter.svg` ersetzen | Start, ueber-mich | offen |
| Privatadresse `[STRASSE NR]`, `[PLZ]` | impressum, datenschutz | offen |
| Telefonnummer: `PHONE` / `PHONE_LINK` in `build.py` (CONFIG) und Impressum | build.py, impressum | offen |
| Instagram-URL: `INSTAGRAM` in `build.py` | build.py | optional |
| Videotool (Zoom/Meet) `[Zoom / Google Meet …]` | faq, datenschutz | offen |
| `[DATUM]` in Datenschutz und AGB, Löschfrist `[z. B. 3 Monaten]` | datenschutz, agb | offen |
| Versprechen prüfen: „Antwort innerhalb von 24 Stunden“ (steht auf Start, Angebot, Kontakt, Danke, Über mich) – halten oder auf „innerhalb eines Werktags“ ändern | mehrere Parts | prüfen |

## 2. Dienste einrichten

1. **Web3Forms** (Kontaktformular): auf web3forms.com Access Key für info@timowinheller.de anlegen, in `parts/kontakt.body.html` bei `access_key` eintragen. Datenschutz Abschnitt 4 mit Anbieterangaben ergänzen. Testanfrage schicken.
2. **Terminbuchung** (optional, empfohlen): Konto bei cal.com (kostenlos) oder Calendly, Ereignis „Erstgespräch, 20 Min, Video“ anlegen, Link in `build.py` → `CONFIG["BOOKING_URL"]`. Danach `python3 build.py`. Die Buchungs-Buttons erscheinen automatisch auf Start, Angebot, Kontakt, CTA-Band; Datenschutz Abschnitt 4a füllen.
3. **Analyse ohne Cookies** (optional): Plausible (ab ca. 9 €/Monat, EU-Server) oder Umami. Script-Tag in `CONFIG["ANALYTICS_HTML"]`, Host in `CONFIG["ANALYTICS_HOST"]`. Ereignisse (Erstgespräch-Klicks, Check abgeschlossen, Anfrage gesendet, Blockade gelöst) werden dann automatisch gezählt. Datenschutz-Absatz „Reichweitenmessung“ mit Anbieter ergänzen.
4. **WhatsApp Business** (optional): Nummer in `CONFIG["WHATSAPP"]` (Format 49…), Datenschutz Abschnitt 4b erscheint automatisch.

## 3. Domain und Hosting

1. Domain timowinheller.de: Bei GitHub Pages (Settings → Pages → Custom domain) eintragen, beim Domain-Anbieter CNAME `www` → `timowinheller-web.github.io` und A-Records für die Apex-Domain (GitHub-Doku). HTTPS erzwingen.
2. **EU-Hosting**: GitHub Pages liefert über ein US-Unternehmen aus. IONOS Deploy Now ist bereits mit dem Repo verbunden und hostet in Deutschland – für den Launch die Domain auf das IONOS-Deployment zeigen lassen und in `build.py` `BASE_URL` auf `https://timowinheller.de/` setzen. Datenschutz Abschnitt 3 dann auf IONOS umstellen.
3. `python3 build.py` nach der Umstellung von `BASE_URL` (Sitemap, Canonicals, OG-Bild-Links ändern sich mit).

## 4. Passwortschutz aufheben

1. `.password` leeren oder löschen.
2. `python3 build.py`, dann `git add -A && git commit -m "Launch" && git push`.
3. Prüfen: Seite ohne Passwort erreichbar, `robots.txt` enthält `Allow: /`.

## 5. Sichtbarkeit (in der Launch-Woche)

1. **Google Search Console**: Domain verifizieren, `sitemap.xml` einreichen.
2. **Google Unternehmensprofil** anlegen: Kategorie „Coach“ / „Mentaltrainer“, Reichshof, Einzugsgebiet Oberberg + Köln, Öffnungszeiten abends/Wochenende, Website-Link, 5–10 Fotos (Raum, Porträt), ohne Privatadresse anzeigen zu lassen (Einzugsgebiet-Modus).
3. Bing Webmaster Tools (import aus Search Console, 2 Minuten).
4. Instagram-Bio auf die Website verlinken.
5. Erste Kundenstimmen nur mit schriftlicher Einwilligung; dann Abschnitt `#stimmen` in `parts/index.body.html` einblenden (`hidden` entfernen).

## 6. Betrieb (monatlich, 15 Minuten)

- Search Console: Fehler, Klicks, Suchanfragen. Beste Suchbegriffe in Texte einarbeiten.
- Formular-Test: einmal selbst anfragen.
- Termine, Preise, Zertifikate aktuell? Impressum und Datenschutz bei Änderungen anpassen.
- Backup = Git: jede Änderung ist ein Commit, jederzeit rückholbar.
- Uptime-Alarm (kostenlos): uptimerobot.com auf die Startseite.
