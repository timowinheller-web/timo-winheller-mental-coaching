// Neuronale Netze auf <canvas class="neural">:
//   data-neural="head"  – Kopf-Profil aus Knoten und Verbindungen, aus dem Blätter wachsen (Hero)
//   data-neural="brain" – Gehirn-Silhouette
//   data-neural="field" – frei driftendes Netz
// Impulse wandern entlang der Verbindungen; Knoten nahe dem Mauszeiger leuchten.
// Farben kommen aus den CSS-Variablen --net-line, --net-node, --net-accent.
(function () {
  var canvases = Array.prototype.slice.call(document.querySelectorAll('canvas.neural'));
  if (!canvases.length) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  var T = {};
  function readTheme() {
    var cs = getComputedStyle(document.documentElement);
    var v = function (n, d) { var x = cs.getPropertyValue(n).trim(); return x || d; };
    T.line = v('--net-line', '18,18,16'); T.node = v('--net-node', '18,18,16'); T.accent = v('--net-accent', '63,91,59');
  }
  readTheme();
  var mouse = { x: -1e4, y: -1e4 };
  if (finePointer) window.addEventListener('pointermove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

  // Silhouetten als kubische Bézier-Segmente [p0, c1, c2, p1]
  var SHAPES = {
    head: { box: [400, 480], center: [235, 200],
      segs: [
        [[200, 20], [300, 20], [370, 90], [370, 190]],
        [[370, 190], [370, 270], [330, 330], [300, 380]],
        [[300, 380], [295, 420], [300, 460], [310, 480]],
        [[310, 480], [260, 480], [220, 480], [170, 480]],
        [[170, 480], [175, 440], [175, 420], [160, 400]],
        [[160, 400], [130, 395], [105, 385], [100, 365]],
        [[100, 365], [112, 355], [112, 345], [100, 338]],
        [[100, 338], [110, 333], [112, 325], [104, 316]],
        [[104, 316], [96, 312], [82, 305], [78, 292]],
        [[78, 292], [84, 270], [96, 250], [104, 228]],
        [[104, 228], [98, 215], [96, 200], [100, 180]],
        [[100, 180], [105, 110], [140, 25], [200, 20]]
      ],
      inner: [
        [[300, 250], [335, 245], [340, 300], [300, 300]],
        [[160, 400], [200, 395], [260, 392], [300, 380]],
        [[104, 228], [130, 235], [150, 232], [165, 236]]
      ],
      leafSegs: [11, 0, 1], leafCount: 18,
      dense: function (x, y) { return y < 330 && x > 105; }
    },
    brain: { box: [400, 320], center: [210, 165],
      segs: [
        [[60, 150], [58, 105], [85, 62], [130, 52]], [[130, 52], [175, 30], [245, 28], [295, 52]],
        [[295, 52], [340, 72], [362, 120], [355, 165]], [[355, 165], [352, 190], [345, 200], [338, 208]],
        [[338, 208], [345, 235], [320, 272], [275, 276]], [[275, 276], [252, 278], [238, 268], [236, 258]],
        [[236, 258], [232, 280], [226, 296], [216, 306]], [[216, 306], [206, 296], [200, 278], [198, 258]],
        [[198, 258], [160, 262], [112, 248], [92, 215]], [[92, 215], [70, 205], [56, 180], [60, 150]]
      ],
      inner: [[[100, 178], [140, 160], [190, 168], [240, 148]], [[190, 48], [200, 90], [180, 130], [200, 178]]],
      leafSegs: [], leafCount: 0, dense: function () { return true; }
    }
  };

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
  function mk(p, r, edge) {
    return { hx: p[0], hy: p[1], x: p[0], y: p[1], r: r, edge: edge, ph: Math.random() * 6.28,
      f: 0.4 + Math.random() * 0.6, amp: edge ? 0.8 : 1.2 + Math.random() * 2, hub: !edge && Math.random() < 0.09, lit: 0 };
  }

  function build(sc) {
    var w = sc.w, h = sc.h, nodes = [], links = [], i, j, d;
    var shape = SHAPES[sc.mode];
    if (shape) {
      var bw = shape.box[0], bh = shape.box[1];
      var s = Math.min(w / bw, h / bh) * 0.92, ox = (w - bw * s) / 2, oy = (h - bh * s) / 2;
      var map = function (p) { return [ox + p[0] * s, oy + p[1] * s]; };
      sc.scale = s; sc.map = map; sc.center = map(shape.center);
      var outline = poly(shape.segs, 22);
      sc.outline = outline.map(map);
      sc.inner = shape.inner.map(function (g) { return poly([g], 22).map(map); });
      for (i = 0; i < outline.length; i += 4) nodes.push(mk(map(outline[i]), 1.1, true));
      var want = (w < 600 ? 150 : 240) + nodes.length, tries = 0;
      while (nodes.length < want && tries++ < 12000) {
        var x = Math.random() * bw, y = Math.random() * bh;
        if (!inPoly(outline, x, y)) continue;
        if (!shape.dense(x, y) && Math.random() > 0.4) continue;
        nodes.push(mk(map([x, y]), 0.9 + Math.random() * 1.3, false));
      }
      sc.linkDist = bw * s * 0.105;
      for (i = 0; i < nodes.length; i++) for (j = i + 1; j < nodes.length; j++) {
        d = dist(nodes[i].hx, nodes[i].hy, nodes[j].hx, nodes[j].hy);
        if (d < sc.linkDist) links.push([i, j, d]);
      }
      // Blätter entlang der Kopfoberseite
      sc.leaves = [];
      var cx = sc.center[0], cy = sc.center[1];
      for (i = 0; i < shape.leafCount; i++) {
        var seg = shape.segs[shape.leafSegs[i % shape.leafSegs.length]];
        var t = 0.08 + Math.random() * 0.84, a = map(bez(seg, t));
        var ang = Math.atan2(a[1] - cy, a[0] - cx) + (Math.random() - 0.5) * 0.6;
        sc.leaves.push({ x: a[0], y: a[1], ang: ang, len: (22 + Math.random() * 26) * s, ph: Math.random() * 6.28, f: 0.7 + Math.random() * 0.6, tone: Math.random() });
      }
    } else {
      var n = Math.max(60, Math.min(160, Math.round(w * h / 12000)));
      for (i = 0; i < n; i++) {
        var nd = mk([Math.random() * w, Math.random() * h], 1 + Math.random() * 1.4, false);
        nd.vx = (Math.random() - 0.5) * 0.28; nd.vy = (Math.random() - 0.5) * 0.28; nodes.push(nd);
      }
      sc.linkDist = 150; sc.leaves = [];
    }
    sc.nodes = nodes; sc.links = links; sc.pulses = []; sc.sparks = [];
  }

  function step(sc, t, dt) {
    var nodes = sc.nodes, i, j, d;
    if (SHAPES[sc.mode]) {
      for (i = 0; i < nodes.length; i++) { var n = nodes[i]; n.x = n.hx + Math.sin(t * n.f + n.ph) * n.amp; n.y = n.hy + Math.cos(t * n.f * 0.8 + n.ph) * n.amp; }
    } else {
      for (i = 0; i < nodes.length; i++) {
        var m = nodes[i]; m.x += m.vx; m.y += m.vy;
        if (m.x < -20) m.x = sc.w + 20; if (m.x > sc.w + 20) m.x = -20; if (m.y < -20) m.y = sc.h + 20; if (m.y > sc.h + 20) m.y = -20;
      }
      sc.links = [];
      for (i = 0; i < nodes.length; i++) for (j = i + 1; j < nodes.length; j++) { d = dist(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y); if (d < sc.linkDist) sc.links.push([i, j, d]); }
    }
    for (i = 0; i < nodes.length; i++) if (nodes[i].lit > 0) nodes[i].lit = Math.max(0, nodes[i].lit - dt * 1.5);
    if (sc.links.length && sc.pulses.length < 8 && Math.random() < 0.05) {
      var L = sc.links[Math.floor(Math.random() * sc.links.length)];
      sc.pulses.push({ a: L[0], b: L[1], p: 0, v: 0.008 + Math.random() * 0.012, dir: Math.random() < 0.5 });
    }
    for (i = sc.pulses.length - 1; i >= 0; i--) {
      var P = sc.pulses[i]; P.p += P.v;
      if (P.p >= 1) { var end = nodes[P.dir ? P.b : P.a]; end.lit = 1; sc.sparks.push({ x: end.x, y: end.y, t: 0 }); sc.pulses.splice(i, 1); }
    }
    for (i = sc.sparks.length - 1; i >= 0; i--) { sc.sparks[i].t += dt * 1.8; if (sc.sparks[i].t >= 1) sc.sparks.splice(i, 1); }
  }

  function pathOf(ctx, pts, close) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); if (close) ctx.closePath(); }
  function strokePath(ctx, pts, close, style, w) { pathOf(ctx, pts, close); ctx.strokeStyle = style; ctx.lineWidth = w; ctx.stroke(); }

  function leaf(ctx, L, t) {
    var sway = Math.sin(t * L.f + L.ph) * 0.09;
    var w = L.len * 0.4, tone = L.tone;
    ctx.save(); ctx.translate(L.x, L.y); ctx.rotate(L.ang + sway);
    ctx.strokeStyle = 'rgba(' + T.accent + ',.7)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(L.len * 0.18, 0); ctx.stroke();
    ctx.translate(L.len * 0.18, 0);
    var l = L.len * 0.82;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(l * 0.5, -w, l, 0); ctx.quadraticCurveTo(l * 0.5, w, 0, 0);
    ctx.fillStyle = tone < 0.5 ? 'rgba(' + T.accent + ',.82)' : 'rgba(108,138,102,.85)'; ctx.fill();
    ctx.strokeStyle = 'rgba(' + T.accent + ',.55)'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(l * 0.92, 0); ctx.strokeStyle = 'rgba(236,232,224,.55)'; ctx.stroke();
    ctx.restore();
  }

  function draw(sc, t) {
    var ctx = sc.ctx, nodes = sc.nodes, i, A = T.accent;
    ctx.clearRect(0, 0, sc.w, sc.h);
    if (sc.outline) {
      var g = ctx.createRadialGradient(sc.center[0], sc.center[1], 10, sc.center[0], sc.center[1], Math.max(sc.w, sc.h) * 0.36);
      g.addColorStop(0, 'rgba(' + A + ',.14)'); g.addColorStop(1, 'rgba(' + A + ',0)');
      ctx.save(); pathOf(ctx, sc.outline, true); ctx.clip(); ctx.fillStyle = g; ctx.fillRect(0, 0, sc.w, sc.h); ctx.restore();
      strokePath(ctx, sc.outline, true, 'rgba(' + T.node + ',.55)', 1.2);
      sc.inner.forEach(function (gy) { strokePath(ctx, gy, false, 'rgba(' + T.node + ',.22)', 1); });
    }
    ctx.lineWidth = 1;
    for (i = 0; i < sc.links.length; i++) {
      var L = sc.links[i], a = nodes[L[0]], b = nodes[L[1]], al = (1 - L[2] / sc.linkDist) * 0.34;
      if (al <= 0.01) continue;
      ctx.strokeStyle = 'rgba(' + T.line + ',' + al.toFixed(3) + ')';
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    var rect = sc.c.getBoundingClientRect(), px = mouse.x - rect.left, py = mouse.y - rect.top;
    if (px > 0 && py > 0 && px < sc.w && py < sc.h) {
      var R = 120;
      for (i = 0; i < nodes.length; i++) {
        var nn = nodes[i], dd = dist(nn.x, nn.y, px, py);
        if (dd < R) { var k = 1 - dd / R; nn.lit = Math.max(nn.lit, k); ctx.strokeStyle = 'rgba(' + A + ',' + (k * 0.5).toFixed(3) + ')'; ctx.beginPath(); ctx.moveTo(nn.x, nn.y); ctx.lineTo(px, py); ctx.stroke(); }
      }
    }
    for (i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.hub || n.lit > 0.02) {
        var lit = Math.max(n.hub ? 0.9 : 0, n.lit);
        ctx.fillStyle = 'rgba(' + A + ',' + lit.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 1 + n.lit * 1.6, 0, 6.283); ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(' + T.node + ',' + (n.edge ? 0.75 : 0.6) + ')';
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 6.283); ctx.fill();
      }
    }
    for (i = 0; i < sc.pulses.length; i++) {
      var P = sc.pulses[i], Pa = nodes[P.a], Pb = nodes[P.b], q = P.dir ? P.p : 1 - P.p;
      ctx.fillStyle = 'rgba(' + A + ',1)'; ctx.beginPath(); ctx.arc(Pa.x + (Pb.x - Pa.x) * q, Pa.y + (Pb.y - Pa.y) * q, 2.6, 0, 6.283); ctx.fill();
    }
    for (i = 0; i < sc.sparks.length; i++) {
      var S = sc.sparks[i]; ctx.strokeStyle = 'rgba(' + A + ',' + (1 - S.t).toFixed(3) + ')'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(S.x, S.y, 3 + S.t * 16, 0, 6.283); ctx.stroke();
    }
    for (i = 0; i < sc.leaves.length; i++) leaf(ctx, sc.leaves[i], t);
  }

  var scenes = [];
  canvases.forEach(function (c) {
    var sc = { c: c, ctx: c.getContext('2d'), mode: c.dataset.neural || 'field', w: 0, h: 0, visible: true, nodes: [], links: [], pulses: [], sparks: [], leaves: [] };
    function resize() {
      var r = c.getBoundingClientRect(); if (!r.width || !r.height) return;
      sc.w = r.width; sc.h = r.height; c.width = Math.round(r.width * DPR); c.height = Math.round(r.height * DPR);
      sc.ctx.setTransform(DPR, 0, 0, DPR, 0, 0); build(sc);
      step(sc, 0, 0); draw(sc, 0); // Standbild sofort, Animation folgt per rAF
    }
    resize();
    var to; window.addEventListener('resize', function () { clearTimeout(to); to = setTimeout(resize, 150); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { sc.visible = e.isIntersecting; }); }).observe(c);
    scenes.push(sc);
  });
  if (reduce) return;
  var t = 0, last = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    if (document.hidden) { last = now; return; }
    if (!last) last = now;
    var dt = Math.min(50, now - last) / 1000; last = now; t += dt;
    for (var i = 0; i < scenes.length; i++) if (scenes[i].visible && scenes[i].w) { step(scenes[i], t, dt); draw(scenes[i], t); }
  }
  requestAnimationFrame(loop);
})();
