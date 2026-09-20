#!/bin/bash
# Baut alle HTML-Seiten aus Header + Body + Footer. Aufruf: build.sh <parts-dir> <out-dir>
P=$1; OUT=$2
build() {
  file=$1; title=$2; desc=$3; active=$4
  {
    cat <<HDR
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>$title</title>
  <meta name="description" content="$desc">
  <link rel="icon" href="img/logo.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
<header class="site-header">
  <div class="container nav">
    <a class="brand" href="index.html" aria-label="Startseite">
      <svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#1f3a5f"/><path d="M18 40c4-10 10-16 14-16s10 6 14 16" stroke="#d98c3f" stroke-width="4" stroke-linecap="round" fill="none"/><circle cx="32" cy="22" r="4" fill="#f6f1ea"/></svg>
      <span>Timo Winheller<small>Mental Coaching</small></span>
    </a>
    <button class="nav-toggle" aria-label="Menü öffnen" aria-expanded="false" aria-controls="hauptmenu">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
    </button>
    <ul class="nav-links" id="hauptmenu">
HDR
    for item in "index.html|Start" "angebot.html|Angebot" "methode.html|Methode" "fallbeispiele.html|Fallbeispiele" "ueber-mich.html|Über mich"; do
      href=${item%%|*}; label=${item#*|}
      if [ "$href" = "$active" ]; then echo "      <li><a href=\"$href\" aria-current=\"page\">$label</a></li>"; else echo "      <li><a href=\"$href\">$label</a></li>"; fi
    done
    cat <<HDR2
      <li><a class="btn btn-primary" href="kontakt.html">Kostenloses Erstgespräch</a></li>
    </ul>
  </div>
</header>
<main>
HDR2
    cat "$P/$file.body.html"
    cat <<FTR
</main>
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <strong>Timo Winheller Mental Coaching</strong>
        <p class="muted small mt-1">Neuro-Resonanz-Practitioner (Denys Scharnweber Akademie). Coaching online und vor Ort in <span class="placeholder">[STADT]</span>.</p>
      </div>
      <div>
        <strong>Navigation</strong>
        <ul class="mt-1">
          <li><a href="angebot.html">Angebot &amp; Preise</a></li>
          <li><a href="methode.html">Methode</a></li>
          <li><a href="fallbeispiele.html">Fallbeispiele</a></li>
          <li><a href="ueber-mich.html">Über mich</a></li>
          <li><a href="kontakt.html">Kontakt</a></li>
        </ul>
      </div>
      <div>
        <strong>Kontakt</strong>
        <ul class="mt-1">
          <li><span class="placeholder">[E-MAIL]</span></li>
          <li><span class="placeholder">[TELEFON]</span></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© <span id="jahr">2026</span> Timo Winheller</span>
      <span><a href="impressum.html">Impressum</a> · <a href="datenschutz.html">Datenschutz</a></span>
    </div>
  </div>
</footer>
<script src="js/main.js"></script>
</body>
</html>
FTR
  } > "$OUT/$file.html"
  echo "gebaut: $file.html"
}
build index "Timo Winheller Mental Coaching – Klarer Kopf, ruhige Entscheidungen" "Mental Coaching mit Neuro-Resonanz: Stress abbauen, Blockaden lösen, Ziele klar verfolgen. Online und vor Ort. Kostenloses Erstgespräch." index.html
build angebot "Angebot & Preise – Timo Winheller Mental Coaching" "Kostenloses Erstgespräch, Einzelsitzungen, 5er-Paket und 3-Monats-Begleitung. Transparente Preise, online oder vor Ort." angebot.html
build methode "Methode: Neuro-Resonanz – Timo Winheller Mental Coaching" "Wie Neuro-Resonanz-Coaching funktioniert: NLP-Bausteine, Körperarbeit und Meditation verständlich erklärt." methode.html
build fallbeispiele "Fallbeispiele – Timo Winheller Mental Coaching" "Anonymisierte Beispiele aus dem Coaching: Ausgangslage, Vorgehen, Ergebnis." fallbeispiele.html
build ueber-mich "Über mich – Timo Winheller Mental Coaching" "Timo Winheller, Neuro-Resonanz-Practitioner: Werdegang, Ausbildung und Haltung." ueber-mich.html
build kontakt "Kontakt & Erstgespräch – Timo Winheller Mental Coaching" "Kostenloses 30-minütiges Erstgespräch vereinbaren. Online oder vor Ort." kontakt.html
build impressum "Impressum – Timo Winheller Mental Coaching" "Impressum und Anbieterkennzeichnung." impressum.html
build datenschutz "Datenschutzerklärung – Timo Winheller Mental Coaching" "Datenschutzerklärung nach DSGVO." datenschutz.html
