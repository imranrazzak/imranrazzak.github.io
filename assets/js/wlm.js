/* WLMs pages: illustrative signal visualisations for ECGWM, CGMWM and SleepWM.
   Every signal here is synthesised in the browser from simple textbook-style generators.
   Nothing on these pages is patient data, a recording, or the output of a model. */
(function () {
  'use strict';
  var root = document.querySelector('.wlm[data-wlm]');
  if (!root) return;
  var kind = root.getAttribute('data-wlm');
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var NS = 'http://www.w3.org/2000/svg';
  var TAU = Math.PI * 2;

  function $(sel) { return root.querySelector(sel); }
  function S(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function H(tag, cls, text, parent) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function setText(sel, text) { var e = $(sel); if (e) e.textContent = text; }
  function css(name) { return getComputedStyle(root).getPropertyValue(name).trim(); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function clock(minutes) { var m = ((Math.round(minutes) % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + ':' + pad(m % 60); }
  function hm(minutes) { var m = Math.round(minutes); return Math.floor(m / 60) + ' h ' + pad(m % 60) + ' min'; }
  function mean(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s / a.length; }
  function sd(a) { var m = mean(a), s = 0; for (var i = 0; i < a.length; i++) s += (a[i] - m) * (a[i] - m); return Math.sqrt(s / (a.length - 1)); }
  function quantile(sorted, q) { var p = (sorted.length - 1) * q, lo = Math.floor(p), hi = Math.ceil(p); return sorted[lo] + (sorted[hi] - sorted[lo]) * (p - lo); }

  /* Seeded generator so the first view is the same for every visitor. */
  function rng(seed) {
    var a = seed >>> 0;
    function u() { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
    function g() { var x = 0; for (var i = 0; i < 6; i++) x += u(); return (x - 3) / 0.7071; }
    return { u: u, g: g };
  }

  /* A cartesian frame: gridlines, tick labels, a baseline and a unit caption. */
  function frame(host, o) {
    host.textContent = '';
    var w = Math.max(260, Math.floor(host.clientWidth)), h = o.h, m = o.m;
    var svg = S('svg', { width: w, height: h, viewBox: '0 0 ' + w + ' ' + h, role: 'img', 'aria-label': o.label || '' }, host);
    var iw = w - m.l - m.r, ih = h - m.t - m.b;
    function X(v) { return m.l + (v - o.x[0]) / (o.x[1] - o.x[0]) * iw; }
    function Y(v) { return m.t + ih - (v - o.y[0]) / (o.y[1] - o.y[0]) * ih; }
    var g = S('g', {}, svg);
    var yt = typeof o.yt === 'function' ? o.yt(w) : o.yt, xt = typeof o.xt === 'function' ? o.xt(w) : o.xt;
    yt.forEach(function (v) {
      S('line', { x1: m.l, x2: w - m.r, y1: Y(v), y2: Y(v), 'class': 'wlm-grid' }, g);
      S('text', { x: m.l - 8, y: Y(v) + 4, 'text-anchor': 'end' }, g).textContent = o.yf ? o.yf(v) : v;
    });
    xt.forEach(function (v) { S('text', { x: X(v), y: h - m.b + 17, 'text-anchor': 'middle' }, g).textContent = o.xf ? o.xf(v) : v; });
    S('line', { x1: m.l, x2: w - m.r, y1: m.t + ih, y2: m.t + ih, 'class': 'wlm-base' }, g);
    if (o.yTitle) S('text', { x: m.l, y: m.t - 9, 'class': 'wlm-ytitle' }, g).textContent = o.yTitle;
    if (o.xTitle) S('text', { x: w - m.r, y: h - 3, 'text-anchor': 'end' }, g).textContent = o.xTitle;
    return { svg: svg, w: w, h: h, m: m, iw: iw, ih: ih, X: X, Y: Y };
  }
  function linePath(n, px, py) { var d = ''; for (var i = 0; i < n; i++) d += (i ? 'L' : 'M') + px(i).toFixed(1) + ' ' + py(i).toFixed(1); return d; }
  function drawIn(path, animate) {
    if (!animate || reduceMotion || !path.getTotalLength) return;
    var len = path.getTotalLength();
    path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
    path.getBoundingClientRect();
    path.classList.add('wlm-draw'); path.style.strokeDashoffset = 0;
    setTimeout(function () { path.style.strokeDasharray = ''; path.classList.remove('wlm-draw'); }, 2000);
  }
  function fadeIn(node, animate) {
    if (!animate || reduceMotion) return;
    node.style.opacity = 0; node.getBoundingClientRect(); node.classList.add('wlm-fade'); node.style.opacity = 1;
  }

  /* Crosshair + tooltip. Pointer and keyboard (arrow keys) reach the same readout. */
  function hover(fr, host, n, pxOf, info) {
    var cross = S('line', { 'class': 'wlm-cross', y1: fr.m.t, y2: fr.m.t + fr.ih, visibility: 'hidden' }, fr.svg);
    var dots = S('g', {}, fr.svg);
    var tip = H('div', 'wlm-tip', null, host); tip.hidden = true;
    var hit = S('rect', { 'class': 'wlm-hit', x: fr.m.l, y: fr.m.t, width: fr.iw, height: fr.ih }, fr.svg);
    var cur = -1;
    function show(i) {
      i = Math.max(0, Math.min(n - 1, i)); cur = i;
      var px = pxOf(i), d = info(i);
      cross.setAttribute('x1', px); cross.setAttribute('x2', px); cross.setAttribute('visibility', 'visible');
      dots.textContent = '';
      (d.dots || []).forEach(function (p) { S('circle', { cx: px, cy: p.y, r: 5, fill: p.c, 'class': 'wlm-dot' }, dots); });
      tip.textContent = '';
      H('div', 'wlm-tip-title', d.title, tip);
      d.rows.forEach(function (r) {
        var row = H('div', 'wlm-tip-row', null, tip);
        if (r.c) H('span', 'wlm-tip-key', null, row).style.background = r.c;
        H('b', null, r.value, row);
        if (r.label) H('span', null, r.label, row);
      });
      tip.hidden = false;
      var tw = tip.offsetWidth, left = px + 14;
      if (left + tw > fr.w - 4) left = px - 14 - tw;
      tip.style.left = Math.max(0, left) + 'px'; tip.style.top = (fr.m.t + 4) + 'px';
    }
    function hide() { cur = -1; cross.setAttribute('visibility', 'hidden'); dots.textContent = ''; tip.hidden = true; }
    function nearest(clientX) {
      var px = clientX - fr.svg.getBoundingClientRect().left;
      return Math.round((px - pxOf(0)) / (pxOf(n - 1) - pxOf(0)) * (n - 1));
    }
    hit.addEventListener('pointermove', function (e) { show(nearest(e.clientX)); });
    hit.addEventListener('pointerdown', function (e) { show(nearest(e.clientX)); });
    hit.addEventListener('pointerleave', hide);
    fr.svg.setAttribute('tabindex', '0');
    fr.svg.addEventListener('keydown', function (e) {
      var stepN = Math.max(1, Math.round(n / 60));
      if (e.key === 'ArrowRight') { show(cur < 0 ? 0 : cur + stepN); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { show(cur < 0 ? n - 1 : cur - stepN); e.preventDefault(); }
      else if (e.key === 'Escape') hide();
    });
    fr.svg.addEventListener('blur', hide);
  }

  function legendItem(list, color, label, value, line) {
    var li = H('li', null, null, list);
    var key = H('span', 'wlm-key' + (line ? ' wlm-key-line' : ''), null, li); key.style.background = color;
    H('span', null, label, li);
    if (value != null) H('b', null, value, li);
    return li;
  }
  function bar(host, parts) {
    host.textContent = '';
    parts.forEach(function (p) {
      if (p.share <= 0) return;
      var s = H('span', null, null, host); s.style.flex = p.share + ' 1 0'; s.style.background = p.c; s.title = p.label + ': ' + p.text;
    });
  }
  function onResize(fn) {
    var t = 0, lastW = root.clientWidth;
    function go() { if (root.clientWidth === lastW) return; lastW = root.clientWidth; clearTimeout(t); t = setTimeout(fn, 120); }
    if (window.ResizeObserver) new ResizeObserver(go).observe(root); else window.addEventListener('resize', go);
  }

  /* ───────────────────────── ECG ───────────────────────── */
  function gs(x, a, mu, s) { var d = (x - mu) / s; return a * Math.exp(-0.5 * d * d); }
  /* One heartbeat as a sum of five Gaussian waves, in mV; dt is seconds from the R peak. */
  function beatWave(dt, rr) {
    var k = Math.sqrt(Math.min(1.3, Math.max(0.4, rr)));
    return gs(dt, 0.14, -0.16, 0.022) + gs(dt, -0.11, -0.03, 0.009) + gs(dt, 1.1, 0, 0.011) + gs(dt, -0.2, 0.03, 0.009) + gs(dt, 0.3, 0.24 * k, 0.045 * k);
  }
  function initECG() {
    var hrIn = $('#wlm-hr'), playBtn = $('#wlm-play'), newBtn = $('#wlm-new');
    var cv = $('#wlm-monitor'), ctx = cv.getContext('2d');
    var hr = +hrIn.value, seed = 11, R = rng(seed);
    var beats = [], tNow = 0, cursor = 0, W = 0, Hh = 0, dpr = 1, pps = 150, ppm = 60, buf = null, grid = null;
    var running = false, raf = 0, last = 0, shownBeat = null;

    function rrNext(tb) { return (60 / hr) * (1 + 0.045 * Math.sin(TAU * 0.25 * tb) + 0.025 * Math.sin(TAU * 0.09 * tb) + 0.01 * R.g()); }
    function ensure(t) {
      if (!beats.length) beats.push({ t: 0.35, rr: 60 / hr });
      while (beats[beats.length - 1].t < t + 1.5) { var b = beats[beats.length - 1], rr = rrNext(b.t); beats.push({ t: b.t + rr, rr: rr }); }
      while (beats.length > 4 && beats[0].t < t - 2) beats.shift();
    }
    function val(t) {
      ensure(t);
      var v = 0;
      for (var i = 0; i < beats.length; i++) { var dt = t - beats[i].t; if (dt > -0.5 && dt < 0.8) v += beatWave(dt, beats[i].rr); }
      return v + 0.025 * Math.sin(TAU * 0.3 * t) + 0.006 * R.g();
    }
    function yOf(v) { return Hh / 2 - (v - 0.45) * ppm; }
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(200, Math.floor(cv.clientWidth)); Hh = Math.floor(cv.clientHeight);
      cv.width = W * dpr; cv.height = Hh * dpr;
      pps = Math.max(110, W / 6); ppm = Math.min(0.4 * pps, Hh * 0.92 / 1.9);
      grid = document.createElement('canvas'); grid.width = cv.width; grid.height = cv.height;
      var g = grid.getContext('2d'); g.scale(dpr, dpr); g.fillStyle = '#030d1c'; g.fillRect(0, 0, W, Hh);
      var major = 0.2 * pps, minor = major / 5, x, y, y0 = yOf(0);
      function lines(stepPx, alpha) {
        g.strokeStyle = 'rgba(73,220,192,' + alpha + ')'; g.lineWidth = 1; g.beginPath();
        for (x = 0; x <= W; x += stepPx) { g.moveTo(Math.round(x) + 0.5, 0); g.lineTo(Math.round(x) + 0.5, Hh); }
        for (y = y0 % stepPx; y <= Hh; y += stepPx) { g.moveTo(0, Math.round(y) + 0.5); g.lineTo(W, Math.round(y) + 0.5); }
        g.stroke();
      }
      if (minor >= 5) lines(minor, 0.06);
      lines(major, 0.15);
      buf = new Float32Array(W);
      for (var i = 0; i < W; i++) buf[i] = val(tNow + i / pps);
      tNow += W / pps; cursor = 0;
    }
    function draw() {
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(grid, 0, 0); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var c = Math.floor(cursor), gap = running ? 20 : 0, pen = false;
      ctx.beginPath();
      for (var x = 0; x < W; x++) {
        var ahead = (x - c + W) % W;
        if (ahead < gap) { pen = false; continue; }
        var y = yOf(buf[x]);
        if (pen) ctx.lineTo(x, y); else { ctx.moveTo(x, y); pen = true; }
      }
      ctx.strokeStyle = '#49dcc0'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.shadowColor = 'rgba(73,220,192,.55)'; ctx.shadowBlur = 7; ctx.stroke(); ctx.shadowBlur = 0;
      if (running) { var px = (c - 1 + W) % W; ctx.beginPath(); ctx.arc(px, yOf(buf[px]), 3.2, 0, TAU); ctx.fillStyle = '#eafffb'; ctx.fill(); }
    }
    function readout() {
      var b = null;
      for (var i = 0; i < beats.length; i++) if (beats[i].t <= tNow) b = beats[i];
      if (!b || b === shownBeat) return;
      shownBeat = b;
      setText('#wlm-r-hr', Math.round(60 / b.rr) + ' bpm'); setText('#wlm-r-rr', Math.round(b.rr * 1000) + ' ms');
    }
    function advance(dt) {
      var n = dt * pps, steps = Math.max(1, Math.ceil(n));
      for (var i = 1; i <= steps; i++) buf[Math.floor(cursor + n * i / steps) % W] = val(tNow + dt * i / steps);
      tNow += dt; cursor = (cursor + n) % W; readout();
    }
    function tick(ts) {
      if (!running) return;
      var dt = Math.min(0.05, Math.max(0, (ts - last) / 1000)); last = ts;
      advance(dt); draw(); raf = requestAnimationFrame(tick);
    }
    function setRunning(on) {
      running = on; playBtn.textContent = on ? 'Pause' : 'Play'; playBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      cancelAnimationFrame(raf);
      if (on) { last = performance.now(); raf = requestAnimationFrame(tick); } else draw();
    }

    /* Anatomy of one beat */
    function drawBeat() {
      var host = $('#wlm-beat');
      var fr = frame(host, { h: 280, m: { t: 30, r: 14, b: 34, l: 40 }, x: [-0.36, 0.56], y: [-0.55, 1.3], yt: [0, 0.5, 1], xt: [-0.2, 0, 0.2, 0.4],
        yf: function (v) { return v.toFixed(1); }, xf: function (v) { return (v * 1000).toFixed(0); }, yTitle: 'Voltage (mV)', xTitle: 'Time from the R peak (ms)',
        label: 'One synthetic heartbeat with the P wave, QRS complex and T wave shaded, and the PR and QT intervals marked.' });
      var narrow = fr.w < 430;
      var parts = [{ a: -0.215, b: -0.105, c: css('--wlm-blue'), n: 'P wave', s: 'P' }, { a: -0.052, b: 0.052, c: css('--wlm-orange'), n: 'QRS complex', s: 'QRS' }, { a: 0.13, b: 0.35, c: css('--wlm-aqua'), n: 'T wave', s: 'T' }];
      parts.forEach(function (p) {
        S('rect', { x: fr.X(p.a), y: fr.m.t, width: fr.X(p.b) - fr.X(p.a), height: fr.Y(-0.14) - fr.m.t, fill: p.c, opacity: 0.13, rx: 3 }, fr.svg);
        S('text', { x: fr.X((p.a + p.b) / 2), y: fr.m.t + 14, 'text-anchor': 'middle', 'class': 'wlm-lab' }, fr.svg).textContent = narrow ? p.s : p.n;
      });
      var n = 461, t0 = -0.36, dt = 0.002;
      function tx(i) { return t0 + i * dt; }
      S('path', { 'class': 'wlm-line', stroke: css('--wlm-ink'), d: linePath(n, function (i) { return fr.X(tx(i)); }, function (i) { return fr.Y(beatWave(tx(i), 1)); }) }, fr.svg);
      [{ a: -0.215, b: -0.052, y: -0.27, n: 'PR interval' }, { a: -0.052, b: 0.35, y: -0.43, n: 'QT interval' }].forEach(function (b) {
        var y = fr.Y(b.y), x1 = fr.X(b.a), x2 = fr.X(b.b);
        S('path', { d: 'M' + x1 + ' ' + (y - 4) + 'V' + (y + 4) + 'M' + x1 + ' ' + y + 'H' + x2 + 'M' + x2 + ' ' + (y - 4) + 'V' + (y + 4), stroke: css('--wlm-ink-3'), 'stroke-width': 1.2, fill: 'none' }, fr.svg);
        S('text', { x: x2 + 6, y: y + 4, 'class': 'wlm-lab' }, fr.svg).textContent = b.n;
      });
      hover(fr, host, n, function (i) { return fr.X(tx(i)); }, function (i) {
        var t = tx(i), v = beatWave(t, 1), seg = 'Baseline';
        parts.forEach(function (p) { if (t >= p.a && t <= p.b) seg = p.n; });
        return { title: (t >= 0 ? '+' : '−') + Math.abs(Math.round(t * 1000)) + ' ms', rows: [{ c: css('--wlm-ink'), value: v.toFixed(2) + ' mV' }, { value: seg }], dots: [{ y: fr.Y(v), c: css('--wlm-ink') }] };
      });
    }

    /* Beat-to-beat intervals */
    var tSeed = 3;
    function drawTacho() {
      var Rt = rng(tSeed * 977 + 5), n = 120, rr = [], t = 0, m = 60 / hr;
      for (var i = 0; i < n; i++) { var v = m * (1 + 0.05 * Math.sin(TAU * 0.25 * t) + 0.03 * Math.sin(TAU * 0.095 * t + 1) + 0.012 * Rt.g()); rr.push(v * 1000); t += v; }
      var lo = Math.floor(Math.min.apply(null, rr) / 50) * 50, hi = Math.ceil(Math.max.apply(null, rr) / 50) * 50, stepY = (hi - lo) > 250 ? 100 : 50, yt = [];
      for (var y = lo; y <= hi; y += stepY) yt.push(y);
      var host = $('#wlm-tacho');
      var fr = frame(host, { h: 240, m: { t: 28, r: 14, b: 34, l: 44 }, x: [1, n], y: [lo, hi], yt: yt, xt: function (w) { return w < 430 ? [1, 40, 80, 120] : [1, 20, 40, 60, 80, 100, 120]; },
        yTitle: 'RR interval (ms)', xTitle: 'Beat number', label: 'Synthetic beat-to-beat RR intervals over 120 beats.' });
      var blue = css('--wlm-blue');
      S('path', { 'class': 'wlm-line', stroke: blue, d: linePath(n, function (i) { return fr.X(i + 1); }, function (i) { return fr.Y(rr[i]); }) }, fr.svg);
      hover(fr, host, n, function (i) { return fr.X(i + 1); }, function (i) {
        return { title: 'Beat ' + (i + 1), rows: [{ c: blue, value: Math.round(rr[i]) + ' ms', label: 'RR interval' }, { value: Math.round(60000 / rr[i]) + ' bpm', label: 'instantaneous rate' }], dots: [{ y: fr.Y(rr[i]), c: blue }] };
      });
      var diffs = []; for (var j = 1; j < n; j++) diffs.push((rr[j] - rr[j - 1]) * (rr[j] - rr[j - 1]));
      setText('#wlm-s-hr', Math.round(60000 / mean(rr)) + ' bpm'); setText('#wlm-s-sdnn', Math.round(sd(rr)) + ' ms'); setText('#wlm-s-rmssd', Math.round(Math.sqrt(mean(diffs))) + ' ms');
    }

    function setHr() {
      hr = +hrIn.value; setText('#wlm-hr-out', hr + ' bpm');
      beats = beats.filter(function (b) { return b.t < tNow + 0.25; });
      drawTacho();
    }
    hrIn.addEventListener('input', setHr);
    playBtn.addEventListener('click', function () { setRunning(!running); });
    newBtn.addEventListener('click', function () { seed++; tSeed++; R = rng(seed * 131); drawTacho(); });
    document.addEventListener('visibilitychange', function () { if (!document.hidden && running) { last = performance.now(); } });
    onResize(function () { size(); draw(); drawBeat(); drawTacho(); });
    setText('#wlm-hr-out', hr + ' bpm');
    size(); readout(); drawBeat(); drawTacho(); setRunning(!reduceMotion);
  }

  /* ───────────────────────── CGM ───────────────────────── */
  function initCGM() {
    var MG = 18.016, LOW = 70, HIGH = 180, DAYS = 14, N = 288;
    var unit = 'mg', day = 0, seed = 21, days = [];
    function fmt(v) { return unit === 'mg' ? String(Math.round(v)) : (v / MG).toFixed(1); }
    function unitName() { return unit === 'mg' ? 'mg/dL' : 'mmol/L'; }
    function ticksY() { return unit === 'mg' ? [50, 100, 150, 200, 250] : [3, 6, 9, 12].map(function (v) { return v * MG; }); }
    function genDay(R) {
      var meals = [{ t: 7.5 + R.g() * 0.3, a: 55 + R.u() * 60, n: 'Breakfast' }, { t: 12.6 + R.g() * 0.3, a: 45 + R.u() * 60, n: 'Lunch' }, { t: 16.1 + R.g() * 0.3, a: 12 + R.u() * 28, n: 'Snack' }, { t: 19.3 + R.g() * 0.35, a: 62 + R.u() * 72, n: 'Dinner' }];
      meals.forEach(function (m) { m.tau = 44 + R.u() * 14; });
      var base = 93 + R.g() * 5, dip = R.u() < 0.42 ? { t: 2.2 + R.u() * 2.4, a: 25 + R.u() * 11 } : null, e = 0, y = [];
      for (var i = 0; i < N; i++) {
        var h = i / 12, v = base + 8 * Math.exp(-0.5 * Math.pow((h - 6.4) / 1.5, 2));
        for (var k = 0; k < meals.length; k++) { var dt = (h - meals[k].t) * 60; if (dt > 0) { var x = dt / meals[k].tau; v += meals[k].a * x * Math.exp(1 - x); } }
        if (dip) v -= dip.a * Math.exp(-0.5 * Math.pow((h - dip.t) / 0.7, 2));
        e = 0.9 * e + R.g() * 1.5; y.push(Math.max(46, v + e));
      }
      return { y: y, meals: meals };
    }
    function generate() { var R = rng(seed * 7919 + 3); days = []; for (var d = 0; d < DAYS; d++) days.push(genDay(R)); }
    function shares(vals) {
      var lo = 0, hi = 0;
      vals.forEach(function (v) { if (v < LOW) lo++; else if (v > HIGH) hi++; });
      return { lo: lo / vals.length, hi: hi / vals.length, mid: 1 - (lo + hi) / vals.length };
    }
    function pct(x) { var p = x * 100; return (p > 0 && p < 1 ? '<1' : Math.round(p)) + '%'; }

    function drawDay(animate) {
      var d = days[day], host = $('#wlm-day');
      var fr = frame(host, { h: 300, m: { t: 28, r: 46, b: 34, l: 40 }, x: [0, 24], y: [40, 270], yt: ticksY(), yf: fmt,
        xt: function (w) { return w < 520 ? [0, 6, 12, 18, 24] : [0, 3, 6, 9, 12, 15, 18, 21, 24]; }, xf: function (h) { return pad(h) + ':00'; },
        yTitle: 'Glucose (' + unitName() + ')', label: 'Synthetic continuous glucose trace for one day with the 70 to 180 mg/dL target range shaded.' });
      var svg = fr.svg, x0 = fr.m.l, x1 = fr.w - fr.m.r, yH = fr.Y(HIGH), yL = fr.Y(LOW), bottom = fr.m.t + fr.ih;
      S('rect', { x: x0, y: yH, width: fr.iw, height: yL - yH, fill: '#fff', opacity: 0.07 }, svg);
      [[HIGH, yH], [LOW, yL]].forEach(function (p) {
        S('line', { x1: x0, x2: x1, y1: p[1], y2: p[1], stroke: 'rgba(255,255,255,.4)', 'stroke-width': 1 }, svg);
        S('text', { x: x1 + 6, y: p[1] + 4, 'class': 'wlm-lab' }, svg).textContent = fmt(p[0]);
      });
      S('text', { x: x0 + 6, y: yH + 14 }, svg).textContent = 'Target range';
      function px(i) { return fr.X(i / 12); } function py(i) { return fr.Y(d.y[i]); }
      var line = linePath(N, px, py), uid = 'wlmc' + Math.random().toString(36).slice(2, 8);
      var defs = S('defs', {}, svg);
      S('rect', { x: x0, y: fr.m.t, width: fr.iw, height: yH - fr.m.t }, S('clipPath', { id: uid + 'h' }, defs));
      S('rect', { x: x0, y: yL, width: fr.iw, height: bottom - yL }, S('clipPath', { id: uid + 'l' }, defs));
      var fills = S('g', {}, svg);
      S('path', { d: line + 'L' + px(N - 1) + ' ' + yH + 'L' + px(0) + ' ' + yH + 'Z', fill: '#eb6834', opacity: 0.5, 'clip-path': 'url(#' + uid + 'h)' }, fills);
      S('path', { d: line + 'L' + px(N - 1) + ' ' + yL + 'L' + px(0) + ' ' + yL + 'Z', fill: '#3987e5', opacity: 0.6, 'clip-path': 'url(#' + uid + 'l)' }, fills);
      d.meals.forEach(function (m) {
        var mx = fr.X(m.t);
        S('path', { d: 'M' + mx + ' ' + (bottom - 9) + 'l5 8h-10z', fill: '#cfe2f3' }, svg);
        if (fr.w >= 560) S('text', { x: mx, y: bottom - 13, 'text-anchor': 'middle' }, svg).textContent = m.n;
      });
      var path = S('path', { 'class': 'wlm-line', stroke: '#49dcc0', d: line }, svg);
      drawIn(path, animate); fadeIn(fills, animate);
      hover(fr, host, N, px, function (i) {
        var v = d.y[i];
        return { title: clock(i * 5), rows: [{ c: '#49dcc0', value: fmt(v) + ' ' + unitName() }, { value: v < LOW ? 'Below range' : v > HIGH ? 'Above range' : 'In range' }], dots: [{ y: py(i), c: '#49dcc0' }] };
      });
      var s = shares(d.y), peak = Math.max.apply(null, d.y), trough = Math.min.apply(null, d.y);
      setText('#wlm-day-out', 'Day ' + (day + 1) + ' of ' + DAYS);
      setText('#wlm-r-mean', fmt(mean(d.y)) + ' ' + unitName()); setText('#wlm-r-range', fmt(trough) + ' – ' + fmt(peak));
      setText('#wlm-r-tir', pct(s.mid)); setText('#wlm-r-peak', clock(d.y.indexOf(peak) * 5));
      $('#wlm-prev').disabled = day === 0; $('#wlm-next').disabled = day === DAYS - 1;
    }
    function drawSummary() {
      var all = []; days.forEach(function (d) { all = all.concat(d.y); });
      var s = shares(all), blue = css('--wlm-blue'), aqua = css('--wlm-aqua'), orange = css('--wlm-orange');
      var parts = [{ c: blue, label: 'Below ' + fmt(LOW) + ' ' + unitName(), share: s.lo }, { c: aqua, label: 'In range, ' + fmt(LOW) + ' to ' + fmt(HIGH), share: s.mid }, { c: orange, label: 'Above ' + fmt(HIGH), share: s.hi }];
      parts.forEach(function (p) { p.text = pct(p.share) + ' · ' + (p.share * 24).toFixed(1) + ' h per day'; });
      bar($('#wlm-tir-bar'), parts);
      var list = $('#wlm-tir-legend'); list.textContent = '';
      parts.forEach(function (p) { legendItem(list, p.c, p.label, p.text); });
      setText('#wlm-s-mean', fmt(mean(all)) + ' ' + unitName()); setText('#wlm-s-cv', Math.round(sd(all) / mean(all) * 100) + '%'); setText('#wlm-s-tir', pct(s.mid));
    }
    function drawAGP() {
      var bins = 96, q = { p5: [], p25: [], p50: [], p75: [], p95: [] };
      for (var b = 0; b < bins; b++) {
        var vals = [];
        days.forEach(function (d) { for (var k = 0; k < 3; k++) vals.push(d.y[b * 3 + k]); });
        vals.sort(function (a, c) { return a - c; });
        q.p5.push(quantile(vals, 0.05)); q.p25.push(quantile(vals, 0.25)); q.p50.push(quantile(vals, 0.5)); q.p75.push(quantile(vals, 0.75)); q.p95.push(quantile(vals, 0.95));
      }
      var host = $('#wlm-agp');
      var fr = frame(host, { h: 280, m: { t: 28, r: 46, b: 34, l: 40 }, x: [0, 24], y: [40, 270], yt: ticksY(), yf: fmt,
        xt: function (w) { return w < 520 ? [0, 6, 12, 18, 24] : [0, 3, 6, 9, 12, 15, 18, 21, 24]; }, xf: function (h) { return pad(h) + ':00'; },
        yTitle: 'Glucose (' + unitName() + ')', label: 'Synthetic glucose profile across 14 days by time of day: median with 25th to 75th and 5th to 95th percentile bands.' });
      var svg = fr.svg, blue = css('--wlm-blue'), navy = css('--wlm-navy'), x1 = fr.w - fr.m.r;
      function px(i) { return fr.X((i + 0.5) / 4); }
      function band(lo, hi, op) {
        var dd = linePath(bins, px, function (i) { return fr.Y(hi[i]); });
        for (var i = bins - 1; i >= 0; i--) dd += 'L' + px(i).toFixed(1) + ' ' + fr.Y(lo[i]).toFixed(1);
        S('path', { d: dd + 'Z', fill: blue, opacity: op }, svg);
      }
      band(q.p5, q.p95, 0.13); band(q.p25, q.p75, 0.26);
      [HIGH, LOW].forEach(function (v) {
        S('line', { x1: fr.m.l, x2: x1, y1: fr.Y(v), y2: fr.Y(v), stroke: css('--wlm-ink-3'), 'stroke-width': 1 }, svg);
        S('text', { x: x1 + 6, y: fr.Y(v) + 4, 'class': 'wlm-lab' }, svg).textContent = fmt(v);
      });
      S('path', { 'class': 'wlm-line', stroke: navy, d: linePath(bins, px, function (i) { return fr.Y(q.p50[i]); }) }, svg);
      hover(fr, host, bins, px, function (i) {
        return { title: clock(i * 15) + ' – ' + clock(i * 15 + 15), rows: [{ c: navy, value: fmt(q.p50[i]) + ' ' + unitName(), label: 'median' }, { value: fmt(q.p25[i]) + ' – ' + fmt(q.p75[i]), label: 'middle 50%' }, { value: fmt(q.p5[i]) + ' – ' + fmt(q.p95[i]), label: 'middle 90%' }], dots: [{ y: fr.Y(q.p50[i]), c: navy }] };
      });
    }
    function all(animate) { drawDay(animate); drawSummary(); drawAGP(); }
    $('#wlm-prev').addEventListener('click', function () { if (day > 0) { day--; drawDay(true); } });
    $('#wlm-next').addEventListener('click', function () { if (day < DAYS - 1) { day++; drawDay(true); } });
    $('#wlm-new').addEventListener('click', function () { seed++; day = 0; generate(); all(true); });
    Array.prototype.forEach.call(root.querySelectorAll('[data-unit]'), function (b) {
      b.addEventListener('click', function () {
        unit = b.getAttribute('data-unit');
        Array.prototype.forEach.call(root.querySelectorAll('[data-unit]'), function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
        all(false);
      });
    });
    onResize(function () { all(false); });
    generate(); all(true);
  }

  /* ───────────────────────── Sleep ───────────────────────── */
  function initSleep() {
    var TIB = 480, START = 23 * 60, ORDER = ['W', 'REM', 'N1', 'N2', 'N3'];
    var NAME = { W: 'Wake', REM: 'REM', N1: 'N1', N2: 'N2', N3: 'N3' };
    var LONG = { W: 'Wake', REM: 'REM sleep', N1: 'N1, lightest sleep', N2: 'N2, light sleep', N3: 'N3, deep sleep' };
    var DARK = { W: '#f0834f', REM: '#49dcc0', N1: '#b7d3f6', N2: '#5598e7', N3: '#2f6fd0' };
    var seed = 5, night = null;
    function light(s) { return css('--wlm-' + (s === 'W' ? 'wake' : s.toLowerCase())); }
    function generate() {
      var R = rng(seed * 4409 + 17), st = [];
      function add(s, d) { d = Math.max(1, Math.round(d)); while (d-- > 0 && st.length < TIB) st.push(s); }
      add('W', 7 + R.u() * 11);
      var n3 = [34, 24, 13, 5], rem = [8, 16, 22, 27, 30];
      for (var c = 0; st.length < TIB; c++) {
        add('N1', 3 + R.u() * 4); add('N2', 13 + R.u() * 10);
        if (c < n3.length) { add('N3', n3[c] * (0.8 + R.u() * 0.4)); add('N2', 5 + R.u() * 7); } else add('N2', 16 + R.u() * 10);
        if (R.u() < 0.35) { add('W', 1 + R.u() * 3); add('N1', 2 + R.u() * 2); add('N2', 4 + R.u() * 5); }
        add('REM', rem[Math.min(c, rem.length - 1)] * (0.8 + R.u() * 0.4));
        if (R.u() < 0.4) add('W', 1 + R.u() * 3);
      }
      var tail = Math.round(3 + R.u() * 4); for (var i = TIB - tail; i < TIB; i++) st[i] = 'W';
      var segs = [];
      st.forEach(function (s, m) { var l = segs[segs.length - 1]; if (l && l.s === s) l.d++; else segs.push({ s: s, t: m, d: 1 }); });
      var hrBase = { W: 66, N1: 60, N2: 56, N3: 52, REM: 61 }, spBase = { W: 97.2, N1: 96.8, N2: 96.5, N3: 96.6, REM: 96.0 };
      var hr = [], sp = [], cur = 66, e = 0, es = 0;
      st.forEach(function (s, m) {
        cur += (hrBase[s] - 4 * Math.sin(Math.PI * m / TIB) - cur) * 0.25;
        e = 0.7 * e + R.g() * (s === 'REM' ? 1.7 : s === 'W' ? 1.5 : 0.65);
        hr.push(cur + e);
        if (s === 'REM' && R.u() < 0.06) es -= 1.1;
        es = 0.8 * es + R.g() * (s === 'REM' ? 0.32 : 0.17);
        sp.push(Math.min(99.4, Math.max(91.5, spBase[s] + es)));
      });
      var mins = { W: 0, REM: 0, N1: 0, N2: 0, N3: 0 }; st.forEach(function (s) { mins[s]++; });
      var sol = 0; while (st[sol] === 'W') sol++;
      night = { st: st, segs: segs, hr: hr, sp: sp, mins: mins, sol: sol, tst: TIB - mins.W };
    }
    function segAt(m) { for (var i = night.segs.length - 1; i >= 0; i--) if (night.segs[i].t <= m) return night.segs[i]; return night.segs[0]; }
    function xTicks(w) { var t = [], step = w < 520 ? 120 : 60; for (var m = step; m <= TIB; m += step) t.push(m); return t; }

    function drawHyp(animate) {
      var host = $('#wlm-hyp'); host.textContent = '';
      var w = Math.max(260, Math.floor(host.clientWidth)), h = 250, m = { t: 12, r: 14, b: 30, l: 46 }, iw = w - m.l - m.r, ih = h - m.t - m.b;
      var svg = S('svg', { width: w, height: h, viewBox: '0 0 ' + w + ' ' + h, role: 'img', 'aria-label': 'Synthetic hypnogram: sleep stage across one eight-hour night.' }, host);
      function X(v) { return m.l + v / TIB * iw; }
      function rowY(s) { return m.t + (ORDER.indexOf(s) + 0.5) * ih / ORDER.length; }
      ORDER.forEach(function (s) {
        S('line', { x1: m.l, x2: w - m.r, y1: rowY(s), y2: rowY(s), 'class': 'wlm-grid' }, svg);
        S('text', { x: m.l - 8, y: rowY(s) + 4, 'text-anchor': 'end', 'class': 'wlm-lab' }, svg).textContent = NAME[s];
      });
      S('line', { x1: m.l, x2: w - m.r, y1: m.t + ih, y2: m.t + ih, 'class': 'wlm-base' }, svg);
      S('text', { x: X(0), y: h - m.b + 17, 'text-anchor': 'start' }, svg).textContent = clock(START);
      xTicks(w).forEach(function (v) { S('text', { x: X(v), y: h - m.b + 17, 'text-anchor': v === TIB ? 'end' : 'middle' }, svg).textContent = clock(START + v); });
      var uid = 'wlms' + Math.random().toString(36).slice(2, 8);
      var clip = S('rect', { x: m.l - 2, y: 0, width: iw + 4, height: h }, S('clipPath', { id: uid }, S('defs', {}, svg)));
      var g = S('g', { 'clip-path': 'url(#' + uid + ')' }, svg), d = '';
      night.segs.forEach(function (sg, i) { if (i) d += 'M' + X(sg.t).toFixed(1) + ' ' + rowY(night.segs[i - 1].s) + 'V' + rowY(sg.s); });
      S('path', { d: d, stroke: 'rgba(255,255,255,.32)', 'stroke-width': 1, fill: 'none' }, g);
      night.segs.forEach(function (sg) {
        var bw = Math.max(1.5, X(sg.t + sg.d) - X(sg.t));
        S('rect', { x: X(sg.t), y: rowY(sg.s) - 6, width: bw, height: 12, rx: Math.min(3, bw / 2), fill: DARK[sg.s] }, g);
      });
      if (animate && !reduceMotion) {
        var t0 = performance.now();
        clip.setAttribute('width', 0);
        (function grow(ts) { var p = Math.min(1, (ts - t0) / 1800); clip.setAttribute('width', (iw + 4) * (1 - Math.pow(1 - p, 2))); if (p < 1) requestAnimationFrame(grow); })(t0);
      }
      var fr = { svg: svg, w: w, m: m, iw: iw, ih: ih };
      hover(fr, host, TIB, function (i) { return X(i + 0.5); }, function (i) {
        var sg = segAt(i);
        return { title: clock(START + i), rows: [{ c: DARK[sg.s], value: LONG[sg.s] }, { value: clock(START + sg.t) + ' – ' + clock(START + sg.t + sg.d), label: sg.d + ' min' }], dots: [{ y: rowY(sg.s), c: DARK[sg.s] }] };
      });
      setText('#wlm-r-tib', hm(TIB)); setText('#wlm-r-tst', hm(night.tst)); setText('#wlm-r-eff', Math.round(night.tst / TIB * 100) + '%'); setText('#wlm-r-sol', night.sol + ' min');
    }
    function drawComp() {
      var parts = ORDER.map(function (s) { return { c: light(s), label: LONG[s], share: night.mins[s] / TIB, text: night.mins[s] + ' min · ' + Math.round(night.mins[s] / TIB * 100) + '%' }; });
      bar($('#wlm-comp-bar'), parts);
      var list = $('#wlm-comp-legend'); list.textContent = '';
      parts.forEach(function (p) { legendItem(list, p.c, p.label, p.text); });
    }
    function drawPhys() {
      var host = $('#wlm-phys'); host.textContent = '';
      var w = Math.max(260, Math.floor(host.clientWidth)), m = { t: 34, r: 14, b: 30, l: 40 }, ph = 105, gap = 40, h = m.t + ph * 2 + gap + m.b, iw = w - m.l - m.r;
      var svg = S('svg', { width: w, height: h, viewBox: '0 0 ' + w + ' ' + h, role: 'img', 'aria-label': 'Synthetic overnight heart rate and blood oxygen saturation, aligned with sleep stage.' }, host);
      function X(v) { return m.l + v / TIB * iw; }
      var navy = css('--wlm-navy');
      S('text', { x: m.l, y: 10, 'class': 'wlm-ytitle' }, svg).textContent = 'Sleep stage';
      night.segs.forEach(function (sg) { S('rect', { x: X(sg.t), y: 15, width: Math.max(1, X(sg.t + sg.d) - X(sg.t) - (sg.d > 4 ? 1 : 0)), height: 8, fill: light(sg.s) }, svg); });
      var panels = [{ top: m.t + 14, data: night.hr, dom: [44, 82], ticks: [50, 60, 70, 80], title: 'Heart rate (bpm)' }, { top: m.t + 14 + ph + gap - 14, data: night.sp, dom: [92, 100], ticks: [94, 96, 98], title: 'Blood oxygen saturation, SpO₂ (%)' }];
      panels.forEach(function (p) {
        p.h = ph - 14;
        p.Y = function (v) { return p.top + p.h - (v - p.dom[0]) / (p.dom[1] - p.dom[0]) * p.h; };
        S('text', { x: m.l, y: p.top - 9, 'class': 'wlm-ytitle' }, svg).textContent = p.title;
        p.ticks.forEach(function (v) { S('line', { x1: m.l, x2: w - m.r, y1: p.Y(v), y2: p.Y(v), 'class': 'wlm-grid' }, svg); S('text', { x: m.l - 8, y: p.Y(v) + 4, 'text-anchor': 'end' }, svg).textContent = v; });
        S('line', { x1: m.l, x2: w - m.r, y1: p.top + p.h, y2: p.top + p.h, 'class': 'wlm-base' }, svg);
        S('path', { 'class': 'wlm-line', stroke: navy, d: linePath(TIB, function (i) { return X(i + 0.5); }, function (i) { return p.Y(p.data[i]); }) }, svg);
      });
      var axisY = panels[1].top + panels[1].h + 17;
      S('text', { x: X(0), y: axisY, 'text-anchor': 'start' }, svg).textContent = clock(START);
      xTicks(w).forEach(function (v) { S('text', { x: X(v), y: axisY, 'text-anchor': v === TIB ? 'end' : 'middle' }, svg).textContent = clock(START + v); });
      var fr = { svg: svg, w: w, m: { t: 15, l: m.l, r: m.r, b: 0 }, iw: iw, ih: panels[1].top + panels[1].h - 15 };
      hover(fr, host, TIB, function (i) { return X(i + 0.5); }, function (i) {
        var s = night.st[i];
        return { title: clock(START + i), rows: [{ c: light(s), value: LONG[s] }, { c: navy, value: Math.round(night.hr[i]) + ' bpm', label: 'heart rate' }, { c: navy, value: night.sp[i].toFixed(1) + '%', label: 'SpO₂' }], dots: [{ y: panels[0].Y(night.hr[i]), c: navy }, { y: panels[1].Y(night.sp[i]), c: navy }] };
      });
    }
    function all(animate) { drawHyp(animate); drawComp(); drawPhys(); }
    $('#wlm-new').addEventListener('click', function () { seed++; generate(); all(true); });
    $('#wlm-replay').addEventListener('click', function () { drawHyp(true); });
    onResize(function () { all(false); });
    generate(); all(true);
  }

  if (kind === 'ecg') initECG(); else if (kind === 'cgm') initCGM(); else if (kind === 'sleep') initSleep();
})();
