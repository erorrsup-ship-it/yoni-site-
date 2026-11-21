/*
  Motion effects, ported to plain JavaScript from React Bits (reactbits.dev, MIT + Commons Clause):
  Split Text / Blur Text, Rotating Text, Scroll Reveal, Count Up, Magnet, Flowing Menu,
  Tilted Card with glare, Click Spark. Everything is switched off for prefers-reduced-motion.
*/
(function () {
  'use strict';
  var doc = document, root = doc.documentElement, SITE = window.SITE || {};
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function lang() { return root.getAttribute('data-lang') === 'he' ? 'he' : 'en'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- Split Text + Blur Text: hero headline, letter by letter ---------- */
  $$('[data-split]').forEach(function (h) {
    var he = h.closest('[lang="he"]'), n = 0;
    $$('.ln > span', h).forEach(function (line) {
      var words = line.textContent.split(' ');
      line.innerHTML = words.map(function (w) {
        // Hebrew is split by word so letter shaping stays intact
        var parts = he ? [w] : Array.from(w);
        return '<span class="wd">' + parts.map(function (p) { return '<span class="ch" style="--d:' + (n++) + '">' + esc(p) + '</span>'; }).join('') + '</span>';
      }).join(' ');
      line.setAttribute('aria-hidden', 'true');
    });
  });

  /* ---------- Rotating Text ---------- */
  $$('.rot').forEach(function (el) {
    var words = el.getAttribute('data-words').split('|'), i = 0;
    function build(w) {
      return '<span class="rot-in" aria-hidden="true">' + Array.from(w).map(function (ch, k) {
        return '<span class="rc" style="--k:' + k + '">' + (ch === ' ' ? '&nbsp;' : esc(ch)) + '</span>';
      }).join('') + '</span>';
    }
    el.innerHTML = build(words[0]);
    if (reduced) return;
    setInterval(function () {
      if (doc.hidden) return;
      var old = $('.rot-in', el);
      i = (i + 1) % words.length;
      el.insertAdjacentHTML('beforeend', build(words[i]));
      var nw = el.lastElementChild;
      el.style.width = el.offsetWidth + 'px';
      requestAnimationFrame(function () {
        old.classList.add('is-out');
        nw.classList.add('is-enter');
        el.style.width = (nw.scrollWidth + 28) + 'px';
        setTimeout(function () { old.remove(); nw.classList.remove('is-enter'); el.style.width = ''; }, 700);
      });
    }, 2400);
  });

  /* ---------- Scroll Reveal: About statement, word by word ---------- */
  var reveals = $$('[data-words-reveal]').map(function (p) {
    p.setAttribute('aria-label', p.textContent);
    p.innerHTML = p.textContent.split(/\s+/).map(function (w) { return '<span class="rw" aria-hidden="true">' + esc(w) + '</span>'; }).join(' ');
    return { el: p, words: $$('.rw', p) };
  });
  function paintReveals() {
    var vh = window.innerHeight;
    reveals.forEach(function (r) {
      if (!r.el.offsetParent) return;
      var b = r.el.getBoundingClientRect();
      // 0 when the paragraph enters at 85% of the screen, 1 when its end reaches 45%
      var p = (vh * 0.85 - b.top) / (b.height + vh * 0.4);
      p = Math.max(0, Math.min(1, p));
      var lit = Math.round(p * r.words.length * 1.05);
      r.words.forEach(function (w, k) { w.classList.toggle('on', k < lit); });
    });
  }
  if (reduced) reveals.forEach(function (r) { r.words.forEach(function (w) { w.classList.add('on'); }); });

  /* ---------- Count Up ---------- */
  var countIO = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      countIO.unobserve(e.target);
      var el = e.target, to = Number(el.getAttribute('data-count')), t0 = performance.now(), dur = 1100;
      if (reduced) return;
      (function tick(t) {
        var k = Math.min(1, (t - t0) / dur), v = 1 - Math.pow(1 - k, 3);
        el.textContent = String(Math.round(to * v));
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }, { threshold: 0.6 }) : null;
  $$('[data-count]').forEach(function (el) { if (countIO) countIO.observe(el); });

  /* ---------- Flowing Menu: services ---------- */
  var flow = $('#flow');
  function renderFlow() {
    if (!flow || !SITE.services) return;
    var l = lang();
    flow.innerHTML = SITE.services.map(function (s, k) {
      var t = s[l], band = '';
      for (var r = 0; r < 4; r++) {
        band += '<span>' + esc(t[0]) + '</span>' + s.imgs.map(function (src) { return '<img src="' + esc(src) + '" alt="" loading="lazy">'; }).join('');
      }
      return '<a class="flow-row" href="' + esc(s.href) + '"' + (l === 'he' ? ' dir="rtl" lang="he"' : ' lang="en"') + '>' +
        '<span class="flow-n" aria-hidden="true">0' + (k + 1) + '</span>' +
        '<span class="flow-t">' + esc(t[0]) + '</span><span class="flow-s">' + esc(t[1]) + '</span>' +
        '<span class="flow-band" aria-hidden="true"><span class="flow-track" dir="ltr">' + band + band + '</span></span></a>';
    }).join('');
  }
  function edge(e, row) { var b = row.getBoundingClientRect(); return (e.clientY - b.top) < b.height / 2 ? 'top' : 'bottom'; }
  if (flow) {
    flow.addEventListener('mouseover', function (e) {
      var row = e.target.closest('.flow-row'); if (!row || row.contains(e.relatedTarget) || reduced) return;
      var band = $('.flow-band', row), from = edge(e, row);
      band.style.transition = 'none';
      band.style.transform = 'translateY(' + (from === 'top' ? '-101%' : '101%') + ')';
      band.offsetWidth;
      band.style.transition = '';
      band.style.transform = 'translateY(0)';
      row.classList.add('is-hot');
    });
    flow.addEventListener('mouseout', function (e) {
      var row = e.target.closest('.flow-row'); if (!row || row.contains(e.relatedTarget)) return;
      $('.flow-band', row).style.transform = 'translateY(' + (edge(e, row) === 'top' ? '-101%' : '101%') + ')';
      row.classList.remove('is-hot');
    });
  }

  /* ---------- Magnet: buttons lean toward the cursor ---------- */
  var mag = null;
  if (fine && !reduced) {
    doc.addEventListener('pointermove', function (e) {
      var m = e.target.closest ? e.target.closest('.magnet, .pill, .lang') : null;
      if (mag && mag !== m) { mag.style.transform = ''; mag = null; }
      if (!m) return;
      mag = m;
      var b = m.getBoundingClientRect();
      var x = (e.clientX - (b.left + b.width / 2)) / 3.5, y = (e.clientY - (b.top + b.height / 2)) / 3.5;
      m.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
    }, { passive: true });
  }

  /* ---------- Tilted Card + glare: website cards ---------- */
  if (fine && !reduced) {
    var tilted = null;
    doc.addEventListener('pointermove', function (e) {
      var card = e.target.closest ? e.target.closest('.web-card') : null;
      if (tilted && tilted !== card) { tilted.style.removeProperty('--rx'); tilted.style.removeProperty('--ry'); tilted.classList.remove('is-tilt'); tilted = null; }
      if (!card) return;
      tilted = card;
      var box = $('.web-box', card), b = box.getBoundingClientRect();
      var px = (e.clientX - b.left) / b.width, py = (e.clientY - b.top) / b.height;
      card.classList.add('is-tilt');
      card.style.setProperty('--rx', ((0.5 - py) * 9).toFixed(2) + 'deg');
      card.style.setProperty('--ry', ((px - 0.5) * 11).toFixed(2) + 'deg');
      card.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
      card.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
    }, { passive: true });
  }

  /* ---------- Click Spark ---------- */
  var cv = $('.sparks');
  if (cv && !reduced && cv.getContext) {
    var cx = cv.getContext('2d'), sparks = [], running = false, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var size = function () { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; };
    size(); window.addEventListener('resize', size);
    doc.addEventListener('click', function (e) {
      if (!e.clientX && !e.clientY) return;
      var t = performance.now();
      for (var k = 0; k < 9; k++) sparks.push({ x: e.clientX, y: e.clientY, a: (Math.PI * 2 * k) / 9, t: t });
      if (!running) { running = true; requestAnimationFrame(draw); }
    });
    function draw(now) {
      cx.clearRect(0, 0, cv.width, cv.height);
      sparks = sparks.filter(function (s) {
        var k = (now - s.t) / 480; if (k >= 1) return false;
        var ease = k * (2 - k), d = ease * 34 * dpr, len = 12 * (1 - ease) * dpr;
        var x = s.x * dpr + Math.cos(s.a) * d, y = s.y * dpr + Math.sin(s.a) * d;
        cx.strokeStyle = '#D7FF3E'; cx.lineWidth = 2.4 * dpr; cx.lineCap = 'round';
        cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x + Math.cos(s.a) * len, y + Math.sin(s.a) * len); cx.stroke();
        return true;
      });
      if (sparks.length) requestAnimationFrame(draw); else { running = false; cx.clearRect(0, 0, cv.width, cv.height); }
    }
  }

  /* ---------- wiring ---------- */
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { ticking = false; paintReveals(); });
  }, { passive: true });
  window.addEventListener('resize', paintReveals);
  new MutationObserver(function () { renderFlow(); paintReveals(); }).observe(root, { attributes: true, attributeFilter: ['data-lang'] });
  renderFlow();
  paintReveals();
})();
