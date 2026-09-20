// Navigation (mobil), Akkordeon, Footer-Jahr, Kontaktformular
(function () {
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
