// Passwort-Tor: entschlüsselt die eigentliche Seite (AES-256-GCM, Schlüssel aus PBKDF2) im Browser.
// Der Schlüssel wird für die Sitzung (oder auf Wunsch dauerhaft) im Browser gemerkt, damit die Navigation
// zwischen den Seiten ohne erneute Eingabe funktioniert. ?logout in der Adresse löscht ihn wieder.
(function () {
  var payloadEl = document.getElementById('payload');
  if (!payloadEl || !window.crypto || !crypto.subtle) return;
  var salt = hex2buf(payloadEl.dataset.salt), data = b642buf(payloadEl.textContent.trim());
  var form = document.getElementById('gate'), input = document.getElementById('pw'), remember = document.getElementById('remember');
  var err = form.querySelector('.gate__error'), btn = form.querySelector('button');
  if (location.search.indexOf('logout') >= 0) { try { sessionStorage.removeItem('tw-key'); localStorage.removeItem('tw-key'); } catch (e) {} history.replaceState(null, '', location.pathname); }
  var stored = null; try { stored = sessionStorage.getItem('tw-key') || localStorage.getItem('tw-key'); } catch (e) {}
  if (stored) { importRaw(stored).then(decrypt).then(show).catch(function () { forget(); reveal(); }); } else reveal();

  form.addEventListener('submit', function (e) {
    e.preventDefault(); err.hidden = true; btn.disabled = true; btn.textContent = 'Öffne …';
    derive(input.value).then(function (key) {
      return decrypt(key).then(function (html) {
        return crypto.subtle.exportKey('raw', key).then(function (raw) {
          try { (remember && remember.checked ? localStorage : sessionStorage).setItem('tw-key', buf2b64(raw)); } catch (x) {}
          show(html);
        });
      });
    }).catch(function () { err.hidden = false; input.value = ''; input.focus(); btn.disabled = false; btn.textContent = 'Öffnen'; });
  });

  function reveal() { document.documentElement.classList.add('gate-ready'); if (input) input.focus(); }
  function forget() { try { sessionStorage.removeItem('tw-key'); localStorage.removeItem('tw-key'); } catch (e) {} }
  function derive(pw) {
    return crypto.subtle.importKey('raw', new TextEncoder().encode(pw.normalize('NFC')), 'PBKDF2', false, ['deriveKey']).then(function (km) {
      return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt, iterations: 200000, hash: 'SHA-256' }, km, { name: 'AES-GCM', length: 256 }, true, ['decrypt']);
    });
  }
  function importRaw(b64) { return crypto.subtle.importKey('raw', b642buf(b64), { name: 'AES-GCM' }, true, ['decrypt']); }
  function decrypt(key) {
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv: data.slice(0, 12) }, key, data.slice(12)).then(function (pt) { return new TextDecoder().decode(pt); });
  }
  function show(html) {
    // Entschlüsselte Seite per DOM-Austausch einsetzen (statt document.write: dort führt Chrome nachgeladene
    // Skripte nicht zuverlässig aus). Vom Parser erzeugte <script>-Elemente laufen nicht, deshalb neu einhängen.
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var root = document.adoptNode(doc.documentElement);
    document.replaceChild(root, document.documentElement);
    Array.prototype.slice.call(document.querySelectorAll('script[src]')).forEach(function (old) {
      var s = document.createElement('script'); s.src = old.getAttribute('src'); s.async = false; old.parentNode.replaceChild(s, old);
    });
    if (location.hash) setTimeout(function () { var el = document.getElementById(location.hash.slice(1)); if (el) el.scrollIntoView(); }, 350);
    window.scrollTo(0, 0);
  }
  function hex2buf(h) { var a = new Uint8Array(h.length / 2); for (var i = 0; i < a.length; i++) a[i] = parseInt(h.substr(i * 2, 2), 16); return a; }
  function b642buf(b) { var s = atob(b), a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; }
  function buf2b64(buf) { var a = new Uint8Array(buf), s = ''; for (var i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s); }
})();
