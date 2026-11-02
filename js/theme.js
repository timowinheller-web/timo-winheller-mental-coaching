// Setzt die Ansicht vor dem ersten Zeichnen: gespeicherte Wahl, sonst dunkel (Standard seit 02.11.2026).
(function () {
  var t; try { t = localStorage.getItem('tw-theme'); } catch (e) {}
  if (t !== 'dark' && t !== 'light') t = 'dark';
  document.documentElement.setAttribute('data-theme', t);
})();
