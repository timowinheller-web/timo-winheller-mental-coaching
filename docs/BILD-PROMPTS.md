# Bild-Prompts für das Design „Nacht, Kobalt, Kreide, Glut"

Zehn Motive, gleiche Dateinamen wie bisher (dann ändert sich am Code nichts). Hochformat 2:3, mindestens 1024 px breit
(besser 1344 × 2016). Ablegen als `img/<name>.jpg`, dann `python3 tools/images.py`, `python3 build.py`, `git push`.
Sobald die dunklen Bilder da sind, stelle ich die Bildrahmen von Kreide auf Nacht um, damit die Motive mit der Bühne verschmelzen.

## Style-Key (an jeden Prompt anhängen)

```
cinematic dark studio photograph, pitch-black background, figure carved from matte black stone and fine black wire mesh,
dark green moss and small leaves growing from it, thin glowing cobalt-blue neural filaments (#3D63FF) tracing through the figure,
one warm ember-orange rim light (#FF6A4D) from the right, cool cobalt key light from the left, light volumetric haze,
ultra detailed, medium format look, 85mm, f/4, shallow depth of field, no text, no letters, no logo, no watermark --ar 2:3
```

Negativ-Prompt (falls das Tool einen hat):

```
beige background, white background, daylight, bright scene, text, letters, logo, watermark, extra limbs, cartoon,
illustration, low detail, oversaturated green, pink, purple
```

## Die zehn Motive

| Datei | Wo auf der Seite | Prompt (vor den Style-Key setzen) |
|---|---|---|
| `kopf-natur.jpg` | Hero (Print rechts), Vorschalt-Seite, Social-Bild | Profile of a human head facing left, skull made of black wire mesh, moss and ferns growing from the back of the head, glowing cobalt neural filaments visible inside the head like a living brain, ember rim light on the face, lower left of the frame calm and empty |
| `herz.jpg` | Selbstcheck (Kobalt-Band) | A human heart carved from black stone, wrapped in fine dark moss, cobalt filaments pulsing through it like veins, a single drop of water on it, floating in darkness, ember highlight on one side |
| `staerke.jpg` | Kachel „Mentale Stärke" | A crouching athlete figure made of black stone in a sprint start position, glowing cobalt cracks running through the body like kintsugi, moss on the shoulders, tension and power, lower third of the frame calm |
| `haende-wachstum.jpg` | Kachel „Finanzen & Investments" | Two cupped hands of black stone, between them a thin glowing cobalt line rising like a growth curve, tiny leaves sprouting along the line, calm and precise, lower third calm |
| `atem.jpg` | Kachel „NLP & Sprache", Reset-Seite | Profile of a dark stone head exhaling a stream of fine glowing cobalt particles that form a thin line in the air, a few small leaves drifting in the stream, ember rim light, lower third calm |
| `gehirn-verstand-gefuehl.jpg` | Kachel „Neuro-Resonanz", Methoden-Seite | A human brain floating in darkness, left half made of black polished machinery with cobalt circuit lines, right half overgrown with dark moss and tiny ember-colored blossoms, the two halves fused in the middle |
| `ruhe.jpg` | Kachel „Hypnose", Über-mich-Seite | A serene face made of fine black mesh with closed eyes, dark leaves slowly orbiting the head, a soft cobalt halo behind, deep calm, lower third calm |
| `kette-frei.jpg` | Kachel „Blockaden lösen", Check-Seite | A heavy black iron chain breaking apart, from the broken link a vine with dark leaves grows upward, a cobalt filament sparks at the break with a few ember sparks, dramatic, lower third calm |
| `treppe.jpg` | Ablauf-Panel, Angebot, Region | A staircase of black stone blocks ascending into darkness, moss on every step, a small tree on the top step lit by a warm ember glow, cobalt haze at the bottom |
| `raum.jpg` | CTA-Band, Kontakt, Angebot, Region | A dark minimalist room with two black armchairs facing each other in front of a wall of dark living moss, one warm ember floor lamp, cobalt light leaking in from a window on the left, cinematic, quiet |

## Porträtfoto (echt, kein KI-Bild)

Für `img/portrait.jpg` (Start „Wer dich begleitet" und Über mich). Hinweise für den Fotografen oder das Selbstporträt:
dunkler Hintergrund (Anthrazit bis Schwarz), kühles Hauptlicht von links, warmes Kantenlicht von rechts, Blick in die Kamera,
dunkle einfarbige Kleidung ohne Logo, Hochformat 4:5, mindestens 1200 × 1500 px. Danach in `parts/index.body.html` und
`parts/ueber-mich.body.html` den Platzhalter `img/portrait-platzhalter.svg` durch `img/portrait.jpg` ersetzen.

## Social-Bild

`img/og.jpg` nutzt `kopf-natur.jpg`. Nach dem Bildtausch neu rendern (Vorlage `tools/og.html`), oder mir Bescheid sagen.
