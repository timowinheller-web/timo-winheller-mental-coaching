// Theme-Schalter, Navigation, Hero-Slider, Karussells, Scroll-Effekte, Selbstcheck, Atem-Übung, Kontaktformular
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var root = document.documentElement;

  // ---------- Theme (hell/dunkel) und Akzentfarbe ----------
  function applyTheme(theme, accent, persist) {
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-accent', accent);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#FAF5EE' : '#070C17');
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      b.setAttribute('aria-label', theme === 'light' ? 'Dunkles Schema' : 'Helles Schema');
      b.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    });
    document.querySelectorAll('button[data-accent]').forEach(function (b) { b.classList.toggle('is-active', b.dataset.accent === accent); });
    if (persist) { try { localStorage.setItem('tw-theme', theme); localStorage.setItem('tw-accent', accent); } catch (e) {} }
    window.dispatchEvent(new Event('themechange'));
  }
  applyTheme(root.getAttribute('data-theme') || 'light', root.getAttribute('data-accent') || 'ember', false);
  document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
    b.addEventListener('click', function () {
      applyTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light', root.getAttribute('data-accent'), true);
    });
  });
  document.querySelectorAll('button[data-accent]').forEach(function (b) {
    b.addEventListener('click', function () { applyTheme(root.getAttribute('data-theme'), b.dataset.accent, true); });
  });

  // ---------- Navigation ----------
  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav__toggle');
  if (nav && toggle) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  var year = document.getElementById('jahr');
  if (year) year.textContent = new Date().getFullYear();

  // ---------- Hero-Slider ----------
  var hero = document.querySelector('[data-slider]');
  if (hero) {
    var slides = hero.querySelectorAll('.hero__slide');
    var texts = hero.querySelectorAll('.hero__text');
    var dots = hero.querySelectorAll('.slider__nav .dots button');
    var idx = 0, timer;
    var go = function (n) {
      idx = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.classList.toggle('is-active', i === idx); });
      texts.forEach(function (s, i) { s.classList.toggle('is-active', i === idx); s.setAttribute('aria-hidden', i === idx ? 'false' : 'true'); });
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === idx); d.setAttribute('aria-current', i === idx ? 'true' : 'false'); });
    };
    var restart = function () { clearInterval(timer); if (!reduce) timer = setInterval(function () { go(idx + 1); }, 7000); };
    hero.querySelector('[data-prev]').addEventListener('click', function () { go(idx - 1); restart(); });
    hero.querySelector('[data-next]').addEventListener('click', function () { go(idx + 1); restart(); });
    dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i); restart(); }); });
    hero.addEventListener('mouseenter', function () { clearInterval(timer); });
    hero.addEventListener('mouseleave', restart);
    var sx = null;
    hero.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) { go(idx + (dx < 0 ? 1 : -1)); restart(); }
      sx = null;
    });
    go(0); restart();
  }

  // ---------- Karussells (Scroll-Snap, Pfeile, Punkte, Autoplay) ----------
  document.querySelectorAll('[data-carousel]').forEach(function (car) {
    var track = car.querySelector('.carousel__track');
    var items = track.children;
    var dotsWrap = car.querySelector('.carousel__dots');
    var prev = car.querySelector('[data-prev]');
    var next = car.querySelector('[data-next]');
    var cdots = [], auto;
    var stepW = function () { return items[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 20); };
    var current = function () { return Math.round(track.scrollLeft / stepW()); };
    var atEnd = function () { return track.scrollLeft >= track.scrollWidth - track.clientWidth - 2; };
    var scrollToItem = function (k) {
      k = Math.max(0, Math.min(items.length - 1, k));
      track.scrollTo({ left: k * stepW(), behavior: reduce ? 'auto' : 'smooth' });
    };
    for (var i = 0; i < items.length; i++) {
      var b = document.createElement('button');
      b.type = 'button'; b.setAttribute('aria-label', 'Karte ' + (i + 1) + ' von ' + items.length);
      b.addEventListener('click', (function (k) { return function () { scrollToItem(k); play(); }; })(i));
      dotsWrap.appendChild(b); cdots.push(b);
    }
    var update = function () {
      var k = current();
      cdots.forEach(function (d, i) { d.classList.toggle('is-active', i === k); });
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = atEnd();
    };
    var play = function () {
      clearInterval(auto);
      if (reduce) return;
      auto = setInterval(function () { atEnd() ? scrollToItem(0) : scrollToItem(current() + 1); }, 6000);
    };
    prev.addEventListener('click', function () { scrollToItem(current() - 1); play(); });
    next.addEventListener('click', function () { scrollToItem(current() + 1); play(); });
    car.addEventListener('mouseenter', function () { clearInterval(auto); });
    car.addEventListener('mouseleave', play);
    track.addEventListener('touchstart', function () { clearInterval(auto); }, { passive: true });
    track.addEventListener('focusin', function () { clearInterval(auto); });
    var raf;
    track.addEventListener('scroll', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update(); play();
  });

  // ---------- Akkordeon ----------
  document.querySelectorAll('.acc__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.acc__item');
      var open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  // ---------- Scroll-Reveal (gestaffelt) ----------
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    document.querySelectorAll('.sh, .card, .glass, .stat, .frame, .prose, .signals, .ticker, .cta__inner, .breath').forEach(function (el) {
      if (el.closest('.hero') || el.closest('.nav') || el.closest('.sticky-cta')) return;
      el.classList.add('reveal');
      var sib = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.transitionDelay = Math.min(sib, 5) * 90 + 'ms';
      io.observe(el);
    });
  }

  // ---------- Zähler ----------
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var end = parseFloat(el.dataset.count), suffix = el.dataset.suffix || '', dur = 1400, done = false;
    var run = function () {
      if (done) return; done = true;
      if (reduce) { el.textContent = end + suffix; return; }
      var t0 = performance.now();
      (function tick(now) {
        var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * e) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    };
    if ('IntersectionObserver' in window) {
      var o = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { run(); o.disconnect(); } }); });
      o.observe(el);
    } else run();
  });

  // ---------- Spotlight auf Karten, Cursor-Glow ----------
  if (finePointer) {
    var glow = document.querySelector('.cursor-glow'), gx = 0, gy = 0, pending = false;
    document.addEventListener('pointermove', function (e) {
      var card = e.target.closest ? e.target.closest('.card') : null;
      if (card) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }
      if (glow && !reduce) {
        gx = e.clientX; gy = e.clientY;
        if (!pending) {
          pending = true;
          requestAnimationFrame(function () { glow.style.transform = 'translate(' + (gx - 210) + 'px,' + (gy - 210) + 'px)'; glow.classList.add('is-on'); pending = false; });
        }
      }
    }, { passive: true });
  }

  // ---------- Fortschritt, Nach oben, Sticky-CTA ----------
  var bar = document.querySelector('.progress');
  var totop = document.querySelector('.totop');
  var sticky = document.querySelector('.sticky-cta');
  var heroEl = document.querySelector('.hero');
  function onScroll() {
    var h = document.documentElement, max = h.scrollHeight - h.clientHeight, y = window.pageYOffset || h.scrollTop;
    if (bar) bar.style.width = (max > 0 ? y / max * 100 : 0) + '%';
    if (totop) totop.classList.toggle('is-visible', y > 600);
    if (sticky) sticky.classList.toggle('is-visible', y > (heroEl ? heroEl.offsetHeight - 80 : 400));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (totop) totop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  // ---------- Selbstcheck ----------
  var sc = document.querySelector('[data-selfcheck]');
  if (sc) {
    var boxes = sc.querySelectorAll('input[type="checkbox"]');
    var out = document.querySelector('[data-selfcheck-count]');
    var txt = document.querySelector('[data-selfcheck-text]');
    var msg = function (n) {
      if (n === 0) return 'Kreuze an, was du aus den letzten Wochen kennst.';
      if (n <= 2) return 'Das kennt fast jeder. Wenn es länger bleibt, lohnt sich ein Blick darauf.';
      if (n <= 4) return 'Das ist mehr als ein stressiger Monat. Lass uns 30 Minuten sprechen.';
      return 'Du trägst gerade viel. Ein Erstgespräch kostet nichts — außer 30 Minuten.';
    };
    var upd = function () {
      var n = 0; boxes.forEach(function (b) { if (b.checked) n++; });
      out.textContent = n + ' von ' + boxes.length;
      txt.textContent = msg(n);
    };
    boxes.forEach(function (b) { b.addEventListener('change', upd); });
    upd();
  }

  // ---------- Atem-Übung (4 ein · 4 halten · 6 aus, 3 Runden) ----------
  var br = document.querySelector('[data-breath]');
  if (br) {
    var circle = br.querySelector('.breath__circle');
    var label = br.querySelector('.breath__label strong');
    var sub = br.querySelector('.breath__label span');
    var btnB = br.querySelector('[data-breath-start]');
    var phases = [['Einatmen', 4000, 'is-in'], ['Halten', 4000, 'is-hold'], ['Ausatmen', 6000, 'is-out']];
    var running = false, tmr;
    var stopB = function (text) {
      running = false; clearTimeout(tmr);
      circle.className = 'breath__circle';
      btnB.textContent = 'Starten';
      if (text) { label.textContent = text; sub.textContent = 'Drei Runden'; }
    };
    var runB = function () {
      var r = 0, p = 0; running = true; btnB.textContent = 'Stopp';
      var nextPhase = function () {
        if (!running) return;
        if (p === 0) { r++; if (r > 3) { stopB('Fertig. Wie fühlst du dich?'); return; } sub.textContent = 'Runde ' + r + ' von 3'; }
        var ph = phases[p];
        label.textContent = ph[0];
        circle.className = 'breath__circle ' + ph[2];
        circle.style.transitionDuration = ph[1] + 'ms';
        tmr = setTimeout(function () { p = (p + 1) % 3; nextPhase(); }, ph[1]);
      };
      nextPhase();
    };
    btnB.addEventListener('click', function () { if (running) { stopB('Bereit?'); sub.textContent = '4 ein · 4 halten · 6 aus'; } else runB(); });
  }

  // ---------- Kontaktformular ----------
  var form = document.getElementById('kontaktformular');
  if (!form) return;
  var ds = form.querySelector('#datenschutz');
  var send = form.querySelector('#senden');
  function syncSend() { send.disabled = !ds.checked; }
  ds.addEventListener('change', syncSend);
  syncSend();
  function setInvalid(el, bad) { el.closest('.field').classList.toggle('is-invalid', bad); return !bad; }
  form.addEventListener('submit', function (e) {
    var name = form.querySelector('#name');
    var email = form.querySelector('#email');
    var msgEl = form.querySelector('#nachricht');
    var ok = true;
    ok = setInvalid(name, !name.value.trim()) && ok;
    ok = setInvalid(email, !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) && ok;
    ok = setInvalid(msgEl, msgEl.value.trim().length < 10) && ok;
    ok = setInvalid(ds, !ds.checked) && ok;
    if (!ok) { e.preventDefault(); return; }
    // Fallback: solange kein Formular-Dienst eingetragen ist, per E-Mail-Programm senden.
    if (form.dataset.fallback === 'mailto') {
      e.preventDefault();
      var format = form.querySelector('#format').value;
      var body = 'Name: ' + name.value + '\nE-Mail: ' + email.value + '\nFormat: ' + format + '\n\n' + msgEl.value;
      window.location.href = 'mailto:' + form.dataset.mail + '?subject=' + encodeURIComponent('Anfrage Erstgespräch') + '&body=' + encodeURIComponent(body);
      form.classList.add('is-sent');
    }
  });
})();
