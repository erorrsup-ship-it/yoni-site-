(function () {
  'use strict';
  var SITE = window.SITE;
  var doc = document, root = doc.documentElement;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'cubic-bezier(.2,.8,.2,1)';

  var T = {
    en: { play: 'Play', open: 'Open', all: 'All work', allVideos: 'All videos in this project', next: 'Next project', website: 'Website', watch: 'Watch', pause: 'Pause', mute: 'Mute', unmute: 'Unmute', full: 'Full screen', seek: 'Seek', close: 'Close project' },
    he: { play: 'נגן', open: 'פתח', all: 'כל העבודות', allVideos: 'כל הסרטונים בפרויקט', next: 'הפרויקט הבא', website: 'אתר', watch: 'לצפייה', pause: 'השהה', mute: 'השתק', unmute: 'בטל השתקה', full: 'מסך מלא', seek: 'דילוג', close: 'סגור פרויקט' }
  };
  var ICON = {
    play: '<svg aria-hidden="true" width="16" height="18" viewBox="0 0 20 22"><path d="M3 1 19 11 3 21Z" fill="currentColor"/></svg>',
    pause: '<svg aria-hidden="true" width="14" height="16" viewBox="0 0 14 16"><path d="M1 0h4v16H1zM9 0h4v16H9z" fill="currentColor"/></svg>',
    vol: '<svg aria-hidden="true" width="18" height="16" viewBox="0 0 18 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1 5.5h3l4-4v13l-4-4H1zM11.5 5a4 4 0 0 1 0 6M13.8 2.5a7.5 7.5 0 0 1 0 11"/></svg>',
    muted: '<svg aria-hidden="true" width="18" height="16" viewBox="0 0 18 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1 5.5h3l4-4v13l-4-4H1zM11.5 5.5l5 5M16.5 5.5l-5 5"/></svg>',
    full: '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1 6V1h5M10 1h5v5M15 10v5h-5M6 15H1v-5"/></svg>',
    back: '<svg aria-hidden="true" width="16" height="14" viewBox="0 0 16 14" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 1 1 7l6 6M1 7h15"/></svg>'
  };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function segs(list) {
    return (list || []).map(function (s) { return '<span class="' + s[1] + (s[2] ? ' brk' : '') + '">' + esc(s[0]) + '</span>'; }).join('');
  }
  function plain(list) { return (list || []).map(function (s) { return s[0]; }).join(' ').replace(/\s+/g, ' ').trim(); }

  /* ---------- data lookups ---------- */
  var itemIndex = {};
  SITE.projects.forEach(function (p) { p.items.forEach(function (it) { itemIndex[it.id] = { project: p, item: it }; }); });
  function projectById(id) { for (var i = 0; i < SITE.projects.length; i++) if (SITE.projects[i].id === id) return SITE.projects[i]; return null; }

  /* ---------- language ---------- */
  var lang = 'en';
  try { lang = localStorage.getItem('yk-lang') || ((navigator.language || '').toLowerCase().indexOf('he') === 0 ? 'he' : 'en'); } catch (e) {}
  if (lang !== 'he') lang = 'en';

  function applyLang() {
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang);
    if (strip) { strip.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr'); strip.scrollLeft = 0; navState(); }
    $$('[data-set-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-set-lang') === lang)); });
    renderCaptions();
    renderMore();
    if (pvOpen) refreshProjectLang();
    var cur = $('.cursor span'); if (cur) cur.textContent = T[lang].play;
  }
  function setLang(next) {
    if (next === lang) return;
    var go = function () { lang = next; try { localStorage.setItem('yk-lang', lang); } catch (e) {} applyLang(); };
    var w = $('.wipe');
    if (reduced || !w || !w.animate) return go();
    var mid = 'cubic-bezier(.7,0,.3,1)';
    var a = w.animate([{ clipPath: 'inset(0 50% 0 50%)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 300, easing: mid, fill: 'forwards' });
    a.onfinish = function () {
      go();
      var b = w.animate([{ clipPath: 'inset(0 0 0 0)' }, { clipPath: next === 'he' ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' }], { duration: 380, easing: mid, fill: 'forwards' });
      b.onfinish = function () { a.cancel(); b.cancel(); };
    };
  }
  doc.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-set-lang]');
    if (b) setLang(b.getAttribute('data-set-lang'));
  });

  /* ---------- strip ---------- */
  var strip = $('#strip');
  function buildStrip() {
    strip.innerHTML = SITE.strip.map(function (id, i) {
      var r = itemIndex[id]; if (!r) return '';
      return '<article class="tile v" data-theme="' + r.project.theme + '" style="--i:' + i + '">' +
        '<button type="button" class="tile-btn" data-open="' + r.project.id + '" data-item="' + id + '" data-cursor="play">' +
        '<img src="media/' + id + '.jpg" alt="" width="540" height="960"' + (i < 6 ? ' fetchpriority="high"' : ' loading="lazy"') + '>' +
        '<video muted loop playsinline preload="none" data-src="media/' + id + '-loop.mp4" tabindex="-1" aria-hidden="true"></video>' +
        '</button><div class="tile-cap"></div></article>';
    }).join('');
  }
  function renderCaptions() {
    $$('.tile', strip).forEach(function (tile) {
      var btn = $('.tile-btn', tile), r = itemIndex[btn.getAttribute('data-item')];
      $('.tile-cap', tile).innerHTML = '<p class="tile-meta">' + esc(r.item.meta[lang]) + ' · ' + r.item.dur + '</p><p class="tile-label">' + segs(r.item.label[lang]) + '</p>';
      btn.setAttribute('aria-label', T[lang].open + ': ' + plain(r.item.label[lang]) + ', ' + r.item.meta[lang]);
    });
  }

  /* preview loops: play only while the mouse (or keyboard focus) is on a video */
  var loopsHeld = false, LOOP_BTN = '.tile-btn, .promo-btn';
  function loopOf(btn) { return btn ? $('video[data-src]', btn) : null; }
  function playLoop(btn) {
    var v = loopOf(btn); if (!v || reduced || loopsHeld) return;
    if (!v.getAttribute('src')) v.setAttribute('src', v.getAttribute('data-src'));
    var pr = v.play();
    if (pr && pr.then) pr.then(function () { v.classList.add('is-on'); }).catch(function () {});
  }
  function stopLoop(btn) {
    var v = loopOf(btn); if (!v) return;
    v.pause(); v.classList.remove('is-on');
    try { if (v.readyState) v.currentTime = 0; } catch (e) {}
  }
  function loopBtn(e) { return e.target && e.target.closest ? e.target.closest(LOOP_BTN) : null; }
  doc.addEventListener('mouseover', function (e) { var b = loopBtn(e); if (b && !b.contains(e.relatedTarget)) playLoop(b); });
  doc.addEventListener('mouseout', function (e) { var b = loopBtn(e); if (b && !b.contains(e.relatedTarget)) stopLoop(b); });
  doc.addEventListener('focusin', function (e) { var b = loopBtn(e); if (b && b.matches(':focus-visible')) playLoop(b); });
  doc.addEventListener('focusout', function (e) { var b = loopBtn(e); if (b) stopLoop(b); });
  function watchLoops() {}
  function holdLoops(hold) { loopsHeld = hold; if (hold) $$(LOOP_BTN).forEach(stopLoop); }
  /* fetch the small preview files once the page is idle, so a hover starts instantly */
  function warmLoops() {
    if (reduced || !window.matchMedia('(hover: hover)').matches) return;
    $$('video[data-src]').forEach(function (v) { if (!v.getAttribute('src')) { v.preload = 'auto'; v.setAttribute('src', v.getAttribute('data-src')); } });
  }
  window.addEventListener('load', function () { setTimeout(warmLoops, 1500); });

  /* arrows + drag to scroll */
  var prev = $('.strip-nav.prev'), next = $('.strip-nav.next');
  function navState() {
    var max = strip.scrollWidth - strip.clientWidth - 2, pos = Math.abs(strip.scrollLeft);
    prev.disabled = pos <= 2; next.disabled = pos >= max;
  }
  function step(dir) { var w = $('.tile', strip).offsetWidth; if (lang === 'he') dir = -dir; strip.scrollBy({ left: dir * w * 2, behavior: reduced ? 'auto' : 'smooth' }); }
  prev.addEventListener('click', function () { step(-1); });
  next.addEventListener('click', function () { step(1); });
  strip.addEventListener('scroll', navState, { passive: true });
  window.addEventListener('resize', navState);

  var drag = null, dragged = false;
  strip.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    drag = { x: e.clientX, left: strip.scrollLeft }; dragged = false;
  });
  window.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.x;
    if (!dragged && Math.abs(dx) > 6) { dragged = true; strip.classList.add('is-drag'); }
    if (dragged) strip.scrollLeft = drag.left - dx;
  });
  window.addEventListener('pointerup', function () {
    if (!drag) return; drag = null;
    if (dragged) setTimeout(function () { strip.classList.remove('is-drag'); dragged = false; }, 0);
  });

  /* ---------- more work ---------- */
  function renderMore() {
    var grid = $('#more-grid'); if (!grid) return;
    var p = projectById('promo'), he = lang === 'he', dir = he ? ' dir="rtl" lang="he"' : ' lang="en"';
    var html = '';
    if (p) {
      html += '<article class="promo-card v rv" data-theme="' + p.theme + '">' +
        '<div class="promo-frame"><button type="button" class="promo-btn" data-open="promo" data-item="promo" data-cursor="play" aria-label="' + esc(T[lang].open + ': ' + plain(p.title[lang])) + '">' +
        '<img src="media/promo.jpg" alt="" width="960" height="540" loading="lazy">' +
        '<video muted loop playsinline preload="none" data-src="media/promo-loop.mp4" tabindex="-1" aria-hidden="true"></video></button></div>' +
        '<div class="promo-text"' + dir + '><h3>' + segs(p.title[lang]) + '</h3><p>' + esc(p.blurb[lang]) + '</p>' +
        '<button type="button" class="pill" data-open="promo" data-item="promo">' + T[lang].watch + (he ? ' &larr;' : ' &rarr;') + '</button></div></article>';
    }
    html += SITE.web.map(function (w) {
      return '<a class="web-card rv" href="' + esc(w.url) + '" target="_blank" rel="noopener" data-wtheme="' + esc(w.theme || '') + '"' + dir + '>' +
        '<div class="web-top"><span>' + T[lang].website + '</span><span>' + esc(w.status[lang]) + ' &#8599;</span></div>' +
        '<div class="web-box">' + (w.shot ? '<div class="web-shot"><img src="' + esc(w.shot) + '" alt="" width="800" height="500" loading="lazy"></div>' : '') +
        '<div class="web-body"><div class="web-name">' + esc(w.name[lang]) + '</div><p class="web-text">' + esc(w.text[lang]) + '</p>' +
        '<span class="web-cta">' + esc(w.cta[lang]) + '</span></div></div></a>';
    }).join('');
    grid.innerHTML = html;
    watchLoops(grid);
  }

  /* ---------- reveals ---------- */
  var revealIO = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in'); revealIO.unobserve(en.target);
      if (en.target.classList.contains('hero')) countEight();
    });
  }, { threshold: 0.12 }) : null;
  function countEight() {
    var b = $('#eight'); if (!b || reduced) return;
    var n = 0; b.textContent = '0';
    var t = setInterval(function () { n++; b.textContent = String(n); if (n >= 8) clearInterval(t); }, 85);
  }

  /* ---------- marquee ---------- */
  function marquee() {
    var track = $('#marquee'); if (!track) return;
    track.innerHTML += track.innerHTML;
    if (reduced) return;
    var x = 0, half = 0, lastY = window.scrollY, vel = 0;
    function measure() { half = track.scrollWidth / 2; }
    measure(); window.addEventListener('resize', measure);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(measure);
    (function tick() {
      var y = window.scrollY; vel += ((y - lastY) - vel) * 0.1; lastY = y;
      x -= 1.1 + Math.min(Math.abs(vel) * 0.35, 14);
      if (half && x <= -half) x += half;
      track.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
      requestAnimationFrame(tick);
    })();
  }

  /* ---------- cursor ---------- */
  var hideCursor = function () {};
  function cursor() {
    var c = $('.cursor');
    if (!c || reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var tx = -200, ty = -200, x = tx, y = ty, s = 0, ts = 0;
    window.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      ts = e.target.closest && e.target.closest('[data-cursor]') && !strip.classList.contains('is-drag') ? 1 : 0;
    }, { passive: true });
    doc.addEventListener('mouseleave', function () { ts = 0; });
    hideCursor = function () { ts = 0; };
    (function tick() {
      x += (tx - x) * 0.22; y += (ty - y) * 0.22; s += (ts - s) * 0.2;
      c.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + s.toFixed(3) + ')';
      c.style.opacity = s > 0.02 ? '1' : '0';
      requestAnimationFrame(tick);
    })();
  }

  /* ---------- project view ---------- */
  var pv = $('#project'), pvOpen = null, lastFocus = null, player = null, closing = 0;

  function nearHTML(p, l) {
    var he = l === 'he';
    return '<div class="pv-near ' + l + '" lang="' + l + '"' + (he ? ' dir="rtl"' : '') + '>' +
      '<div class="pv-near-top">' +
      '<' + (l === 'en' ? 'h2' : 'p') + ' class="vtitle' + (p.titleSize && p.titleSize[l] ? ' ' + p.titleSize[l] : '') + '"' + (l === 'en' ? ' id="pv-title"' : '') + '>' + segs(p.title[l]) + '</' + (l === 'en' ? 'h2' : 'p') + '>' +
      (p.tag ? '<p class="vtag">' + segs(p.tag[l]) + '</p>' : '') +
      '<p class="vblurb">' + esc(p.blurb[l]) + '</p></div>' +
      '<dl class="specs">' + p.specs[l].map(function (s) { return '<div><dt>' + esc(s[0]) + '</dt><dd>' + esc(s[1]) + '</dd></div>'; }).join('') + '</dl></div>';
  }
  function projectHTML(p) {
    var vids = SITE.projects, nx = vids[(vids.indexOf(p) + 1) % vids.length];
    return '<div class="pv-bar"><button type="button" class="pv-close">' + ICON.back + '<span data-t="all"></span></button>' +
      '<div class="lang" role="group" aria-label="Language / שפה"><button type="button" data-set-lang="en">EN</button><button type="button" data-set-lang="he" lang="he">עב</button></div></div>' +
      '<section class="pv-stage v" data-theme="' + p.theme + '" data-ratio="' + p.ratio + '">' + nearHTML(p, 'en') +
      '<div class="pv-player"><div class="pv-now"><span class="tile-label" id="pv-now"></span><span class="thin" id="pv-now-meta"></span></div>' +
      '<div class="player"><video playsinline preload="metadata"></video><button type="button" class="player-big">' + ICON.play.replace('width="16" height="18"', 'width="26" height="30"') + '</button></div>' +
      '<div class="player-bar"><button type="button" class="pbtn main">' + ICON.play + '</button><span class="ptime" aria-live="off">0:00 / 0:00</span>' +
      '<input class="pseek" type="range" min="0" max="1000" value="0" step="1">' +
      '<button type="button" class="pbtn mute">' + ICON.vol + '</button><button type="button" class="pbtn fs">' + ICON.full + '</button></div></div>' +
      nearHTML(p, 'he') + '</section>' +
      (p.items.length > 1 ? '<section class="pv-film v" data-theme="' + p.theme + '"><div class="pv-film-in"><div class="mirror-line"><span data-t="allVideos"></span></div><div class="film">' +
        p.items.map(function (it) { return '<button type="button" class="film-btn" data-film="' + it.id + '"><img src="media/' + it.id + '.jpg" alt="" loading="lazy" width="540" height="960"><span></span></button>'; }).join('') +
        '</div></div></section>' : '') +
      '<a class="pv-next" href="#' + nx.id + '"><span lang="en"><small>Next project</small><b>' + esc(nx.name.en) + ' &rarr;</b></span>' +
      '<span lang="he" dir="rtl"><small>הפרויקט הבא</small><b>' + esc(nx.name.he) + ' &larr;</b></span></a>';
  }
  function refreshProjectLang() {
    if (!pvOpen) return;
    var p = pvOpen.project, it = pvOpen.item;
    $$('[data-t]', pv).forEach(function (n) { n.textContent = T[lang][n.getAttribute('data-t')]; });
    $$('[data-set-lang]', pv).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-set-lang') === lang)); });
    $('.pv-close', pv).setAttribute('aria-label', T[lang].close);
    $('#pv-now', pv).innerHTML = segs(it.label[lang]);
    $('#pv-now-meta', pv).textContent = it.meta[lang] + ' · ' + it.dur;
    $$('.film-btn', pv).forEach(function (b) {
      var item = itemIndex[b.getAttribute('data-film')].item;
      b.setAttribute('aria-pressed', String(item === it));
      b.setAttribute('aria-label', T[lang].play + ': ' + plain(item.label[lang]) + ', ' + item.dur);
      $('span', b).innerHTML = segs(item.label[lang]);
    });
    pv.setAttribute('aria-label', plain(p.title[lang]));
    if (player) player.labels();
  }

  function makePlayer(scope) {
    var box = $('.player', scope), v = $('video', box), big = $('.player-big', box), main = $('.pbtn.main', scope),
      seek = $('.pseek', scope), time = $('.ptime', scope), mute = $('.pbtn.mute', scope), fs = $('.pbtn.fs', scope), seeking = false;
    function fmt(s) { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
    function toggle() { if (v.paused) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); } else v.pause(); }
    function paint() {
      var d = v.duration || 0, val = d ? v.currentTime / d * 1000 : 0;
      if (!seeking) seek.value = String(val);
      seek.style.setProperty('--p', (Number(seek.value) / 10) + '%');
      time.textContent = fmt(v.currentTime) + ' / ' + fmt(d);
      seek.setAttribute('aria-valuetext', fmt(v.currentTime) + ' / ' + fmt(d));
    }
    function labels() {
      var t = T[lang];
      main.setAttribute('aria-label', v.paused ? t.play : t.pause); big.setAttribute('aria-label', t.play);
      mute.setAttribute('aria-label', v.muted ? t.unmute : t.mute); fs.setAttribute('aria-label', t.full); seek.setAttribute('aria-label', t.seek);
    }
    v.addEventListener('play', function () { box.classList.add('is-playing'); main.innerHTML = ICON.pause; labels(); });
    v.addEventListener('pause', function () { box.classList.remove('is-playing'); main.innerHTML = ICON.play; labels(); });
    v.addEventListener('timeupdate', paint); v.addEventListener('loadedmetadata', paint); v.addEventListener('durationchange', paint);
    seek.addEventListener('input', function () { seeking = true; if (v.duration) v.currentTime = Number(seek.value) / 1000 * v.duration; paint(); });
    seek.addEventListener('change', function () { seeking = false; });
    v.addEventListener('click', toggle); big.addEventListener('click', toggle); main.addEventListener('click', toggle);
    mute.addEventListener('click', function () { v.muted = !v.muted; mute.innerHTML = v.muted ? ICON.muted : ICON.vol; labels(); });
    fs.addEventListener('click', function () {
      try {
        if (doc.fullscreenElement) { doc.exitFullscreen(); return; }
        var req = v.requestFullscreen || v.webkitRequestFullscreen || v.webkitEnterFullscreen;
        if (req) { var pr = req.call(v); if (pr && pr.catch) pr.catch(function () {}); }
      } catch (e) {}
    });
    function onFs() { v.controls = doc.fullscreenElement === v; }
    doc.addEventListener('fullscreenchange', onFs);
    return {
      box: box, video: v, labels: labels, toggle: toggle,
      load: function (item) { v.pause(); v.poster = 'media/' + item.id + '.jpg'; v.src = 'media/' + item.id + '.mp4'; v.load(); paint(); labels(); },
      play: function () { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); },
      destroy: function () { doc.removeEventListener('fullscreenchange', onFs); v.pause(); v.removeAttribute('src'); v.load(); }
    };
  }

  function openProject(p, item, from) {
    if (!p) return;
    clearTimeout(closing);
    if (player) player.destroy();
    if (!pvOpen) lastFocus = doc.activeElement;
    item = item || p.items[0];
    pvOpen = { project: p, item: item };
    pv.innerHTML = projectHTML(p);
    pv.hidden = false; pv.scrollTop = 0;
    doc.body.style.overflow = 'hidden';
    holdLoops(true); hideCursor();
    player = makePlayer(pv);
    player.load(item);
    refreshProjectLang();
    if (location.hash !== '#' + p.id) { try { history.pushState(null, '', '#' + p.id); } catch (e) { location.hash = p.id; } }

    var src = from && from.getBoundingClientRect ? from.getBoundingClientRect() : null;
    requestAnimationFrame(function () {
      pv.classList.add('is-open');
      var close = $('.pv-close', pv); if (close) close.focus({ preventScroll: true });
      if (!src || reduced || !from.animate || !src.width) { player.play(); return; }
      var t = player.box.getBoundingClientRect();
      var c = new Image(); c.src = 'media/' + item.id + '.jpg'; c.className = 'flip-clone'; c.alt = '';
      c.style.cssText = 'left:' + src.left + 'px;top:' + src.top + 'px;width:' + src.width + 'px;height:' + src.height + 'px';
      doc.body.appendChild(c);
      player.box.style.visibility = 'hidden';
      var a = c.animate([{ transform: 'none' }, { transform: 'translate(' + (t.left - src.left) + 'px,' + (t.top - src.top) + 'px) scale(' + (t.width / src.width) + ',' + (t.height / src.height) + ')' }], { duration: 720, easing: EASE, fill: 'forwards' });
      a.onfinish = function () { player.box.style.visibility = ''; c.remove(); if (pvOpen) player.play(); };
    });
  }
  function closeProject(keepHash) {
    if (!pvOpen) return;
    pvOpen = null;
    pv.classList.remove('is-open');
    if (player) { player.destroy(); player = null; }
    doc.body.style.overflow = '';
    holdLoops(false); hideCursor();
    if (!keepHash && location.hash) { try { history.pushState(null, '', location.pathname + location.search); } catch (e) { location.hash = ''; } }
    closing = setTimeout(function () { pv.hidden = true; pv.innerHTML = ''; }, reduced ? 0 : 360);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  function selectItem(id) {
    var r = itemIndex[id]; if (!r || !pvOpen || !player) return;
    pvOpen.item = r.item; player.load(r.item); refreshProjectLang(); player.play();
    var st = $('.pv-stage', pv); if (st) pv.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  }

  doc.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target : null; if (!t) return;
    var open = t.closest('[data-open]');
    if (open) {
      if (dragged) return;
      var p = projectById(open.getAttribute('data-open')), r = itemIndex[open.getAttribute('data-item')];
      openProject(p, r ? r.item : null, $('img', open) || null);
      return;
    }
    if (t.closest('.pv-close')) { closeProject(); return; }
    var film = t.closest('[data-film]'); if (film) { selectItem(film.getAttribute('data-film')); return; }
  });
  pv.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { e.preventDefault(); closeProject(); return; }
    if ((e.key === ' ' || e.key === 'k') && player && !e.target.closest('button, a, input')) { e.preventDefault(); player.toggle(); return; }
    if (e.key === 'Tab') {
      var f = $$('button, a[href], input', pv).filter(function (n) { return n.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  function route() {
    var id = (location.hash || '').slice(1), p = projectById(id);
    if (p) { if (!pvOpen || pvOpen.project !== p) openProject(p, null, null); }
    else if (pvOpen) closeProject(true);
  }
  window.addEventListener('hashchange', route);
  window.addEventListener('popstate', route);

  /* ---------- start ---------- */
  buildStrip();
  applyLang();
  watchLoops(strip);
  navState();
  $$('.hero, .more-grid').forEach(function (n) { if (revealIO) revealIO.observe(n); else n.classList.add('is-in'); });
  marquee();
  cursor();
  requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add('is-ready'); }); });
  route();
})();
