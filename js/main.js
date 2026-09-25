// Navigation, Karussells, Akkordeon, Scroll-Effekte, Selbstcheck, Atem-Übung, Mentale-Stärke-Check,
// Ereignis-Tracking (nur wenn ein cookieloses Analyse-Tool eingebunden ist), Kontaktformular (Web3Forms / Mail-Fallback)
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  // ---- Tracking: sendet Ereignisse an Plausible/Umami, falls vorhanden; sonst passiert nichts ----
  function track(name, props) {
    try {
      if (window.plausible) window.plausible(name, props ? { props: props } : undefined);
      if (window.umami && window.umami.track) window.umami.track(name, props);
    } catch (e) { /* still */ }
  }
  document.addEventListener('click', function (e) { var t = e.target.closest('[data-track]'); if (t && t.tagName !== 'BUTTON') track(t.getAttribute('data-track')); });
  document.addEventListener('tw:track', function (e) { track(e.detail.name, e.detail.props); });

  // ---- Navigation ----
  var nav = document.querySelector('.nav'), toggle = document.querySelector('.nav__toggle');
  if (nav && toggle) {
    toggle.addEventListener('click', function () { var open = nav.classList.toggle('is-open'); toggle.setAttribute('aria-expanded', open ? 'true' : 'false'); toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); } });
  }
  var year = document.getElementById('jahr'); if (year) year.textContent = new Date().getFullYear();

  // ---- Karussell (manuell, kein Autoplay) ----
  document.querySelectorAll('[data-carousel]').forEach(function (car) {
    var track_ = car.querySelector('.carousel__track'), items = track_.children, dotsWrap = car.querySelector('.carousel__dots'), prev = car.querySelector('[data-prev]'), next = car.querySelector('[data-next]'), cdots = [];
    var stepW = function () { return items[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(track_).columnGap) || 20); };
    var current = function () { return Math.round(track_.scrollLeft / stepW()); };
    var scrollToItem = function (k) { k = Math.max(0, Math.min(items.length - 1, k)); track_.scrollTo({ left: k * stepW(), behavior: reduce ? 'auto' : 'smooth' }); };
    for (var i = 0; i < items.length; i++) { var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Karte ' + (i + 1) + ' von ' + items.length); b.addEventListener('click', (function (k) { return function () { scrollToItem(k); }; })(i)); dotsWrap.appendChild(b); cdots.push(b); }
    var update = function () { var k = current(); cdots.forEach(function (d, i) { d.classList.toggle('is-active', i === k); }); prev.disabled = track_.scrollLeft <= 2; next.disabled = track_.scrollLeft >= track_.scrollWidth - track_.clientWidth - 2; };
    prev.addEventListener('click', function () { scrollToItem(current() - 1); }); next.addEventListener('click', function () { scrollToItem(current() + 1); });
    track_.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); scrollToItem(current() + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); scrollToItem(current() - 1); } });
    var raf; track_.addEventListener('scroll', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update); update();
  });

  // ---- Akkordeon ----
  document.querySelectorAll('.acc__btn').forEach(function (btn) { btn.addEventListener('click', function () { var item = btn.closest('.acc__item'); var open = item.classList.toggle('is-open'); btn.setAttribute('aria-expanded', open ? 'true' : 'false'); }); });
  if (location.hash) { var target = document.querySelector(location.hash); if (target) { var first = target.querySelector('.acc__item'); if (first && !first.classList.contains('is-open')) { first.classList.add('is-open'); first.querySelector('.acc__btn').setAttribute('aria-expanded', 'true'); } } }

  // ---- Ein leiser Reveal: nur Abschnitts-Köpfe und große Flächen, kein Karten-Geflacker ----
  var revealVisible = function () { document.querySelectorAll('.reveal:not(.is-visible)').forEach(function (el) { var r = el.getBoundingClientRect(); if (r.bottom > 0 && r.top < window.innerHeight * 1.2) el.classList.add('is-visible'); }); };
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    document.querySelectorAll('.sh, .frame, .media, .about__portrait, .method, .brain, .cta__inner').forEach(function (el) {
      if (el.closest('.hero') || el.closest('.nav') || el.closest('[hidden]') || el.closest('.gate')) return;
      el.classList.add('reveal'); io.observe(el);
    });
    setTimeout(revealVisible, 2000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) setTimeout(revealVisible, 100); });
    window.addEventListener('scroll', revealVisible, { passive: true });
  }

  // ---- Zähler ----
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var end = parseFloat(el.dataset.count), suffix = el.dataset.suffix || '', done = false;
    var run = function () { if (done) return; done = true; if (reduce) { el.textContent = end + suffix; return; } var t0 = performance.now(); (function tick(now) { var p = Math.min(1, (now - t0) / 1100), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * e) + suffix; if (p < 1) requestAnimationFrame(tick); })(t0); };
    if ('IntersectionObserver' in window) { var o = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { run(); o.disconnect(); } }); }); o.observe(el); } else run();
  });

  // ---- Fortschritt, Nach oben, Sticky-CTA ----
  var totop = document.querySelector('.totop'), sticky = document.querySelector('.sticky-cta'), heroEl = document.querySelector('.hero');
  var heroImg = (!reduce && finePointer) ? document.querySelector('.hero__img') : null;
  function onScroll() {
    var h = document.documentElement, max = h.scrollHeight - h.clientHeight, y = window.pageYOffset || h.scrollTop;
    if (heroImg) heroImg.style.transform = 'translateY(' + Math.min(y, 900) * 0.10 + 'px)';
    if (nav) nav.classList.toggle('is-scrolled', y > 40);
    if (totop) totop.classList.toggle('is-visible', y > 600);
    if (sticky) sticky.classList.toggle('is-visible', y > (heroEl ? heroEl.offsetHeight - 80 : 400));
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (totop) totop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });


  // ---- Kurzer Selbstcheck (Startseite) ----
  var sc = document.querySelector('[data-selfcheck]');
  if (sc) {
    var boxes = sc.querySelectorAll('input[type="checkbox"]'), out = document.querySelector('[data-selfcheck-count]'), txt = document.querySelector('[data-selfcheck-text]');
    var msg = function (n) { if (n === 0) return 'Kreuze an, was du aus den letzten Wochen kennst.'; if (n <= 2) return 'Das kennt fast jeder. Wenn es länger bleibt, lohnt sich ein Blick darauf.'; if (n <= 4) return 'Das ist mehr als ein stressiger Monat. Der ausführliche Check ordnet es ein.'; return 'Da bremst gerade einiges. Mach den Check, oder lass uns direkt 20 Minuten sprechen.'; };
    var upd = function () { var n = 0; boxes.forEach(function (b) { if (b.checked) n++; }); out.textContent = n + ' von ' + boxes.length; txt.textContent = msg(n); };
    boxes.forEach(function (b) { b.addEventListener('change', upd); }); upd();
  }

  // ---- Atem-Übung (auf jeder Seite, auf der sie steht) ----
  document.querySelectorAll('[data-breath]').forEach(function (br) {
    var circle = br.querySelector('.breath__circle'), label = br.querySelector('.breath__label strong'), sub = br.querySelector('.breath__label span'), btnB = br.querySelector('[data-breath-start]');
    var phases = [['Einatmen', 4000, 'is-in'], ['Halten', 4000, 'is-hold'], ['Ausatmen', 6000, 'is-out']], running = false, tmr;
    var stopB = function (t) { running = false; clearTimeout(tmr); circle.className = 'breath__circle'; btnB.textContent = 'Starten'; if (t) { label.textContent = t; sub.textContent = 'Drei Runden'; } };
    var runB = function () { var r = 0, p = 0; running = true; btnB.textContent = 'Stopp'; var nextPhase = function () { if (!running) return; if (p === 0) { r++; if (r > 3) { stopB('Fertig. Wie fühlst du dich?'); track('Atemübung beendet'); return; } sub.textContent = 'Runde ' + r + ' von 3'; } var ph = phases[p]; label.textContent = ph[0]; circle.className = 'breath__circle ' + ph[2]; circle.style.transitionDuration = ph[1] + 'ms'; tmr = setTimeout(function () { p = (p + 1) % 3; nextPhase(); }, ph[1]); }; nextPhase(); };
    btnB.addEventListener('click', function () { if (running) { stopB('Bereit?'); sub.textContent = '4 ein, 4 halten, 6 aus'; } else runB(); });
  });

  // ---- Drucken ----
  document.querySelectorAll('[data-print]').forEach(function (b) { b.addEventListener('click', function () { window.print(); }); });

  // ---- Mentale-Stärke-Check: 10 Aussagen, 0–3 Punkte, drei Bereiche. Nichts wird gespeichert. ----
  var chk = document.querySelector('[data-check]');
  if (chk) {
    var radios = chk.querySelectorAll('input[type="radio"]'), qs = chk.querySelectorAll('.check__q'), N = qs.length;
    var count = chk.querySelector('[data-check-count]'), fill = chk.querySelector('.check__bar i'), evalBtn = chk.querySelector('[data-check-eval]'), result = chk.querySelector('[data-check-result]');
    var bandEl = result.querySelector('[data-check-band]'), scoreEl = result.querySelector('[data-check-score]'), marker = result.querySelector('[data-check-marker]'), cta = result.querySelector('[data-check-cta]'), resetBtn = result.querySelector('[data-check-reset]');
    var LABEL = { low: 'Stabil', mid: 'Angespannt', high: 'Blockiert' };
    var answers = function () { var a = {}; radios.forEach(function (r) { if (r.checked) a[r.name] = parseInt(r.value, 10); }); return a; };
    var update = function () { var a = answers(), n = Object.keys(a).length; count.textContent = n + ' von ' + N; fill.style.width = (n / N * 100) + '%'; evalBtn.disabled = n < N; qs.forEach(function (q) { q.classList.toggle('is-done', q.querySelector('input').name in a); }); };
    var evaluate = function () {
      var a = answers(), s = 0; for (var k in a) s += a[k];
      var band = s <= 8 ? 'low' : (s <= 17 ? 'mid' : 'high');
      bandEl.textContent = LABEL[band]; scoreEl.textContent = s + ' von 30 Punkten'; marker.style.left = (s / 30 * 100) + '%';
      result.querySelectorAll('[data-band]').forEach(function (d) { d.hidden = d.dataset.band !== band; });
      cta.href = 'kontakt.html?check=' + band; result.hidden = false;
      result.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); setTimeout(function () { result.focus({ preventScroll: true }); }, 450);
      track('Check abgeschlossen', { bereich: LABEL[band] });
    };
    radios.forEach(function (r) { r.addEventListener('change', update); });
    evalBtn.addEventListener('click', evaluate);
    resetBtn.addEventListener('click', function () { radios.forEach(function (r) { r.checked = false; }); result.hidden = true; update(); chk.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); });
    update();
  }

  // ---- Kontaktformular ----
  var form = document.getElementById('kontaktformular');
  if (!form) return;
  var params = new URLSearchParams(location.search), band = params.get('check'), BAND = { low: 'stabil', mid: 'angespannt', high: 'blockiert' };
  if (band && BAND[band]) {
    var field = form.querySelector('[data-check-field]'), note = form.querySelector('[data-check-note]');
    if (field) field.value = BAND[band] + ' (Mentale-Stärke-Check)';
    if (note) { note.hidden = false; note.querySelector('[data-check-label]').textContent = BAND[band]; }
  }
  var ds = form.querySelector('#datenschutz'), send = form.querySelector('#senden'), summary = form.querySelector('.form__errors');
  var syncSend = function () { send.disabled = !ds.checked; }; ds.addEventListener('change', syncSend); syncSend();
  var rules = [
    ['#name', function (el) { return !!el.value.trim(); }, 'Name fehlt'],
    ['#email', function (el) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value); }, 'E-Mail-Adresse prüfen'],
    ['#nachricht', function (el) { return el.value.trim().length >= 10; }, 'Kurz beschreiben, was anders sein soll'],
    ['#bestaetigung', function (el) { return el.checked; }, 'Bestätigung zu Coaching und Krise fehlt'],
    ['#datenschutz', function (el) { return el.checked; }, 'Datenschutz-Einwilligung fehlt']
  ];
  var check = function (rule) { var el = form.querySelector(rule[0]); var ok = rule[1](el); el.closest('.field').classList.toggle('is-invalid', !ok); el.setAttribute('aria-invalid', ok ? 'false' : 'true'); return ok; };
  rules.slice(0, 3).forEach(function (rule) { var el = form.querySelector(rule[0]); el.addEventListener('blur', function () { if (el.value) check(rule); }); el.addEventListener('input', function () { if (el.closest('.field').classList.contains('is-invalid')) check(rule); }); });
  form.addEventListener('submit', function (e) {
    var failed = rules.filter(function (rule) { return !check(rule); });
    if (failed.length) {
      e.preventDefault();
      var ul = summary.querySelector('ul'); ul.innerHTML = '';
      failed.forEach(function (rule) { var li = document.createElement('li'), a = document.createElement('a'); a.href = rule[0]; a.textContent = rule[2]; a.addEventListener('click', function (ev) { ev.preventDefault(); form.querySelector(rule[0]).focus(); }); li.appendChild(a); ul.appendChild(li); });
      summary.hidden = false; summary.focus(); return;
    }
    summary.hidden = true;
    track('Anfrage gesendet', { thema: form.querySelector('#thema').value });
    var key = form.querySelector('input[name="access_key"]');
    if (!key || key.value.charAt(0) === '[') {
      e.preventDefault(); var lines = [];
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || el.type === 'hidden' && !el.value || el.type === 'submit' || el.name === 'botcheck' || el.name === 'access_key' || el.name === 'subject' || el.name === 'from_name' || el.name === 'redirect') return;
        if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) return;
        var labelEl = form.querySelector('label[for="' + el.id + '"]') || (el.closest('.field') && el.closest('.field').querySelector('.field__label'));
        lines.push((labelEl ? labelEl.textContent.replace(/\*/g, '').trim() : el.name) + ': ' + (el.type === 'checkbox' ? 'ja' : el.value));
      });
      window.location.href = 'mailto:' + (form.dataset.mail || 'info@timowinheller.de') + '?subject=' + encodeURIComponent('Anfrage Erstgespräch') + '&body=' + encodeURIComponent(lines.join('\n'));
      form.classList.add('is-sent');
    }
  });
})();
