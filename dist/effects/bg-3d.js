/* ================================================================
   SkillX — isolated 3D particle background, MOBILE-FIRST v2.
   SELF-CONTAINED: touches NOTHING except the canvas #bg-3d.
   No libraries (no Three.js): dependency-free Canvas 2D, so the
   page never waits on a 3D download — it opens instantly even on
   slow links/tunnels. The loader (SkillXFeatures) also defers
   this file until after window 'load'.

   Features (all inside this one script):
   1. Zero scroll-trap — canvas keeps pointer-events: none.
   2. Scroll-tied progression — window.scrollY is lerped into a
      smooth field rotation/drift as the user scrolls.
   3. Gyroscope parallax — deviceorientation gamma/beta, damped,
      shifts the scene on phone tilt. iOS permission is requested
      safely on the first user tap (pointerdown), never on load.
   4. Tap-to-react + haptics — pointerdown on window (canvas
      stays pointer-events:none) spawns an elastic particle
      ripple at the tap point + navigator.vibrate(15).
   5. Adaptive FPS — mobile (<768px): particle count cut ~65%,
      pixelRatio = 1. Desktop: pixelRatio min(dpr, 1.5). Loop
      pauses when document.hidden. Scroll/gyro listeners only
      store values (the rAF loop reads them) = built-in throttle.
   6. Fail-safe — everything is wrapped in try/catch; if the 2D
      context is unavailable the canvas is hidden and the site
      runs 100% normally without it.
   7. Lite mode (html.lite) / reduced-motion: one static frame.
   ================================================================ */
