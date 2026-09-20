// Neuronale Netze auf <canvas class="neural">:
//   data-neural="field" – frei driftendes Netz (Seitenhintergrund)
//   data-neural="brain" – Netz in einer Gehirn-Silhouette (Hero, Methode)
// Ember-Impulse wandern entlang der Verbindungen. prefers-reduced-motion: statisches Bild.
(function () {
  var canvases = Array.prototype.slice.call(document.querySelectorAll('canvas.neural'));
  if (!canvases.length) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var EMBER = '#FF6A1F', EMBER_RGB = '255,106,31';
  var LINE_RGB = '127,166,217';   // --ink-400, aufgehellt
  var NODE_RGB = '253,251,248';   // --bone

  // Gehirn-Silhouette (Seitenansicht, Stirn links) als kubische Bézier-Segmente im 400×320-Raster
  var BRAIN = [
    [[60, 150], [58, 105], [85, 62], [130, 52]],
    [[130, 52], [175, 30], [245, 28], [295, 52]],
    [[295, 52], [340, 72], [362, 120], [355, 165]],
    [[355, 165], [352, 190], [345, 200], [338, 208]],
    [[338, 208], [345, 235], [320, 272], [275, 276]],
    [[275, 276], [252, 278], [238, 268], [236, 258]],
    [[236, 258], [232, 280], [226, 296], [216, 306]],
    [[216, 306], [206, 296], [200, 278], [198, 258]],
    [[198, 258], [160, 262], [112, 248], [92, 215]],
    [[92, 215], [70, 205], [56, 180], [60, 150]]
  ];
  // Furchen, nur angedeutet
  var GYRI = [
    [[100, 178], [140, 160], [190, 168], [240, 148]],
    [[190, 48], [200, 90], [180, 130], [200, 178]],
    [[95, 120], [110, 95], [145, 95], [158, 118]],
    [[260, 70], [285, 95], [300, 130], [335, 150]],
    [[120, 215], [150, 205], [185, 215], [215, 205]]
  ];

  function bez(s, t) {
    var u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
    return [a * s[0][0] + b * s[1][0] + c * s[2][0] + d * s[3][0], a * s[0][1] + b * s[1][1] + c * s[2][1] + d * s[3][1]];
  }
  function poly(segs, steps) {
    var pts = [];
    segs.forEach(function (s) { for (var i = 0; i < steps; i++) pts.push(bez(s, i / steps)); });
    return pts;
  }
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
      f: 0.4 + Math.random() * 0.6, amp: edge ? 1 : 1.5 + Math.random() * 2, hub: !edge && Math.random() < 0.08 };
  }

  function build(sc) {
    var w = sc.w, h = sc.h, nodes = [], links = [], i, j, d;
    if (sc.mode === 'brain') {
      var s = Math.min(w / 400, h / 320) * 0.88, ox = (w - 400 * s) / 2, oy = (h - 320 * s) / 2;
      var map = function (p) { return [ox + p[0] * s, oy + p[1] * s]; };
      var outline = poly(BRAIN, 24);
      sc.outline = outline.map(map);
      sc.gyri = GYRI.map(function (g) { return poly([g], 24).map(map); });
      for (i = 0; i < outline.length; i += 5) nodes.push(mk(map(outline[i]), 1.2, true));
      var want = (w < 600 ? 80 : 125) + nodes.length, tries = 0;
      while (nodes.length < want && tries++ < 6000) {
        var x = 50 + Math.random() * 320, y = 25 + Math.random() * 285;
        if (inPoly(outline, x, y)) nodes.push(mk(map([x, y]), 1 + Math.random() * 1.3, false));
      }
      sc.linkDist = 400 * s * 0.125;
      for (i = 0; i < nodes.length; i++) for (j = i + 1; j < nodes.length; j++) {
        d = dist(nodes[i].hx, nodes[i].hy, nodes[j].hx, nodes[j].hy);
        if (d < sc.linkDist) links.push([i, j, d]);
      }
    } else {
      var n = Math.max(36, Math.min(96, Math.round(w * h / 16000)));
      for (i = 0; i < n; i++) {
        var nd = mk([Math.random() * w, Math.random() * h], 1 + Math.random() * 1.4, false);
        nd.vx = (Math.random() - 0.5) * 0.25; nd.vy = (Math.random() - 0.5) * 0.25;
        nodes.push(nd);
      }
      sc.linkDist = 140;
    }
    sc.nodes = nodes; sc.links = links; sc.pulses = [];
  }

  function step(sc, t) {
    var nodes = sc.nodes, i, j, d;
    if (sc.mode === 'brain') {
      for (i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x = n.hx + Math.sin(t * n.f + n.ph) * n.amp;
        n.y = n.hy + Math.cos(t * n.f * 0.8 + n.ph) * n.amp;
      }
    } else {
      for (i = 0; i < nodes.length; i++) {
        var m = nodes[i]; m.x += m.vx; m.y += m.vy;
        if (m.x < -20) m.x = sc.w + 20; if (m.x > sc.w + 20) m.x = -20;
        if (m.y < -20) m.y = sc.h + 20; if (m.y > sc.h + 20) m.y = -20;
      }
      sc.links = [];
      for (i = 0; i < nodes.length; i++) for (j = i + 1; j < nodes.length; j++) {
        d = dist(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
        if (d < sc.linkDist) sc.links.push([i, j, d]);
      }
    }
    var maxP = sc.mode === 'brain' ? 5 : 3;
    if (sc.links.length && sc.pulses.length < maxP && Math.random() < 0.03) {
      var L = sc.links[Math.floor(Math.random() * sc.links.length)];
      sc.pulses.push({ a: L[0], b: L[1], p: 0, v: 0.008 + Math.random() * 0.01, dir: Math.random() < 0.5 });
    }
    for (i = sc.pulses.length - 1; i >= 0; i--) { sc.pulses[i].p += sc.pulses[i].v; if (sc.pulses[i].p >= 1) sc.pulses.splice(i, 1); }
  }

  function pathOf(ctx, pts, close) {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    if (close) ctx.closePath();
  }
  function strokePath(ctx, pts, close, style, w) { pathOf(ctx, pts, close); ctx.strokeStyle = style; ctx.lineWidth = w; ctx.stroke(); }

  function draw(sc, t) {
    var ctx = sc.ctx, nodes = sc.nodes, i;
    ctx.clearRect(0, 0, sc.w, sc.h);
    if (sc.mode === 'brain' && sc.outline) {
      var g = ctx.createRadialGradient(sc.w / 2, sc.h / 2, 10, sc.w / 2, sc.h / 2, Math.max(sc.w, sc.h) * 0.45);
      g.addColorStop(0, 'rgba(' + EMBER_RGB + ',.12)'); g.addColorStop(1, 'rgba(' + EMBER_RGB + ',0)');
      ctx.save(); pathOf(ctx, sc.outline, true); ctx.clip(); ctx.fillStyle = g; ctx.fillRect(0, 0, sc.w, sc.h); ctx.restore();
      strokePath(ctx, sc.outline, true, 'rgba(' + NODE_RGB + ',' + (0.12 + Math.sin(t * 0.6) * 0.03).toFixed(3) + ')', 1.2);
      sc.gyri.forEach(function (gy) { strokePath(ctx, gy, false, 'rgba(' + NODE_RGB + ',.08)', 1); });
    }
    var alphaMax = sc.mode === 'brain' ? 0.32 : 0.18;
    ctx.lineWidth = 1;
    for (i = 0; i < sc.links.length; i++) {
      var L = sc.links[i], a = nodes[L[0]], b = nodes[L[1]], al = (1 - L[2] / sc.linkDist) * alphaMax;
      if (al <= 0.01) continue;
      ctx.strokeStyle = 'rgba(' + LINE_RGB + ',' + al.toFixed(3) + ')';
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    for (i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.hub) { ctx.fillStyle = 'rgba(' + EMBER_RGB + ',.85)'; ctx.shadowColor = EMBER; ctx.shadowBlur = 10; }
      else { ctx.fillStyle = 'rgba(' + NODE_RGB + ',' + (n.edge ? 0.5 : 0.42) + ')'; ctx.shadowBlur = 0; }
      ctx.beginPath(); ctx.arc(n.x, n.y, n.hub ? n.r + 0.8 : n.r, 0, 6.283); ctx.fill();
    }
    ctx.shadowBlur = 0;
    for (i = 0; i < sc.pulses.length; i++) {
      var P = sc.pulses[i], A = nodes[P.a], B = nodes[P.b], q = P.dir ? P.p : 1 - P.p;
      ctx.fillStyle = EMBER; ctx.shadowColor = EMBER; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc(A.x + (B.x - A.x) * q, A.y + (B.y - A.y) * q, 2.4, 0, 6.283); ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  var scenes = [];
  canvases.forEach(function (c) {
    var sc = { c: c, ctx: c.getContext('2d'), mode: c.dataset.neural || 'field', w: 0, h: 0, visible: true, nodes: [], links: [], pulses: [] };
    function resize() {
      var r = c.getBoundingClientRect();
      if (!r.width || !r.height) return;
      sc.w = r.width; sc.h = r.height;
      c.width = Math.round(r.width * DPR); c.height = Math.round(r.height * DPR);
      sc.ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      build(sc);
      if (reduce) { step(sc, 0); draw(sc, 0); }
    }
    resize();
    var to; window.addEventListener('resize', function () { clearTimeout(to); to = setTimeout(resize, 150); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { es.forEach(function (e) { sc.visible = e.isIntersecting; }); }).observe(c);
    }
    scenes.push(sc);
  });

  if (reduce) return;
  var t = 0, last = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    if (document.hidden) { last = now; return; }
    t += Math.min(50, now - last) / 1000; last = now;
    for (var i = 0; i < scenes.length; i++) if (scenes[i].visible && scenes[i].w) { step(scenes[i], t); draw(scenes[i], t); }
  }
  requestAnimationFrame(loop);
})();
