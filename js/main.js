// Navigation, Karussells, Akkordeon, Scroll-Effekte, Selbstcheck, Atem-Übung, Kontaktformular (Web3Forms / Mail-Fallback)
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Navigation ----------
  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav__toggle');
  if (nav && toggle) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
  }
  var year = document.getElementById('jahr');
  if (year) year.textContent = new Date().getFullYear();

  // ---------- Karussells ----------
  document.querySelectorAll('[data-carousel]').forEach(function (car) {
    var track = car.querySelector('.carousel__track'), items = track.children;
    var dotsWrap = car.querySelector('.carousel__dots'), prev = car.querySelector('[data-prev]'), next = car.querySelector('[data-next]');
    var cdots = [], auto;
    var stepW = function () { return items[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 20); };
    var current = function () { return Math.round(track.scrollLeft / stepW()); };
    var atEnd = function () { return track.scrollLeft >= track.scrollWidth - track.clientWidth - 2; };
    var scrollToItem = function (k) { k = Math.max(0, Math.min(items.length - 1, k)); track.scrollTo({ left: k * stepW(), behavior: reduce ? 'auto' : 'smooth' }); };
    for (var i = 0; i < items.length; i++) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Karte ' + (i + 1) + ' von ' + items.length);
      b.addEventListener('click', (function (k) { return function () { scrollToItem(k); play(); }; })(i));
      dotsWrap.appendChild(b); cdots.push(b);
    }
    var update = function () { var k = current(); cdots.forEach(function (d, i) { d.classList.toggle('is-active', i === k); }); prev.disabled = track.scrollLeft <= 2; next.disabled = atEnd(); };
    var play = function () { clearInterval(auto); if (reduce) return; auto = setInterval(function () { atEnd() ? scrollToItem(0) : scrollToItem(current() + 1); }, 6500); };
    prev.addEventListener('click', function () { scrollToItem(current() - 1); play(); });
    next.addEventListener('click', function () { scrollToItem(current() + 1); play(); });
    car.addEventListener('mouseenter', function () { clearInterval(auto); });
    car.addEventListener('mouseleave', play);
    track.addEventListener('touchstart', function () { clearInterval(auto); }, { passive: true });
    track.addEventListener('focusin', function () { clearInterval(auto); });
    var raf; track.addEventListener('scroll', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update); update(); play();
  });

  // ---------- Akkordeon ----------
  document.querySelectorAll('.acc__btn').forEach(function (btn) {
    btn.addEventListener('click', function () { var item = btn.closest('.acc__item'); var open = item.classList.toggle('is-open'); btn.setAttribute('aria-expanded', open ? 'true' : 'false'); });
  });

  // ---------- Scroll-Reveal ----------
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    document.querySelectorAll('.sh, .card, .stat-item, .frame, .prose, .signals, .selfcheck, .breath, .cta__inner, .stats').forEach(function (el) {
      if (el.closest('.hero') || el.closest('.nav') || el.closest('[hidden]')) return;
      el.classList.add('reveal');
      var sib = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.transitionDelay = Math.min(sib, 5) * 80 + 'ms';
      io.observe(el);
    });
  }

  // ---------- Zähler ----------
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var end = parseFloat(el.dataset.count), suffix = el.dataset.suffix || '', done = false;
    var run = function () {
      if (done) return; done = true;
      if (reduce) { el.textContent = end + suffix; return; }
      var t0 = performance.now();
      (function tick(now) { var p = Math.min(1, (now - t0) / 1300), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * e) + suffix; if (p < 1) requestAnimationFrame(tick); })(t0);
    };
    if ('IntersectionObserver' in window) { var o = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { run(); o.disconnect(); } }); }); o.observe(el); } else run();
  });

  // ---------- Fortschritt, Nach oben, Sticky-CTA ----------
  var bar = document.querySelector('.progress'), totop = document.querySelector('.totop'), sticky = document.querySelector('.sticky-cta'), heroEl = document.querySelector('.hero');
  function onScroll() {
    var h = document.documentElement, max = h.scrollHeight - h.clientHeight, y = window.pageYOffset || h.scrollTop;
    if (bar) bar.style.width = (max > 0 ? y / max * 100 : 0) + '%';
    if (totop) totop.classList.toggle('is-visible', y > 600);
    if (sticky) sticky.classList.toggle('is-visible', y > (heroEl ? heroEl.offsetHeight - 80 : 400));
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (totop) totop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  // ---------- Selbstcheck ----------
  var sc = document.querySelector('[data-selfcheck]');
  if (sc) {
    var boxes = sc.querySelectorAll('input[type="checkbox"]'), out = document.querySelector('[data-selfcheck-count]'), txt = document.querySelector('[data-selfcheck-text]');
    var msg = function (n) {
      if (n === 0) return 'Kreuze an, was du aus den letzten Wochen kennst.';
      if (n <= 2) return 'Das kennt fast jeder. Wenn es länger bleibt, lohnt sich ein Blick darauf.';
      if (n <= 4) return 'Das ist mehr als ein stressiger Monat. Lass uns 20 Minuten sprechen.';
      return 'Da bremst gerade einiges. Ein Erstgespräch kostet nichts — außer 20 Minuten.';
    };
    var upd = function () { var n = 0; boxes.forEach(function (b) { if (b.checked) n++; }); out.textContent = n + ' von ' + boxes.length; txt.textContent = msg(n); };
    boxes.forEach(function (b) { b.addEventListener('change', upd); }); upd();
  }

  // ---------- Atem-Übung (4 ein · 4 halten · 6 aus, 3 Runden) ----------
  var br = document.querySelector('[data-breath]');
  if (br) {
    var circle = br.querySelector('.breath__circle'), label = br.querySelector('.breath__label strong'), sub = br.querySelector('.breath__label span'), btnB = br.querySelector('[data-breath-start]');
    var phases = [['Einatmen', 4000, 'is-in'], ['Halten', 4000, 'is-hold'], ['Ausatmen', 6000, 'is-out']];
    var running = false, tmr;
    var stopB = function (text) { running = false; clearTimeout(tmr); circle.className = 'breath__circle'; btnB.textContent = 'Starten'; if (text) { label.textContent = text; sub.textContent = 'Drei Runden'; } };
    var runB = function () {
      var r = 0, p = 0; running = true; btnB.textContent = 'Stopp';
      var nextPhase = function () {
        if (!running) return;
        if (p === 0) { r++; if (r > 3) { stopB('Fertig. Wie fühlst du dich?'); return; } sub.textContent = 'Runde ' + r + ' von 3'; }
        var ph = phases[p]; label.textContent = ph[0]; circle.className = 'breath__circle ' + ph[2]; circle.style.transitionDuration = ph[1] + 'ms';
        tmr = setTimeout(function () { p = (p + 1) % 3; nextPhase(); }, ph[1]);
      };
      nextPhase();
    };
    btnB.addEventListener('click', function () { if (running) { stopB('Bereit?'); sub.textContent = '4 ein · 4 halten · 6 aus'; } else runB(); });
  }

  // ---------- Kontaktformular ----------
  // Versand über Web3Forms (access_key im Formular). Solange dort noch der Platzhalter steht,
  // öffnet das Formular stattdessen das E-Mail-Programm mit allen Angaben.
  var form = document.getElementById('kontaktformular');
  if (!form) return;
  var ds = form.querySelector('#datenschutz'), send = form.querySelector('#senden');
  var syncSend = function () { send.disabled = !ds.checked; };
  ds.addEventListener('change', syncSend); syncSend();
  var setInvalid = function (el, bad) { el.closest('.field').classList.toggle('is-invalid', bad); return !bad; };
  form.addEventListener('submit', function (e) {
    var name = form.querySelector('#name'), email = form.querySelector('#email'), msgEl = form.querySelector('#nachricht'), best = form.querySelector('#bestaetigung');
    var ok = true;
    ok = setInvalid(name, !name.value.trim()) && ok;
    ok = setInvalid(email, !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) && ok;
    ok = setInvalid(msgEl, msgEl.value.trim().length < 10) && ok;
    if (best) ok = setInvalid(best, !best.checked) && ok;
    ok = setInvalid(ds, !ds.checked) && ok;
    if (!ok) { e.preventDefault(); form.querySelector('.field.is-invalid').scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }); return; }
    var key = form.querySelector('input[name="access_key"]');
    if (!key || key.value.charAt(0) === '[') {
      e.preventDefault();
      var lines = [];
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || el.type === 'hidden' || el.type === 'submit' || el.name === 'botcheck') return;
        if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) return;
        var labelEl = form.querySelector('label[for="' + el.id + '"]') || (el.closest('.field') && el.closest('.field').querySelector('.field__label'));
        var label = labelEl ? labelEl.textContent.replace(/\*/g, '').trim() : el.name;
        var val = el.type === 'checkbox' ? 'ja' : el.value;
        lines.push(label + ': ' + val);
      });
      window.location.href = 'mailto:' + (form.dataset.mail || 'info@timowinheller.de') + '?subject=' + encodeURIComponent('Anfrage Erstgespräch') + '&body=' + encodeURIComponent(lines.join('\n'));
      form.classList.add('is-sent');
    }
  });
})();