(function () {
  'use strict';
  try {
    var canvas = document.getElementById('bg-3d');
    if (!canvas) return;
    var ctx = null;
    try { ctx = canvas.getContext('2d'); } catch (e) { ctx = null; }
    if (!ctx) { canvas.style.display = 'none'; return; }

    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';

    var COLORS = ['182,243,74', '139,92,246', '94,234,212']; // lime, violet, teal
    var W = 0, H = 0, particles = [], ripples = [], raf = null;
    var mouseX = -9999, mouseY = -9999;
    /* raw targets (set by listeners) + lerped values (used by draw) */
    var scrollTarget = 0, scrollLerp = 0;
    var gyroTargetX = 0, gyroTargetY = 0, gyroX = 0, gyroY = 0;
    var gyroAsked = false;

    function isMobile() { return window.innerWidth < 768; }
    function isLite() {
      return document.documentElement.classList.contains('lite') ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    function pixelRatio() { return isMobile() ? 1 : Math.min(window.devicePixelRatio || 1, 1.5); }

    function resize() {
      var dpr = pixelRatio();
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function seed() {
      var base = Math.max(24, Math.min(90, Math.floor(W * H / 26000)));
      var count = isMobile() ? Math.max(10, Math.floor(base * 0.35)) : base; // −65% on mobile
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          z: 0.35 + Math.random() * 0.65,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          c: COLORS[i % COLORS.length]
        });
      }
    }

    function draw() {
      /* ease the progression values toward their targets (lerp) */
      scrollLerp += (scrollTarget - scrollLerp) * 0.06;
      gyroX += (gyroTargetX - gyroX) * 0.05;
      gyroY += (gyroTargetY - gyroY) * 0.05;

      /* scene offset = scroll drift + gyro shift + a slow rotation
         of the whole field around the screen centre */
      var angle = scrollLerp * 0.00035;
      var cos = Math.cos(angle), sin = Math.sin(angle);
      var ox = gyroX * 26 - scrollLerp * 0.012;
      var oy = gyroY * 26;

      ctx.clearRect(0, 0, W, H);
      var cx = W / 2, cy = H / 2;
      var i, j, p, q, dx, dy, d2, px, py, qx, qy;

      function project(pt) {
        var rx = pt.x - cx, ry = pt.y - cy;
        return [cx + rx * cos - ry * sin + ox * pt.z, cy + rx * sin + ry * cos + oy * pt.z];
      }

      for (i = 0; i < particles.length; i++) {
        p = particles[i];
        var pp = project(p); px = pp[0]; py = pp[1];
        for (j = i + 1; j < particles.length; j++) {
          q = particles[j];
          dx = p.x - q.x; dy = p.y - q.y; d2 = dx * dx + dy * dy;
          if (d2 < 110 * 110) {
            var qq = project(q); qx = qq[0]; qy = qq[1];
            ctx.strokeStyle = 'rgba(' + p.c + ',' + (0.10 * (1 - d2 / (110 * 110))).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(qx, qy); ctx.stroke();
          }
        }
        /* pointer parallax (desktop) */
        dx = p.x - mouseX; dy = p.y - mouseY; d2 = dx * dx + dy * dy;
        if (d2 < 120 * 120 && d2 > 0.01) {
          var d = Math.sqrt(d2);
          p.x += (dx / d) * 0.6 * p.z;
          p.y += (dy / d) * 0.6 * p.z;
        }
        p.x += p.vx * p.z; p.y += p.vy * p.z;
        if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10;
        ctx.fillStyle = 'rgba(' + p.c + ',' + (0.35 + p.z * 0.4).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(px, py, 1.1 + p.z * 1.7, 0, Math.PI * 2);
        ctx.fill();
      }

      /* tap ripples: expanding elastic rings that push particles */
      for (i = ripples.length - 1; i >= 0; i--) {
        var r = ripples[i];
        r.age += 1;
        var t = r.age / 42;                       /* 42 frames ≈ 0.7s */
        if (t >= 1) { ripples.splice(i, 1); continue; }
        var ease = 1 - Math.pow(1 - t, 3);        /* easeOutCubic */
        var radius = 12 + ease * 130;
        ctx.strokeStyle = 'rgba(' + r.c + ',' + (0.5 * (1 - t)).toFixed(3) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(r.x, r.y, radius, 0, Math.PI * 2); ctx.stroke();
        for (j = 0; j < particles.length; j++) {
          p = particles[j];
          dx = p.x - r.x; dy = p.y - r.y;
          var dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (Math.abs(dist - radius) < 26) {     /* elastic push at the ring */
            var push = (1 - t) * 2.4 * p.z;
            p.x += (dx / dist) * push;
            p.y += (dy / dist) * push;
          }
        }
      }
    }

    function loop() { draw(); raf = requestAnimationFrame(loop); }
    function start() {
      try {
        if (isLite()) { draw(); return; }
        if (raf === null) loop();
      } catch (e) { stop(); canvas.style.display = 'none'; }
    }
    function stop() { if (raf !== null) { cancelAnimationFrame(raf); raf = null; } }

    /* --- listeners: passive + value-only (throttled by rAF) --- */
    window.addEventListener('scroll', function () { scrollTarget = window.scrollY || 0; }, { passive: true });
    window.addEventListener('resize', function () { resize(); if (isLite()) draw(); });
    window.addEventListener('mousemove', function (e) { mouseX = e.clientX; mouseY = e.clientY; });
    window.addEventListener('deviceorientation', function (e) {
      if (e.gamma === null || e.beta === null) return;
      gyroTargetX = Math.max(-1, Math.min(1, e.gamma / 35));        /* left/right tilt */
      gyroTargetY = Math.max(-1, Math.min(1, (e.beta - 45) / 35));  /* front/back tilt (45° = natural hold) */
    });

    window.addEventListener('pointerdown', function (e) {
      /* iOS: motion permission may only be requested from a user
         gesture — ask once, on the first tap, and never block it. */
      if (!gyroAsked) {
        gyroAsked = true;
        try {
          if (typeof DeviceOrientationEvent !== 'undefined' &&
              typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission().catch(function () {});
          }
        } catch (err) { /* permission unavailable — gyro simply stays off */ }
      }
      /* tap-to-react: ripple at the tap point + micro-haptic */
      ripples.push({ x: e.clientX, y: e.clientY, age: 0, c: COLORS[Math.floor(Math.random() * COLORS.length)] });
      if (navigator.vibrate) { try { navigator.vibrate(15); } catch (err) {} }
      if (isLite()) draw();
    }, { passive: true });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    resize();
    start();
  } catch (e) {
    /* fail-safe: no 3D, site unaffected */
    try {
      var c = document.getElementById('bg-3d');
      if (c) c.style.display = 'none';
    } catch (err) {}
  }
})();
