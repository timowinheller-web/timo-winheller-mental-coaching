// Interaktives Gehirn (<div data-brain-root> mit .brain__stage > canvas):
// Drei Ansichten – Areale, Methoden, Blockade. Das Netz bewegt sich NUR, wenn du es bewegst:
//  • Areale: Maus/Finger über das Gehirn lässt das jeweilige Hirnareal aufleuchten; Klick zeigt die Erklärung.
//  • Methoden: grüne Punkte markieren Werkzeuge; berühren = Name, klicken = Beschreibung.
//  • Blockade: ein dunkler Knoten sitzt im Netz und blockiert die Impulse. Zieh ihn mit gedrückter
//    Maustaste (oder dem Finger) heraus – ab einer gewissen Spannung reißt er und das Netz feuert wieder.
(function () {
  var roots = Array.prototype.slice.call(document.querySelectorAll('[data-brain-root]'));
  if (!roots.length) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var cs = getComputedStyle(roots[0]);  // Farben aus dem Panel (überschreibbar per .brain{--neural-*})
  var v = function (n, d) { var x = cs.getPropertyValue(n).trim(); return x || d; };
  var LINE = v('--neural-line', '18,18,17'), ACC = v('--neural-node', '86,119,58');

  var SEGS = [
    [[60, 150], [58, 105], [85, 62], [130, 52]], [[130, 52], [175, 30], [245, 28], [295, 52]],
    [[295, 52], [340, 72], [362, 120], [355, 165]], [[355, 165], [352, 190], [345, 200], [338, 208]],
    [[338, 208], [345, 235], [320, 272], [275, 276]], [[275, 276], [252, 278], [238, 268], [236, 258]],
    [[236, 258], [232, 280], [226, 296], [216, 306]], [[216, 306], [206, 296], [200, 278], [198, 258]],
    [[198, 258], [160, 262], [112, 248], [92, 215]], [[92, 215], [70, 205], [56, 180], [60, 150]]
  ];
  var INNER = [[[100, 178], [140, 160], [190, 168], [240, 148]], [[190, 48], [200, 90], [180, 130], [200, 178]], [[260, 70], [285, 95], [300, 130], [335, 150]]];
  var AREAS = [
    { id: 'praefrontal', p: [118, 118], r: 62, name: 'Präfrontaler Cortex', text: 'Planen, Entscheiden, Impulse bremsen. Hier sitzen Ziele und Entscheidungen — und hier setzen Zielearbeit und Entscheidungsformate an.' },
    { id: 'motorik', p: [205, 62], r: 48, name: 'Motorischer Cortex', text: 'Routinen und Gewohnheiten. Was du oft genug tust, läuft hier automatisch — im Guten wie im Schlechten. Neue Routinen werden hier verankert.' },
    { id: 'parietal', p: [292, 92], r: 48, name: 'Parietallappen', text: 'Aufmerksamkeit und Wahrnehmung. Wo dein Fokus hingeht, folgt die Energie — Submodalitäten arbeiten genau mit dieser Abspeicherung.' },
    { id: 'hippocampus', p: [232, 186], r: 40, name: 'Hippocampus', text: 'Erinnerung und Lernen. Glaubenssätze sind gespeicherte Erfahrungen — und neu lernbar. Das nennt man Neuroplastizität.' },
    { id: 'amygdala', p: [188, 216], r: 34, name: 'Amygdala', text: 'Die Alarmanlage. Sie feuert, bevor du denkst: Herzrasen, Blackout, Panikverkauf. Hier setzen Anker und Regulation an.' },
    { id: 'insula', p: [150, 190], r: 30, name: 'Insula', text: 'Das Bauchgefühl. Körpersignale werden hier zu Emotionen — Körperwahrnehmung und Atemarbeit wirken genau hier.' },
    { id: 'hirnstamm', p: [218, 276], r: 30, name: 'Hirnstamm', text: 'Atem, Herzschlag, Grundspannung. Über den Atem erreichst du das Nervensystem direkt — in Minuten, nicht in Wochen.' }
  ];
  var METHODS = [
    { id: 'glaubenssaetze', p: [232, 186], name: 'Glaubenssatzarbeit', text: 'Sätze wie „Ich bin nicht gut genug" steuern dich, ohne dass du sie hörst. Wir machen sie sichtbar und bauen sie um — dort, wo sie gespeichert sind.' },
    { id: 'ankern', p: [205, 70], name: 'Ankern', text: 'Ein Zustand wie Ruhe oder Fokus wird mit einem Reiz verknüpft, den du jederzeit abrufen kannst — vor dem Meeting, vor der Anlageentscheidung, vor der Prüfung.' },
    { id: 'submodalitaeten', p: [292, 100], name: 'Submodalitäten', text: 'Wie dein Kopf ein Erlebnis abspeichert — groß, nah, laut — bestimmt, wie stark es wirkt. Wir ändern die Abspeicherung, und die Reaktion ändert sich mit.' },
    { id: 'timeline', p: [118, 128], name: 'Timeline-Arbeit', text: 'Prägende Erfahrungen werden neu bewertet, damit sie die Gegenwart nicht mehr blockieren. Ziele werden so verankert, dass sie ziehen.' },
    { id: 'wuwei', p: [150, 195], name: 'Wu-Wei-Transformation®', text: 'Widerstand nicht bekämpfen, sondern auflösen. Besonders wirksam bei Themen, an denen du dich schon lange abarbeitest.' },
    { id: 'aufstellung', p: [300, 180], name: 'Aufstellungs- & Dualitätenarbeit', text: 'Innere Konflikte — „Ich will, aber ich traue mich nicht" — werden sichtbar gemacht und integriert. Beide Seiten bekommen ihren Platz.' },
    { id: 'hypnose', p: [190, 222], name: 'Hypnose', text: 'Gebündelte Aufmerksamkeit statt Kontrollverlust: In diesem Zustand sind automatische Muster leichter erreichbar — für Ruhe, Fokus und neue Zustände.' },
    { id: 'atem', p: [218, 278], name: 'Atem-Anker', text: 'Die lange Ausatmung sagt deinem Körper, dass keine Gefahr besteht. In Minuten runterfahren — überall, ohne dass es jemand merkt.' }
  ];
  var TEXT = {
    areas: ['Fahr über das Gehirn', 'Jedes Areal hat eine Aufgabe — und jedes lässt sich trainieren. Berühre eine Region oder wähle sie unten aus.'],
    methods: ['Werkzeuge im Kopf', 'Jeder grüne Punkt ist eine Methode, die ich im Coaching einsetze — und das Areal, in dem sie wirkt.'],
    block: ['Zieh die Blockade heraus', 'Der dunkle Knoten sitzt in der Alarmanlage und lässt keine Impulse durch. Pack ihn mit gedrückter Maustaste oder dem Finger und zieh — bis er reißt.'],
    released: ['Gelöst.', 'Die Verbindungen sind wieder frei, die Impulse fließen. Genau das passiert im Coaching: nicht durch Kraft, sondern durch Lösen — Schritt für Schritt.']
  };

  function bez(s, t) { var u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t; return [a * s[0][0] + b * s[1][0] + c * s[2][0] + d * s[3][0], a * s[0][1] + b * s[1][1] + c * s[2][1] + d * s[3][1]]; }
  function poly(segs, steps) { var pts = []; segs.forEach(function (s) { for (var i = 0; i < steps; i++) pts.push(bez(s, i / steps)); }); return pts; }
  function inPoly(pts, x, y) { var inside = false; for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) { var xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1]; if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside; } return inside; }
  function dist(ax, ay, bx, by) { var dx = ax - bx, dy = ay - by; return Math.sqrt(dx * dx + dy * dy); }
  function pathOf(ctx, pts, close) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); if (close) ctx.closePath(); }

  roots.forEach(function (root) {
    var stage = root.querySelector('.brain__stage'), canvas = stage.querySelector('canvas'), ctx = canvas.getContext('2d');
    var tip = stage.querySelector('.brain__tip');
    var title = root.querySelector('[data-brain-title]'), text = root.querySelector('[data-brain-text]'), action = root.querySelector('[data-brain-action]');
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[data-brain-mode]'));
    var lists = { areas: root.querySelector('[data-brain-list="areas"]'), methods: root.querySelector('[data-brain-list="methods"]') };
    var sc = { mode: 'areas', w: 0, h: 0, nodes: [], links: [], pulses: [], sparks: [], areas: [], hot: [], hover: null, selected: null, pointer: null, raf: 0, last: 0, knot: null, drag: false };

    function build() {
      var r = canvas.getBoundingClientRect(); if (!r.width || !r.height) return;
      sc.w = r.width; sc.h = r.height; canvas.width = Math.round(r.width * DPR); canvas.height = Math.round(r.height * DPR); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      var s = Math.min(sc.w / 400, sc.h / 320) * 0.88, ox = (sc.w - 400 * s) / 2, oy = (sc.h - 320 * s) / 2;
      var map = function (p) { return [ox + p[0] * s, oy + p[1] * s]; };
      sc.s = s; var outline = poly(SEGS, 22); sc.outline = outline.map(map); sc.inner = INNER.map(function (g) { return poly([g], 22).map(map); }); sc.center = map([210, 165]);
      var nodes = [], i, j;
      for (i = 0; i < outline.length; i += 4) { var e = map(outline[i]); nodes.push({ x: e[0], y: e[1], r: 1.1, edge: true, lit: 0 }); }
      var want = (sc.w < 500 ? 130 : 210) + nodes.length, tries = 0;
      while (nodes.length < want && tries++ < 9000) { var x = 50 + Math.random() * 320, y = 25 + Math.random() * 285; if (!inPoly(outline, x, y)) continue; var m = map([x, y]); nodes.push({ x: m[0], y: m[1], r: 0.9 + Math.random() * 1.2, edge: false, lit: 0 }); }
      sc.areas = AREAS.map(function (A) { var m = map(A.p); return { id: A.id, x: m[0], y: m[1], r: A.r * s, name: A.name, text: A.text }; });
      sc.hot = METHODS.map(function (M) { var m = map(M.p); return { id: M.id, x: m[0], y: m[1], name: M.name, text: M.text }; });
      sc.hot.forEach(function (h) { nodes.push({ x: h.x, y: h.y, r: 1.5, edge: false, lit: 0, hot: h }); });
      sc.nodes = nodes; sc.linkDist = 400 * s * 0.115; sc.links = [];
      for (i = 0; i < nodes.length; i++) for (j = i + 1; j < nodes.length; j++) { var d = dist(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y); if (d < sc.linkDist) sc.links.push([i, j, d]); }
      sc.pulses = []; sc.sparks = []; makeKnot(); draw();
    }
    // Blockade: Knoten in der Amygdala, verknotet mit den Nachbarknoten
    function makeKnot() {
      var A = sc.areas.filter(function (a) { return a.id === 'amygdala'; })[0]; if (!A) return;
      var members = []; sc.nodes.forEach(function (n, i) { if (!n.hot && dist(n.x, n.y, A.x, A.y) < A.r * 1.1) members.push(i); });
      sc.knot = { ox: A.x, oy: A.y, x: A.x, y: A.y, r: 9 * Math.max(0.8, sc.s), members: members, released: false, tension: 0 };
    }
    function burst(idx, n) {
      var own = sc.links.filter(function (L) { return L[0] === idx || L[1] === idx; });
      for (var k = 0; k < Math.min(n, own.length); k++) { var L = own[Math.floor(Math.random() * own.length)]; sc.pulses.push({ a: L[0], b: L[1], p: 0, v: 0.012 + Math.random() * 0.012, dir: L[0] === idx }); }
      wake();
    }
    function nearestNode(x, y) { var best = -1, bd = 1e9; for (var i = 0; i < sc.nodes.length; i++) { var d = dist(sc.nodes[i].x, sc.nodes[i].y, x, y); if (d < bd) { bd = d; best = i; } } return best; }
    function hotAt(x, y) { for (var i = 0; i < sc.hot.length; i++) if (dist(sc.hot[i].x, sc.hot[i].y, x, y) < 22) return sc.hot[i]; return null; }
    function areaAt(x, y) { var best = null, bd = 1e9; for (var i = 0; i < sc.areas.length; i++) { var a = sc.areas[i], d = dist(a.x, a.y, x, y); if (d < a.r && d < bd) { bd = d; best = a; } } return best; }
    function blocked(i) { return sc.mode === 'block' && sc.knot && !sc.knot.released && sc.knot.members.indexOf(i) >= 0; }

    function step(dt) {
      var i, active = false;
      for (i = 0; i < sc.nodes.length; i++) if (sc.nodes[i].lit > 0) { sc.nodes[i].lit = Math.max(0, sc.nodes[i].lit - dt * 1.4); active = true; }
      for (i = sc.pulses.length - 1; i >= 0; i--) {
        var P = sc.pulses[i]; P.p += P.v; active = true;
        var target = P.dir ? P.b : P.a;
        if (blocked(target)) { sc.pulses.splice(i, 1); sc.sparks.push({ x: sc.nodes[target].x, y: sc.nodes[target].y, t: 0.4, dark: true }); continue; }
        if (P.p >= 1) { var end = sc.nodes[target]; end.lit = 1; sc.sparks.push({ x: end.x, y: end.y, t: 0 }); sc.pulses.splice(i, 1); }
      }
      for (i = sc.sparks.length - 1; i >= 0; i--) { sc.sparks[i].t += dt * 1.8; active = true; if (sc.sparks[i].t >= 1) sc.sparks.splice(i, 1); }
      if (sc.pointer && !sc.drag) {
        active = true;
        var R = 110;
        for (i = 0; i < sc.nodes.length; i++) { var d = dist(sc.nodes[i].x, sc.nodes[i].y, sc.pointer[0], sc.pointer[1]); if (d < R && !blocked(i)) sc.nodes[i].lit = Math.max(sc.nodes[i].lit, 1 - d / R); }
        if (Math.random() < 0.18) burst(nearestNode(sc.pointer[0], sc.pointer[1]), 1);
      }
      if (sc.drag) active = true;
      return active;
    }

    function draw() {
      var i, nodes = sc.nodes, K = sc.knot;
      ctx.clearRect(0, 0, sc.w, sc.h);
      var g = ctx.createRadialGradient(sc.center[0], sc.center[1], 10, sc.center[0], sc.center[1], Math.max(sc.w, sc.h) * 0.4);
      g.addColorStop(0, 'rgba(' + ACC + ',.12)'); g.addColorStop(1, 'rgba(' + ACC + ',0)');
      ctx.save(); pathOf(ctx, sc.outline, true); ctx.clip(); ctx.fillStyle = g; ctx.fillRect(0, 0, sc.w, sc.h); ctx.restore();
      // Areale
      if (sc.mode === 'areas') {
        sc.areas.forEach(function (a) {
          var on = sc.hover === a || sc.selected === a;
          var ag = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, a.r);
          ag.addColorStop(0, 'rgba(' + ACC + ',' + (on ? .32 : .09) + ')'); ag.addColorStop(1, 'rgba(' + ACC + ',0)');
          ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283); ctx.fill();
          ctx.beginPath(); ctx.arc(a.x, a.y, a.r * 0.62, 0, 6.283); ctx.setLineDash([3, 5]); ctx.strokeStyle = 'rgba(' + ACC + ',' + (on ? .7 : .28) + ')'; ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]);
        });
      }
      pathOf(ctx, sc.outline, true); ctx.strokeStyle = 'rgba(' + LINE + ',.5)'; ctx.lineWidth = 1.2; ctx.stroke();
      sc.inner.forEach(function (gy) { pathOf(ctx, gy, false); ctx.strokeStyle = 'rgba(' + LINE + ',.18)'; ctx.lineWidth = 1; ctx.stroke(); });
      ctx.lineWidth = 1;
      for (i = 0; i < sc.links.length; i++) {
        var L = sc.links[i], a = nodes[L[0]], b = nodes[L[1]];
        var inArea = sc.mode === 'areas' && (sc.hover || sc.selected) && (function (A) { return dist(a.x, a.y, A.x, A.y) < A.r && dist(b.x, b.y, A.x, A.y) < A.r; })(sc.hover || sc.selected);
        var al = (1 - L[2] / sc.linkDist) * 0.3 + Math.max(a.lit, b.lit) * 0.35 + (inArea ? .25 : 0);
        var isBlocked = blocked(L[0]) && blocked(L[1]);
        ctx.strokeStyle = isBlocked ? 'rgba(' + LINE + ',.75)' : (a.lit > 0.05 || b.lit > 0.05 || inArea) ? 'rgba(' + ACC + ',' + al.toFixed(3) + ')' : 'rgba(' + LINE + ',' + al.toFixed(3) + ')';
        ctx.lineWidth = isBlocked ? 2 : 1;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      ctx.lineWidth = 1;
      if (sc.pointer && !sc.drag) for (i = 0; i < nodes.length; i++) { var dd = dist(nodes[i].x, nodes[i].y, sc.pointer[0], sc.pointer[1]); if (dd < 110 && !blocked(i)) { ctx.strokeStyle = 'rgba(' + ACC + ',' + ((1 - dd / 110) * 0.5).toFixed(3) + ')'; ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(sc.pointer[0], sc.pointer[1]); ctx.stroke(); } }
      for (i = 0; i < nodes.length; i++) {
        var n = nodes[i]; if (n.hot && sc.mode === 'methods') continue;
        if (blocked(i)) { ctx.fillStyle = 'rgba(' + LINE + ',.85)'; ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 0.6, 0, 6.283); ctx.fill(); continue; }
        if (n.lit > 0.02) { ctx.fillStyle = 'rgba(' + ACC + ',' + n.lit.toFixed(3) + ')'; ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 1 + n.lit * 1.6, 0, 6.283); ctx.fill(); }
        else { ctx.fillStyle = 'rgba(' + LINE + ',' + (n.edge ? 0.7 : 0.55) + ')'; ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 6.283); ctx.fill(); }
      }
      if (sc.mode === 'methods') for (i = 0; i < sc.hot.length; i++) {
        var h = sc.hot[i], on = (sc.hover === h || sc.selected === h);
        ctx.beginPath(); ctx.arc(h.x, h.y, on ? 14 : 10, 0, 6.283); ctx.strokeStyle = 'rgba(' + ACC + ',' + (on ? .9 : .45) + ')'; ctx.stroke();
        ctx.beginPath(); ctx.arc(h.x, h.y, on ? 6 : 4.5, 0, 6.283); ctx.fillStyle = on ? 'rgba(' + ACC + ',1)' : 'rgba(' + LINE + ',.85)'; ctx.fill();
        if (sc.selected === h) { ctx.beginPath(); ctx.arc(h.x, h.y, 20, 0, 6.283); ctx.strokeStyle = 'rgba(' + ACC + ',.35)'; ctx.stroke(); }
      }
      // Blockade-Knoten mit gespannten Fäden
      if (sc.mode === 'block' && K && !K.released) {
        ctx.lineWidth = 1.6;
        K.members.forEach(function (mi) { var m = nodes[mi]; ctx.strokeStyle = 'rgba(' + LINE + ',' + (0.35 + K.tension * 0.5).toFixed(3) + ')'; ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(K.x, K.y); ctx.stroke(); });
        ctx.lineWidth = 1;
        var kg = ctx.createRadialGradient(K.x, K.y, 0, K.x, K.y, K.r * 3.2); kg.addColorStop(0, 'rgba(' + LINE + ',.28)'); kg.addColorStop(1, 'rgba(' + LINE + ',0)');
        ctx.fillStyle = kg; ctx.beginPath(); ctx.arc(K.x, K.y, K.r * 3.2, 0, 6.283); ctx.fill();
        ctx.fillStyle = 'rgba(' + LINE + ',.95)'; ctx.beginPath(); ctx.arc(K.x, K.y, K.r + K.tension * 3, 0, 6.283); ctx.fill();
        ctx.strokeStyle = 'rgba(' + ACC + ',' + (0.3 + K.tension * 0.7).toFixed(3) + ')'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(K.x, K.y, K.r + 7 + K.tension * 6, 0, 6.283); ctx.stroke(); ctx.lineWidth = 1;
      }
      for (i = 0; i < sc.pulses.length; i++) { var P = sc.pulses[i], A = nodes[P.a], B = nodes[P.b], q = P.dir ? P.p : 1 - P.p; ctx.fillStyle = 'rgba(' + ACC + ',1)'; ctx.beginPath(); ctx.arc(A.x + (B.x - A.x) * q, A.y + (B.y - A.y) * q, 2.6, 0, 6.283); ctx.fill(); }
      for (i = 0; i < sc.sparks.length; i++) { var S = sc.sparks[i]; ctx.strokeStyle = 'rgba(' + (S.dark ? LINE : ACC) + ',' + (1 - S.t).toFixed(3) + ')'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(S.x, S.y, 3 + S.t * 16, 0, 6.283); ctx.stroke(); }
      ctx.lineWidth = 1;
    }

    function loop(now) { var dt = Math.min(50, now - (sc.last || now)) / 1000; sc.last = now; var active = reduce ? false : step(dt); draw(); sc.raf = active ? requestAnimationFrame(loop) : 0; if (!active) sc.last = 0; }
    function wake() { if (!sc.raf && !reduce) sc.raf = requestAnimationFrame(loop); }
    function setPanel(t, x) { if (title) title.textContent = t; if (text) text.textContent = x; }
    function setMode(mode) {
      sc.mode = mode; sc.selected = null; sc.hover = null; sc.pointer = null;
      tabs.forEach(function (b) { b.classList.toggle('is-active', b.dataset.brainMode === mode); b.setAttribute('aria-selected', b.dataset.brainMode === mode ? 'true' : 'false'); });
      Object.keys(lists).forEach(function (k) { if (lists[k]) lists[k].hidden = k !== mode; });
      root.querySelectorAll('[data-brain-list] button').forEach(function (b) { b.classList.remove('is-active'); });
      if (mode === 'block') { if (!sc.knot || sc.knot.released) makeKnot(); setPanel(TEXT.block[0], TEXT.block[1]); if (action) { action.hidden = false; action.textContent = 'Blockade lösen'; } }
      else { setPanel(TEXT[mode][0], TEXT[mode][1]); if (action) action.hidden = true; }
      stage.style.cursor = mode === 'block' ? 'grab' : 'crosshair'; draw();
    }
    function select(item, kind) {
      sc.selected = item; setPanel(item.name, item.text);
      root.querySelectorAll('[data-brain-list="' + kind + '"] button').forEach(function (b) { b.classList.toggle('is-active', b.dataset.item === item.id); });
      if (kind === 'methods') { var idx = sc.nodes.findIndex(function (n) { return n.hot === item; }); if (idx >= 0) { sc.nodes[idx].lit = 1; burst(idx, 4); } }
      else { sc.nodes.forEach(function (n, i) { if (dist(n.x, n.y, item.x, item.y) < item.r) { n.lit = Math.max(n.lit, .9); if (Math.random() < .25) burst(i, 1); } }); }
      wake(); draw();
    }
    function release() {
      var K = sc.knot; if (!K || K.released) return;
      K.released = true; document.dispatchEvent(new CustomEvent('tw:track', { detail: { name: 'Blockade gelöst' } })); K.tension = 0; sc.drag = false; stage.style.cursor = 'crosshair';
      K.members.forEach(function (mi) { sc.nodes[mi].lit = 1; sc.sparks.push({ x: sc.nodes[mi].x, y: sc.nodes[mi].y, t: 0 }); burst(mi, 2); });
      setPanel(TEXT.released[0], TEXT.released[1]); if (action) action.textContent = 'Nochmal';
      wake();
    }
    function showTip(t, x, y) { if (!tip) return; if (t) { tip.textContent = t; tip.style.left = x + 'px'; tip.style.top = y + 'px'; tip.classList.add('is-on'); } else tip.classList.remove('is-on'); }
    function localXY(e) { var r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }

    stage.addEventListener('pointermove', function (e) {
      var p = localXY(e); stage.classList.add('is-touched');
      if (sc.drag && sc.knot) {
        var K = sc.knot; K.x = p[0]; K.y = p[1];
        K.tension = Math.min(1, dist(K.x, K.y, K.ox, K.oy) / (95 * Math.max(0.7, sc.s)));
        if (K.tension >= 1) release();
        wake(); return;
      }
      if (e.pointerType === 'touch') return;
      sc.pointer = p;
      if (sc.mode === 'methods') { var h = hotAt(p[0], p[1]); sc.hover = h; showTip(h ? h.name : null, h ? h.x : 0, h ? h.y : 0); stage.style.cursor = h ? 'pointer' : 'crosshair'; }
      else if (sc.mode === 'areas') { var a = areaAt(p[0], p[1]); sc.hover = a; showTip(a ? a.name : null, p[0], p[1] - 6); stage.style.cursor = a ? 'pointer' : 'crosshair'; }
      else if (sc.knot && !sc.knot.released) { var near = dist(p[0], p[1], sc.knot.x, sc.knot.y) < sc.knot.r + 14; showTip(near ? 'Ziehen' : null, sc.knot.x, sc.knot.y - 4); stage.style.cursor = near ? 'grab' : 'crosshair'; }
      wake();
    });
    stage.addEventListener('pointerdown', function (e) {
      var p = localXY(e); stage.classList.add('is-touched');
      if (sc.mode === 'block' && sc.knot && !sc.knot.released && dist(p[0], p[1], sc.knot.x, sc.knot.y) < sc.knot.r + 18) { sc.drag = true; stage.setPointerCapture(e.pointerId); stage.style.cursor = 'grabbing'; showTip(null); wake(); return; }
      if (sc.mode === 'methods') { var h = hotAt(p[0], p[1]); if (h) { select(h, 'methods'); return; } }
      if (sc.mode === 'areas') { var a = areaAt(p[0], p[1]); if (a) { select(a, 'areas'); return; } }
      var idx = nearestNode(p[0], p[1]); sc.nodes[idx].lit = 1; burst(idx, 5);
      if (e.pointerType === 'touch') { sc.pointer = p; setTimeout(function () { sc.pointer = null; wake(); }, 250); }
      wake();
    });
    var endDrag = function () { if (!sc.drag) return; sc.drag = false; var K = sc.knot; if (K && !K.released) { K.x = K.ox; K.y = K.oy; K.tension = 0; } stage.style.cursor = 'grab'; wake(); };
    stage.addEventListener('pointerup', endDrag); stage.addEventListener('pointercancel', endDrag);
    stage.addEventListener('pointerleave', function () { sc.pointer = null; sc.hover = null; showTip(null); if (sc.drag) endDrag(); wake(); });

    tabs.forEach(function (b) { b.addEventListener('click', function () { setMode(b.dataset.brainMode); }); });
    root.querySelectorAll('[data-brain-list="areas"] button').forEach(function (b) { b.addEventListener('click', function () { var a = sc.areas.filter(function (x) { return x.id === b.dataset.item; })[0]; if (a) select(a, 'areas'); }); });
    root.querySelectorAll('[data-brain-list="methods"] button').forEach(function (b) { b.addEventListener('click', function () { var h = sc.hot.filter(function (x) { return x.id === b.dataset.item; })[0]; if (h) select(h, 'methods'); }); });
    if (action) action.addEventListener('click', function () { if (sc.knot && !sc.knot.released) release(); else { makeKnot(); setPanel(TEXT.block[0], TEXT.block[1]); action.textContent = 'Blockade lösen'; wake(); draw(); } });

    build(); setMode('areas');
    var to; window.addEventListener('resize', function () { clearTimeout(to); to = setTimeout(function () { build(); setMode(sc.mode); }, 150); });
  });
})();
