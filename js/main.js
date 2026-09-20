// Mobile-Menü, Footer-Jahr, Formular-Validierung
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var year = document.getElementById('jahr');
  if (year) year.textContent = new Date().getFullYear();

  var form = document.getElementById('kontaktformular');
  if (!form) return;

  function setInvalid(field, invalid) {
    field.closest('.field').classList.toggle('invalid', invalid);
  }

  form.addEventListener('submit', function (e) {
    var ok = true;
    var name = form.querySelector('#name');
    var email = form.querySelector('#email');
    var msg = form.querySelector('#nachricht');
    var ds = form.querySelector('#datenschutz');

    setInvalid(name, !name.value.trim()); ok = ok && !!name.value.trim();
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
    setInvalid(email, !emailOk); ok = ok && emailOk;
    setInvalid(msg, msg.value.trim().length < 10); ok = ok && msg.value.trim().length >= 10;
    setInvalid(ds, !ds.checked); ok = ok && ds.checked;

    if (!ok) { e.preventDefault(); return; }

    // Fallback: solange kein Formular-Dienst eingetragen ist, per E-Mail-Programm senden.
    if (form.dataset.fallback === 'mailto') {
      e.preventDefault();
      var thema = form.querySelector('#thema').value;
      var body = 'Name: ' + name.value + '\nE-Mail: ' + email.value + '\nThema: ' + thema + '\n\n' + msg.value;
      window.location.href = 'mailto:' + form.dataset.mail +
        '?subject=' + encodeURIComponent('Anfrage Erstgespräch – ' + thema) +
        '&body=' + encodeURIComponent(body);
      var success = document.querySelector('.form-success');
      if (success) { success.style.display = 'block'; }
    }
  });
})();
