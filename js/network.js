// Subtiles neuronales Netzwerk im Seitenhintergrund: Punkte treiben sehr langsam, Verbindungen entstehen und lösen sich.
// Parallaxe: das Netz bewegt sich mit 0,7-facher Scroll-Geschwindigkeit. Beim Scrollen wächst die Verbindungsweite leicht.
// Läuft nur, solange der Tab sichtbar ist (30 fps). Bei „Bewegung reduzieren“ wird einmal statisch gezeichnet.
(function () {
  var cv = document.querySelector('canvas.net-bg');
  if (!cv) return;
  var ctx = cv.getContext('2d'), DPR = Math.min(window.devicePixelRatio || 1, 2);
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 0, H = 0, nodes = [], col = {}, raf = null, last = 0;
  function colors() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    col = dark ? { line: '141,176,255', dot: '120,165,255', coral: '255,140,120', a: 0.22 } : { line: '7,20,38', dot: '36,123,255', coral: '255,115,95', a: 0.13 };
  }
  function build() {
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + 'px'; cv.style.height = H + 'px'; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var n = Math.round(Math.min(78, Math.max(28, W * H / 21000))); nodes = [];
    for (var i = 0; i < n; i++) nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.14, vy: (Math.random() - 0.5) * 0.14, r: 1 + Math.random() * 1.4, c: Math.random() < 0.1 });
  }
  function draw() {
    var sy = (window.pageYOffset || 0) * 0.7, maxS = Math.max(1, document.documentElement.scrollHeight - H);
    var reach = 130 + 40 * Math.min(1, (window.pageYOffset || 0) / maxS);
    ctx.clearRect(0, 0, W, H);
    var pts = nodes.map(function (p) { var y = ((p.y - sy) % H + H) % H; return [p.x, y, p]; });
    for (var i = 0; i < pts.length; i++) for (var j = i + 1; j < pts.length; j++) {
      var dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1], d = Math.sqrt(dx * dx + dy * dy);
      if (d < reach) { ctx.strokeStyle = 'rgba(' + col.line + ',' + ((1 - d / reach) * col.a).toFixed(3) + ')'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[j][0], pts[j][1]); ctx.stroke(); }
    }
    for (i = 0; i < pts.length; i++) { var p = pts[i][2]; ctx.fillStyle = 'rgba(' + (p.c ? col.coral : col.dot) + ',' + (col.a * 2.6).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(pts[i][0], pts[i][1], p.r, 0, 6.283); ctx.fill(); }
  }
  function step(t) {
    raf = requestAnimationFrame(step);
    if (t - last < 33) return; last = t;
    for (var i = 0; i < nodes.length; i++) { var p = nodes[i]; p.x += p.vx; p.y += p.vy; if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20; if (p.y < 0) p.y += H; if (p.y > H) p.y -= H; }
    draw();
  }
  colors(); build();
  if (reduce) { draw(); window.addEventListener('scroll', draw, { passive: true }); }
  else raf = requestAnimationFrame(step);
  document.addEventListener('visibilitychange', function () { if (reduce) return; if (document.hidden) { cancelAnimationFrame(raf); raf = null; } else if (!raf) raf = requestAnimationFrame(step); });
  new MutationObserver(function () { colors(); draw(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { build(); draw(); }, 200); });
})();
