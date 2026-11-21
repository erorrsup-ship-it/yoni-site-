/*
  Motion for the site.
  - anime.js v4 (js/vendor, MIT) drives: the opening edit (tiles cut in, headline, drawn seam, count-up),
    scroll-linked tile drift, the About scroll reveal, springy strip flicks and magnetic buttons.
  - Effects ported from React Bits (reactbits.dev, MIT + Commons Clause): Rotating Text, Flowing Menu,
    Tilted Card with glare, Click Spark.
  Everything is switched off for prefers-reduced-motion. If anime.js fails to load, the CSS fallbacks run.
*/
(function () {
  'use strict';
  var doc = document, root = doc.documentElement, SITE = window.SITE || {};
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function lang() { return root.getAttribute('data-lang') === 'he' ? 'he' : 'en'; }
  var A = window.anime && window.anime.animate ? window.anime : null;
  if (A && !reduced) root.classList.add('anim');
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- Opening edit: tiles cut in, headline builds, seam draws, 8 counts up ---------- */
  var hero = $('.hero'), heroTl = null;
  function seamGeometry() {
    $$('.seam svg').forEach(function (s) {
      var w = s.clientWidth || 2, h = s.clientHeight || 2, ln = $('line', s), vertical = h >= w;
      s.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      if (vertical) { ln.setAttribute('x1', w / 2); ln.setAttribute('x2', w / 2); ln.setAttribute('y1', 0); ln.setAttribute('y2', h); }
      else { ln.setAttribute('y1', h / 2); ln.setAttribute('y2', h / 2); ln.setAttribute('x1', 0); ln.setAttribute('x2', w); }
    });
  }
  seamGeometry();
  window.addEventListener('resize', seamGeometry);

  if (A && !reduced) {
    var tiles = $$('.tile-btn'), caps = $$('.tile-cap');
    A.set(tiles, { clipPath: 'inset(100% 0% 0% 0%)' });
    A.set(caps, { opacity: 0, translateY: 14 });
    // Tiles cut in left to right like shots on a timeline
    A.createTimeline({ defaults: { ease: 'inOutQuart' }, delay: 120 })
      .add(tiles, { clipPath: ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'], duration: 760, delay: A.stagger(70) }, 0)
      .add(caps, { opacity: [0, 1], translateY: [14, 0], duration: 520, ease: 'outCubic', delay: A.stagger(70) }, 380);

    // Headline: split with anime.js, letters for English, words for Hebrew
    var chars = [];
    $$('[data-split]').forEach(function (h) {
      var he = !!h.closest('[lang="he"]');
      $$('.ln > span', h).forEach(function (line, i) {
        var sp = A.splitText(line, he ? { words: true } : { words: true, chars: true });
        var parts = he ? sp.words : sp.chars;
        parts.forEach(function (p) { p.classList.add('ch'); });
        chars = chars.concat(parts);
        line.style.opacity = '1';
      });
    });
    A.set(chars, { opacity: 0, translateY: '0.55em', filter: 'blur(12px)' });
    var eightBox = $('#eight'), cta = $$('.hero .cta-row'), eightWrap = $('.hero .eight');
    A.set(cta.concat([eightWrap]), { opacity: 0 });
    var drawn = [];
    try { drawn = A.svg.createDrawable($$('.seam line')); A.set(drawn, { draw: '0 0' }); } catch (e) { drawn = []; }
    var counter = { v: 0 };
    heroTl = A.createTimeline({ autoplay: false })
      .add(chars, { opacity: [0, 1], translateY: ['0.55em', '0em'], filter: ['blur(12px)', 'blur(0px)'], duration: 800, ease: 'outExpo', delay: A.stagger(22) }, 0)
      .add(drawn, { draw: ['0 0', '0 1'], duration: 900, ease: 'inOutCubic' }, 250)
      .add(eightWrap, { opacity: [0, 1], duration: 300 }, 520)
      .add(eightBox, { scale: [0.4, 1], duration: 900, ease: A.spring({ bounce: 0.45, duration: 900 }) }, 520)
      .add(counter, { v: [0, 8], duration: 850, ease: 'outCubic', modifier: A.round(0), onUpdate: function () { eightBox.textContent = String(counter.v); } }, 560)
      .add(cta, { opacity: [0, 1], translateY: [12, 0], duration: 600, ease: 'outCubic' }, 700);
    if ('IntersectionObserver' in window && hero) {
      var hio = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { hio.disconnect(); heroTl.play(); }
      }, { threshold: 0.25 });
      hio.observe(hero);
    } else heroTl.play();
  } else {
    $$('.hero .h1 .ln > span').forEach(function (l) { l.style.opacity = '1'; });
  }

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

  /* ---------- Scroll Reveal: About statement, word by word, scrubbed by scroll ---------- */
  var reveals = $$('[data-words-reveal]').map(function (p) {
    if (A) {
      var words = A.splitText(p, { words: true }).words;
      words.forEach(function (w) { w.classList.add('rw'); });
      if (reduced) return { el: p, words: words, tl: null };
      // A paused anime.js animation that the scroll position seeks through
      var tl = A.animate(words, { opacity: [0.14, 1], filter: ['blur(3px)', 'blur(0px)'], duration: 400, delay: A.stagger(60), ease: 'linear', autoplay: false });
      return { el: p, words: words, tl: tl };
    }
    p.setAttribute('aria-label', p.textContent);
    p.innerHTML = p.textContent.split(/\s+/).map(function (w) { return '<span class="rw" aria-hidden="true">' + esc(w) + '</span>'; }).join(' ');
    return { el: p, words: $$('.rw', p), tl: null };
  });
  function paintReveals() {
    var vh = window.innerHeight;
    reveals.forEach(function (r) {
      if (!r.el.offsetParent) return;
      var b = r.el.getBoundingClientRect();
      // 0 when the paragraph enters at 85% of the screen, 1 when its end reaches 45%
      var p = Math.max(0, Math.min(1, (vh * 0.85 - b.top) / (b.height + vh * 0.4)));
      if (r.tl) { r.tl.seek(p * r.tl.duration); return; }
      var lit = Math.round(p * r.words.length * 1.05);
      r.words.forEach(function (w, k) { w.classList.toggle('on', k < lit); });
    });
  }
  if (reduced) reveals.forEach(function (r) { r.words.forEach(function (w) { w.classList.add('on'); w.style.opacity = '1'; w.style.filter = 'none'; }); });

  /* ---------- Count Up (anime.js) ---------- */
  var countIO = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      countIO.unobserve(e.target);
      var el = e.target, to = Number(el.getAttribute('data-count'));
      if (reduced || !A) return;
      var o = { v: 0 };
      A.animate(o, { v: [0, to], duration: 1100, ease: 'outCubic', modifier: A.round(0), onUpdate: function () { el.textContent = String(o.v); } });
    });
  }, { threshold: 0.6 }) : null;
  $$('[data-count]').forEach(function (el) { if (countIO) countIO.observe(el); });

  /* ---------- Tiles drift as you scroll past (anime.js onScroll) ---------- */
  if (A && !reduced) {
    try {
      A.animate('.tile-btn img, .tile-btn video', {
        translateY: ['-6%', '6%'], ease: 'linear', duration: 1000,
        autoplay: A.onScroll({ target: '#work', sync: true })
      });
    } catch (e) {}
  }

  /* ---------- Strip flick: drag, let go, and it glides then settles on a spring ---------- */
  var strip = $('#strip');
  if (A && strip && !reduced) {
    var trail = [], down = false, glide = null;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; trail = [{ x: e.clientX, t: performance.now() }];
      if (glide) { glide.pause(); glide = null; strip.style.scrollSnapType = ''; }
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      trail.push({ x: e.clientX, t: performance.now() }); if (trail.length > 6) trail.shift();
    }, { passive: true });
    window.addEventListener('pointerup', function () {
      if (!down) return; down = false;
      if (trail.length < 2) return;
      var a0 = trail[0], a1 = trail[trail.length - 1], dt = Math.max(16, a1.t - a0.t);
      var v = (a1.x - a0.x) / dt; // px per ms
      if (Math.abs(v) < 0.25 || performance.now() - a1.t > 90) return;
      var max = strip.scrollWidth - strip.clientWidth, from = strip.scrollLeft;
      var dir = getComputedStyle(strip).direction === 'rtl' ? -1 : 1;
      var to = from - v * 380;
      to = dir === 1 ? Math.max(0, Math.min(max, to)) : Math.max(-max, Math.min(0, to));
      var o = { x: from };
      strip.style.scrollSnapType = 'none';
      glide = A.animate(o, { x: to, ease: A.spring({ bounce: 0.18, duration: 1100 }), onUpdate: function () { strip.scrollLeft = o.x; },
        onComplete: function () { strip.style.scrollSnapType = ''; glide = null; } });
    });
  }

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

  /* ---------- Magnet: buttons lean toward the cursor (anime.js animatable) ---------- */
  if (fine && !reduced && A && A.createAnimatable) {
    var magCur = null;
    var magOf = function (el) { return el._mag || (el._mag = A.createAnimatable(el, { x: 450, y: 450, ease: 'out(3)' })); };
    doc.addEventListener('pointermove', function (e) {
      var m = e.target.closest ? e.target.closest('.magnet, .pill, .lang') : null;
      if (magCur && magCur !== m) { magOf(magCur).x(0); magOf(magCur).y(0); magCur = null; }
      if (!m) return;
      magCur = m;
      var b = m.getBoundingClientRect();
      magOf(m).x((e.clientX - (b.left + b.width / 2)) / 3.2);
      magOf(m).y((e.clientY - (b.top + b.height / 2)) / 3.2);
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
