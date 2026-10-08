// Setzt die Ansicht (hell/dunkel) vor dem ersten Zeichnen: gespeicherte Wahl, sonst Systemeinstellung.
(function () {
  var t; try { t = localStorage.getItem('tw-theme'); } catch (e) {}
  if (t !== 'dark' && t !== 'light') t = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', t);
})();
