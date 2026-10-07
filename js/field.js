// Neuronenfeld im Hero: Punkte und Verbindungen, die auf Maus/Finger reagieren.
// Bewegt sich nur bei Interaktion, plus einmal beim Laden (Aufbau, 1,4 s). Keine Dauerschleife.
(function () {
  var canvas = document.querySelector('canvas[data-field]');
  if (!canvas) return;
  var ctx = canvas.getContext('2d'), DPR = Math.min(window.devicePixelRatio || 1, 2);
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cs = getComputedStyle(document.documentElement);
  var NODE = (cs.getPropertyValue('--neural-node').trim() || '141,166,255'), LINE = (cs.getPropertyValue('--neural-line').trim() || '200,206,230');
  var W = 0, H = 0, nodes = [], links = [], pointer = null, boot = 0, bootStart = 0, raf = null, active = false, lastMove = 0;
  function build() {
    var r = canvas.getBoundingClientRect(); W = r.width; H = r.height;
    canvas.width = W * DPR; canvas.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var n = Math.round(Math.min(220, Math.max(70, W * H / 9000))), rnd = seeded(11);
    nodes = []; for (var i = 0; i < n; i++) nodes.push({ x: rnd() * W, y: rnd() * H, r: 1.2 + rnd() * 1.8, lit: 0, ox: 0, oy: 0, ph: rnd() * 6.28 });
    links = []; var d = Math.min(170, Math.max(110, W / 9));
    for (i = 0; i < n; i++) for (var j = i + 1; j < n; j++) { var dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y, dd = Math.sqrt(dx * dx + dy * dy); if (dd < d) links.push([i, j, 1 - dd / d]); }
    draw();
  }
  function seeded(s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    var t = boot, i, a, b;
    for (i = 0; i < links.length; i++) {
      a = nodes[links[i][0]]; b = nodes[links[i][1]];
      var base = links[i][2] * 0.22 * t, lit = Math.max(a.lit, b.lit);
      ctx.strokeStyle = lit > 0.03 ? 'rgba(' + NODE + ',' + Math.min(1, base + lit * 0.9).toFixed(3) + ')' : 'rgba(' + LINE + ',' + base.toFixed(3) + ')';
      ctx.lineWidth = lit > 0.03 ? 1.1 : 0.8;
      ctx.beginPath(); ctx.moveTo(a.x + a.ox, a.y + a.oy); ctx.lineTo(b.x + b.ox, b.y + b.oy); ctx.stroke();
    }
    if (pointer) { for (i = 0; i < nodes.length; i++) { a = nodes[i]; var dx = a.x + a.ox - pointer[0], dy = a.y + a.oy - pointer[1], dd = Math.sqrt(dx * dx + dy * dy); if (dd < 160) { ctx.strokeStyle = 'rgba(' + NODE + ',' + ((1 - dd / 160) * 0.55).toFixed(3) + ')'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(a.x + a.ox, a.y + a.oy); ctx.lineTo(pointer[0], pointer[1]); ctx.stroke(); } } }
    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];
      var al = (0.35 + a.lit * 0.65) * t, rr = a.r + a.lit * 2.2;
      if (a.lit > 0.05) { var g = ctx.createRadialGradient(a.x + a.ox, a.y + a.oy, 0, a.x + a.ox, a.y + a.oy, rr * 5); g.addColorStop(0, 'rgba(' + NODE + ',' + (a.lit * 0.5).toFixed(3) + ')'); g.addColorStop(1, 'rgba(' + NODE + ',0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(a.x + a.ox, a.y + a.oy, rr * 5, 0, 6.283); ctx.fill(); }
      ctx.fillStyle = a.lit > 0.05 ? 'rgba(' + NODE + ',' + Math.min(1, al + 0.3).toFixed(3) + ')' : 'rgba(' + LINE + ',' + al.toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(a.x + a.ox, a.y + a.oy, rr, 0, 6.283); ctx.fill();
    }
  }
  function step(now) {
    var busy = false;
    if (bootStart) { boot = Math.min(1, (now - bootStart) / 1400); boot = 1 - Math.pow(1 - boot, 3); if (boot < 1) busy = true; else bootStart = 0; }
    for (var i = 0; i < nodes.length; i++) {
      var a = nodes[i];
      if (pointer) { var dx = pointer[0] - (a.x), dy = pointer[1] - (a.y), dd = Math.sqrt(dx * dx + dy * dy); if (dd < 220) { var f = (1 - dd / 220); a.lit = Math.min(1, a.lit + f * 0.12); a.ox += (dx * f * 0.08 - a.ox) * 0.12; a.oy += (dy * f * 0.08 - a.oy) * 0.12; } }
      if (a.lit > 0.002) { a.lit *= 0.94; busy = true; } else a.lit = 0;
      if (Math.abs(a.ox) > 0.05 || Math.abs(a.oy) > 0.05) { a.ox *= 0.9; a.oy *= 0.9; busy = true; } else { a.ox = 0; a.oy = 0; }
    }
    draw();
    if (busy || (pointer && now - lastMove < 120)) raf = requestAnimationFrame(step); else { raf = null; active = false; }
  }
  function wake() { if (!active) { active = true; raf = requestAnimationFrame(step); } }
  var host = canvas.closest('.hero') || canvas;
  host.addEventListener('pointermove', function (e) { var r = canvas.getBoundingClientRect(); pointer = [e.clientX - r.left, e.clientY - r.top]; lastMove = performance.now(); wake(); }, { passive: true });
  host.addEventListener('pointerleave', function () { pointer = null; wake(); });
  host.addEventListener('pointerdown', function (e) { var r = canvas.getBoundingClientRect(); var px = e.clientX - r.left, py = e.clientY - r.top; nodes.forEach(function (a) { var dx = a.x - px, dy = a.y - py, dd = Math.sqrt(dx * dx + dy * dy); if (dd < 260) a.lit = Math.min(1, a.lit + (1 - dd / 260)); }); wake(); }, { passive: true });
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(build, 150); });
  build();
  if (reduce) { boot = 1; draw(); } else { boot = 0; bootStart = performance.now(); wake(); }
})();
