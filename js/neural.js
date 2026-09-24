// Interaktives Gehirn (<div data-brain> mit <canvas class="neural">):
// Ein Netz aus Knoten in Gehirn-Silhouette. Es bewegt sich NUR bei Interaktion:
// Mauszeiger/Finger lässt nahe Knoten leuchten und schickt Impulse los; die Methoden-Punkte
// zeigen beim Berühren ihren Namen, beim Klick die Beschreibung im Panel daneben.
// Die Liste unter dem Panel steuert dieselben Punkte (Tastatur-bedienbar).
(function () {
  var stages = Array.prototype.slice.call(document.querySelectorAll('[data-brain]'));
  if (!stages.length) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var cs = getComputedStyle(document.documentElement);
  var v = function (n, d) { var x = cs.getPropertyValue(n).trim(); return x || d; };
  var LINE = v('--net-line', '18,18,16'), NODE = v('--net-node', '18,18,16'), ACC = v('--net-accent', '63,91,59');

  // Gehirn-Silhouette (Seitenansicht, Stirn links) im 400×320-Raster
  var SEGS = [
    [[60, 150], [58, 105], [85, 62], [130, 52]], [[130, 52], [175, 30], [245, 28], [295, 52]],
    [[295, 52], [340, 72], [362, 120], [355, 165]], [[355, 165], [352, 190], [345, 200], [338, 208]],
    [[338, 208], [345, 235], [320, 272], [275, 276]], [[275, 276], [252, 278], [238, 268], [236, 258]],
    [[236, 258], [232, 280], [226, 296], [216, 306]], [[216, 306], [206, 296], [200, 278], [198, 258]],
    [[198, 258], [160, 262], [112, 248], [92, 215]], [[92, 215], [70, 205], [56, 180], [60, 150]]
  ];
  var INNER = [[[100, 178], [140, 160], [190, 168], [240, 148]], [[190, 48], [200, 90], [180, 130], [200, 178]], [[260, 70], [285, 95], [300, 130], [335, 150]]];
  // Methoden-Punkte: id, Position im Raster, Name, Kurztext
  var METHODS = [
    { id: 'glaubenssaetze', p: [118, 118], name: 'Glaubenssatzarbeit', text: 'Sätze wie „Ich bin nicht gut genug“ steuern dich, ohne dass du sie hörst. Wir machen sie sichtbar und bauen sie um.' },
    { id: 'ankern', p: [200, 78], name: 'Ankern', text: 'Ein Zustand wie Ruhe oder Fokus wird mit einem Reiz verknüpft, den du jederzeit abrufen kannst — vor dem Meeting, vor dem Trade, vor der Prüfung.' },
    { id: 'submodalitaeten', p: [290, 105], name: 'Submodalitäten', text: 'Wie dein Kopf ein Erlebnis abspeichert — groß, nah, laut — bestimmt, wie stark es wirkt. Wir ändern die Abspeicherung, und die Reaktion ändert sich mit.' },
    { id: 'timeline', p: [150, 195], name: 'Timeline-Arbeit', text: 'Prägende Erfahrungen werden neu bewertet, damit sie die Gegenwart nicht mehr blockieren. Ziele werden so verankert, dass sie ziehen.' },
    { id: 'wuwei', p: [225, 150], name: 'Wu-Wei-Transformation®', text: 'Widerstand nicht bekämpfen, sondern auflösen. Besonders wirksam bei Themen, an denen du dich schon lange abarbeitest.' },
    { id: 'aufstellung', p: [305, 185], name: 'Aufstellungs- & Dualitätenarbeit', text: 'Innere Konflikte — „Ich will, aber ich traue mich nicht“ — werden sichtbar gemacht und integriert. Beide Seiten bekommen ihren Platz.' },
    { id: 'hypnose', p: [205, 232], name: 'Hypnose', text: 'Gebündelte Aufmerksamkeit statt Kontrollverlust: In diesem Zustand sind automatische Muster leichter erreichbar — für Ruhe, Fokus und neue Zustände.' },
    { id: 'atem', p: [222, 275], name: 'Atem-Anker', text: 'Die lange Ausatmung sagt deinem Körper, dass keine Gefahr besteht. In Minuten runterfahren — überall, ohne dass es jemand merkt.' }
  ];

  function bez(s, t) {
    var u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
    return [a * s[0][0] + b * s[1][0] + c * s[2][0] + d * s[3][0], a * s[0][1] + b * s[1][1] + c * s[2][1] + d * s[3][1]];
  }
  function poly(segs, steps) { var pts = []; segs.forEach(function (s) { for (var i = 0; i < steps; i++) pts.push(bez(s, i / steps)); }); return pts; }
  function inPoly(pts, x, y) {
    var inside = false;
    for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      var xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  }
  function dist(ax, ay, bx, by) { var dx = ax - bx, dy = ay - by; return Math.sqrt(dx * dx + dy * dy); }
  function pathOf(ctx, pts, close) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); if (close) ctx.closePath(); }

  stages.forEach(function (stage) {
    var canvas = stage.querySelector('canvas'), ctx = canvas.getContext('2d');
    var tip = stage.querySelector('.brain__tip');
    var root = stage.closest('[data-brain-root]') || stage.parentNode;
    var title = root.querySelector('[data-brain-title]'), text = root.querySelector('[data-brain-text]');
    var buttons = Array.prototype.slice.call(root.querySelectorAll('[data-method]'));
    var sc = { w: 0, h: 0, nodes: [], links: [], pulses: [], sparks: [], hot: [], hover: null, selected: null, pointer: null, raf: 0, t: 0, last: 0 };

    function build() {
      var r = canvas.getBoundingClientRect(); if (!r.width || !r.height) return;
      sc.w = r.width; sc.h = r.height;
      canvas.width = Math.round(r.width * DPR); canvas.height = Math.round(r.height * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      var s = Math.min(sc.w / 400, sc.h / 320) * 0.9, ox = (sc.w - 400 * s) / 2, oy = (sc.h - 320 * s) / 2;
      var map = function (p) { return [ox + p[0] * s, oy + p[1] * s]; };
      var outline = poly(SEGS, 22);
      sc.outline = outline.map(map); sc.inner = INNER.map(function (g) { return poly([g], 22).map(map); });
      sc.center = map([210, 165]); sc.s = s;
      var nodes = [], i, j;
      for (i = 0; i < outline.length; i += 4) { var e = map(outline[i]); nodes.push({ x: e[0], y: e[1], r: 1.1, edge: true, lit: 0 }); }
      var want = (sc.w < 500 ? 120 : 190) + nodes.length, tries = 0;
      while (nodes.length < want && tries++ < 9000) {
        var x = 50 + Math.random() * 320, y = 25 + Math.random() * 285;
        if (!inPoly(outline, x, y)) continue;
        var m = map([x, y]); nodes.push({ x: m[0], y: m[1], r: 0.9 + Math.random() * 1.2, edge: false, lit: 0 });
      }
      sc.hot = METHODS.map(function (M) { var m = map(M.p); return { id: M.id, x: m[0], y: m[1], name: M.name, text: M.text, r: 5.5, lit: 0 }; });
      sc.hot.forEach(function (h) { nodes.push({ x: h.x, y: h.y, r: 1.5, edge: false, lit: 0, hot: h }); });
      sc.nodes = nodes;
      sc.linkDist = 400 * s * 0.115;
      sc.links = [];
      for (i = 0; i < nodes.length; i++) for (j = i + 1; j < nodes.length; j++) {
        var d = dist(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
        if (d < sc.linkDist) sc.links.push([i, j, d]);
      }
      sc.pulses = []; sc.sparks = [];
      draw();
    }

    // Impulse von einem Knoten aus entlang seiner Verbindungen losschicken
    function burst(idx, n) {
      var own = sc.links.filter(function (L) { return L[0] === idx || L[1] === idx; });
      for (var k = 0; k < Math.min(n, own.length); k++) {
        var L = own[Math.floor(Math.random() * own.length)];
        sc.pulses.push({ a: L[0], b: L[1], p: 0, v: 0.012 + Math.random() * 0.012, dir: L[0] === idx });
      }
      wake();
    }
    function nearestNode(x, y) {
      var best = -1, bd = 1e9;
      for (var i = 0; i < sc.nodes.length; i++) { var d = dist(sc.nodes[i].x, sc.nodes[i].y, x, y); if (d < bd) { bd = d; best = i; } }
      return best;
    }
    function hotAt(x, y) {
      for (var i = 0; i < sc.hot.length; i++) if (dist(sc.hot[i].x, sc.hot[i].y, x, y) < 22) return sc.hot[i];
      return null;
    }

    function step(dt) {
      var i, active = false;
      for (i = 0; i < sc.nodes.length; i++) if (sc.nodes[i].lit > 0) { sc.nodes[i].lit = Math.max(0, sc.nodes[i].lit - dt * 1.4); active = true; }
      for (i = sc.pulses.length - 1; i >= 0; i--) {
        var P = sc.pulses[i]; P.p += P.v; active = true;
        if (P.p >= 1) { var end = sc.nodes[P.dir ? P.b : P.a]; end.lit = 1; sc.sparks.push({ x: end.x, y: end.y, t: 0 }); sc.pulses.splice(i, 1); }
      }
      for (i = sc.sparks.length - 1; i >= 0; i--) { sc.sparks[i].t += dt * 1.8; active = true; if (sc.sparks[i].t >= 1) sc.sparks.splice(i, 1); }
      if (sc.pointer) {
        active = true;
        for (i = 0; i < sc.nodes.length; i++) { var d = dist(sc.nodes[i].x, sc.nodes[i].y, sc.pointer[0], sc.pointer[1]); if (d < 110) sc.nodes[i].lit = Math.max(sc.nodes[i].lit, 1 - d / 110); }
        if (Math.random() < 0.18) burst(nearestNode(sc.pointer[0], sc.pointer[1]), 1);
      }
      return active;
    }

    function draw() {
      var i, nodes = sc.nodes;
      ctx.clearRect(0, 0, sc.w, sc.h);
      var g = ctx.createRadialGradient(sc.center[0], sc.center[1], 10, sc.center[0], sc.center[1], Math.max(sc.w, sc.h) * 0.4);
      g.addColorStop(0, 'rgba(' + ACC + ',.12)'); g.addColorStop(1, 'rgba(' + ACC + ',0)');
      ctx.save(); pathOf(ctx, sc.outline, true); ctx.clip(); ctx.fillStyle = g; ctx.fillRect(0, 0, sc.w, sc.h); ctx.restore();
      pathOf(ctx, sc.outline, true); ctx.strokeStyle = 'rgba(' + NODE + ',.5)'; ctx.lineWidth = 1.2; ctx.stroke();
      sc.inner.forEach(function (gy) { pathOf(ctx, gy, false); ctx.strokeStyle = 'rgba(' + NODE + ',.18)'; ctx.lineWidth = 1; ctx.stroke(); });
      ctx.lineWidth = 1;
      for (i = 0; i < sc.links.length; i++) {
        var L = sc.links[i], a = nodes[L[0]], b = nodes[L[1]], al = (1 - L[2] / sc.linkDist) * 0.3 + Math.max(a.lit, b.lit) * 0.35;
        ctx.strokeStyle = (a.lit > 0.05 || b.lit > 0.05) ? 'rgba(' + ACC + ',' + al.toFixed(3) + ')' : 'rgba(' + LINE + ',' + al.toFixed(3) + ')';
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      if (sc.pointer) {
        for (i = 0; i < nodes.length; i++) {
          var dd = dist(nodes[i].x, nodes[i].y, sc.pointer[0], sc.pointer[1]);
          if (dd < 110) { ctx.strokeStyle = 'rgba(' + ACC + ',' + ((1 - dd / 110) * 0.5).toFixed(3) + ')'; ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(sc.pointer[0], sc.pointer[1]); ctx.stroke(); }
        }
      }
      for (i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (n.hot) continue;
        if (n.lit > 0.02) { ctx.fillStyle = 'rgba(' + ACC + ',' + n.lit.toFixed(3) + ')'; ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 1 + n.lit * 1.6, 0, 6.283); ctx.fill(); }
        else { ctx.fillStyle = 'rgba(' + NODE + ',' + (n.edge ? 0.7 : 0.55) + ')'; ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 6.283); ctx.fill(); }
      }
      // Methoden-Punkte
      for (i = 0; i < sc.hot.length; i++) {
        var h = sc.hot[i], on = (sc.hover === h || sc.selected === h);
        ctx.beginPath(); ctx.arc(h.x, h.y, on ? 14 : 10, 0, 6.283); ctx.strokeStyle = 'rgba(' + ACC + ',' + (on ? .9 : .45) + ')'; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); ctx.arc(h.x, h.y, on ? 6 : 4.5, 0, 6.283); ctx.fillStyle = on ? 'rgba(' + ACC + ',1)' : 'rgba(' + NODE + ',.9)'; ctx.fill();
        if (sc.selected === h) { ctx.beginPath(); ctx.arc(h.x, h.y, 20, 0, 6.283); ctx.strokeStyle = 'rgba(' + ACC + ',.35)'; ctx.stroke(); }
      }
      for (i = 0; i < sc.pulses.length; i++) {
        var P = sc.pulses[i], A = nodes[P.a], B = nodes[P.b], q = P.dir ? P.p : 1 - P.p;
        ctx.fillStyle = 'rgba(' + ACC + ',1)'; ctx.beginPath(); ctx.arc(A.x + (B.x - A.x) * q, A.y + (B.y - A.y) * q, 2.6, 0, 6.283); ctx.fill();
      }
      for (i = 0; i < sc.sparks.length; i++) {
        var S = sc.sparks[i]; ctx.strokeStyle = 'rgba(' + ACC + ',' + (1 - S.t).toFixed(3) + ')'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(S.x, S.y, 3 + S.t * 16, 0, 6.283); ctx.stroke();
      }
    }

    // Animation läuft nur, solange etwas passiert (Zeiger im Feld, Impulse, Funken)
    function loop(now) {
      var dt = Math.min(50, now - (sc.last || now)) / 1000; sc.last = now;
      var active = reduce ? false : step(dt);
      draw();
      sc.raf = active ? requestAnimationFrame(loop) : 0;
      if (!active) sc.last = 0;
    }
    function wake() { if (!sc.raf && !reduce) sc.raf = requestAnimationFrame(loop); }

    function select(h, viaList) {
      sc.selected = h;
      if (title) title.textContent = h ? h.name : 'Fahr mit der Maus über das Netz';
      if (text) text.textContent = h ? h.text : 'Jeder grüne Punkt ist ein Werkzeug, das ich im Coaching einsetze. Berühre einen Punkt — oder wähle unten aus der Liste.';
      buttons.forEach(function (b) { b.classList.toggle('is-active', !!h && b.dataset.method === h.id); if (!viaList && h && b.dataset.method === h.id) b.setAttribute('aria-pressed', 'true'); else b.setAttribute('aria-pressed', h && b.dataset.method === h.id ? 'true' : 'false'); });
      if (h) { var idx = sc.nodes.findIndex(function (n) { return n.hot === h; }); if (idx >= 0) { sc.nodes[idx].lit = 1; burst(idx, 4); } }
      draw();
    }
    function showTip(h, x, y) {
      if (!tip) return;
      if (h) { tip.textContent = h.name; tip.style.left = x + 'px'; tip.style.top = y + 'px'; tip.classList.add('is-on'); }
      else tip.classList.remove('is-on');
    }
    function localXY(e) { var r = canvas.getBoundingClientRect(); var p = e.touches ? e.touches[0] : e; return [p.clientX - r.left, p.clientY - r.top]; }

    stage.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      var p = localXY(e); sc.pointer = p; stage.classList.add('is-touched');
      var h = hotAt(p[0], p[1]); sc.hover = h; showTip(h, h ? h.x : p[0], h ? h.y : p[1]);
      stage.style.cursor = h ? 'pointer' : 'crosshair'; wake();
    });
    stage.addEventListener('pointerleave', function () { sc.pointer = null; sc.hover = null; showTip(null); wake(); });
    stage.addEventListener('pointerdown', function (e) {
      var p = localXY(e); stage.classList.add('is-touched');
      var h = hotAt(p[0], p[1]);
      if (h) select(h, false); else { var idx = nearestNode(p[0], p[1]); sc.nodes[idx].lit = 1; burst(idx, 5); }
      if (e.pointerType === 'touch') { sc.pointer = p; setTimeout(function () { sc.pointer = null; wake(); }, 250); }
      wake();
    });
    buttons.forEach(function (b) {
      b.addEventListener('click', function () { var h = sc.hot.filter(function (x) { return x.id === b.dataset.method; })[0]; select(h, true); });
    });

    build();
    var to; window.addEventListener('resize', function () { clearTimeout(to); to = setTimeout(build, 150); });
  });
})();
