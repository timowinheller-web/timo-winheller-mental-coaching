// Navigation (mobil), Hero-Slider, Karussells, Akkordeon, Footer-Jahr, Kontaktformular
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  // Hero-Slider: Bild + Text wechseln alle 7 s, Pfeile, Punkte, Wischen
  var hero = document.querySelector('[data-slider]');
  if (hero) {
    var slides = hero.querySelectorAll('.hero__slide');
    var texts = hero.querySelectorAll('.hero__text');
    var dots = hero.querySelectorAll('.dots button');
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

  // Karussells: Scroll-Snap-Spur, Pfeile, Punkte
  document.querySelectorAll('[data-carousel]').forEach(function (car) {
    var track = car.querySelector('.carousel__track');
    var items = track.children;
    var dotsWrap = car.querySelector('.carousel__dots');
    var prev = car.querySelector('[data-prev]');
    var next = car.querySelector('[data-next]');
    var cdots = [];
    var stepW = function () {
      var gap = parseFloat(getComputedStyle(track).columnGap) || 20;
      return items[0].getBoundingClientRect().width + gap;
    };
    var current = function () { return Math.round(track.scrollLeft / stepW()); };
    var scrollToItem = function (k) {
      k = Math.max(0, Math.min(items.length - 1, k));
      track.scrollTo({ left: k * stepW(), behavior: reduce ? 'auto' : 'smooth' });
    };
    for (var i = 0; i < items.length; i++) {
      var b = document.createElement('button');
      b.type = 'button'; b.setAttribute('aria-label', 'Karte ' + (i + 1) + ' von ' + items.length);
      b.addEventListener('click', (function (k) { return function () { scrollToItem(k); }; })(i));
      dotsWrap.appendChild(b); cdots.push(b);
    }
    var update = function () {
      var k = current();
      cdots.forEach(function (d, i) { d.classList.toggle('is-active', i === k); });
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
    };
    prev.addEventListener('click', function () { scrollToItem(current() - 1); });
    next.addEventListener('click', function () { scrollToItem(current() + 1); });
    var raf;
    track.addEventListener('scroll', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  document.querySelectorAll('.acc__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.acc__item');
      var open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  var form = document.getElementById('kontaktformular');
  if (!form) return;
  var ds = form.querySelector('#datenschutz');
  var send = form.querySelector('#senden');

  // Senden erst möglich, wenn der Datenschutz-Haken gesetzt ist
  function syncSend() { send.disabled = !ds.checked; }
  ds.addEventListener('change', syncSend);
  syncSend();

  function setInvalid(el, bad) {
    el.closest('.field').classList.toggle('is-invalid', bad);
    return !bad;
  }

  form.addEventListener('submit', function (e) {
    var name = form.querySelector('#name');
    var email = form.querySelector('#email');
    var msg = form.querySelector('#nachricht');
    var ok = true;
    ok = setInvalid(name, !name.value.trim()) && ok;
    ok = setInvalid(email, !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) && ok;
    ok = setInvalid(msg, msg.value.trim().length < 10) && ok;
    ok = setInvalid(ds, !ds.checked) && ok;
    if (!ok) { e.preventDefault(); return; }

    // Fallback: solange kein Formular-Dienst eingetragen ist, per E-Mail-Programm senden.
    if (form.dataset.fallback === 'mailto') {
      e.preventDefault();
      var format = form.querySelector('#format').value;
      var body = 'Name: ' + name.value + '\nE-Mail: ' + email.value + '\nFormat: ' + format + '\n\n' + msg.value;
      window.location.href = 'mailto:' + form.dataset.mail +
        '?subject=' + encodeURIComponent('Anfrage Erstgespräch') +
        '&body=' + encodeURIComponent(body);
      form.classList.add('is-sent');
    }
  });
})();
