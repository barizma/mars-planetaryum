// Kaydırınca beliren öğeler ve KampMars sayaçları. JS yoksa/azaltılmış harekette içerik zaten görünür kalır.
(function () {
  var azHareket = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ogeler = document.querySelectorAll('.gor');

  function say(b) {
    var son = parseFloat(b.getAttribute('data-son'));
    var on = b.getAttribute('data-on') || '';
    var ek = b.getAttribute('data-son-ek') || '';
    if (azHareket) { b.textContent = on + son + ek; return; }
    var t0 = performance.now(), sure = 1400;
    (function adim(t) {
      var k = Math.min((t - t0) / sure, 1);
      var e = 1 - Math.pow(1 - k, 3);
      b.textContent = on + Math.round(son * e) + ek;
      if (k < 1) requestAnimationFrame(adim);
    })(t0);
  }

  if (!('IntersectionObserver' in window) || azHareket) {
    ogeler.forEach(function (o) { o.classList.add('ok'); });
    document.querySelectorAll('[data-son]').forEach(say);
    return;
  }

  var gozcu = new IntersectionObserver(function (kayitlar) {
    kayitlar.forEach(function (k) {
      if (!k.isIntersecting) return;
      k.target.classList.add('ok');
      k.target.querySelectorAll('[data-son]').forEach(say);
      gozcu.unobserve(k.target);
    });
  }, { threshold: 0.18 });
  ogeler.forEach(function (o) { gozcu.observe(o); });
})();
