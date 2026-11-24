/* ==========================================================
   مفاجأة عيد الميلاد — script.js
   (HTML + CSS + Vanilla JS فقط)
   ========================================================== */
(() => {
  'use strict';

  /* ----------------------------------------------------------
     0. إعدادات
     ----------------------------------------------------------
     كلمة السر مكتوبة في السطر التالي مباشرة (PASSWORD).
     مهم: ده حماية بسيطة جدًا لمفاجأة شخصية، وليس أمانًا حقيقيًا،
     لأن أي حد بيفتح الكود يقدر يشوف كلمة السر والرسالة. */
  const PASSWORD = '25112005'; // ← كلمة السر هنا (غيّريها من هنا مباشرة)

  const WRONG_MESSAGES = [
    'مش دي كلمة السر يا قمر.. جربي تاني 🤍',
    'لسه مش هي يا قلبي، فكّري كده تاني 💗',
    'حاولي تاني يا حبيبتي، أنا واثق إنك تعرفيها 🌸'
  ];

  const $ = (sel) => document.querySelector(sel);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => rm.matches;
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const gate = $('#gate');
  const form = $('#gateForm');
  const input = $('#pass');
  const msgEl = $('#passMsg');
  const btn = $('#gateBtn');
  const scene = $('#scene');
  const card = $('#letter');
  const scroller = $('#letterScroll');
  const hint = $('#scrollHint');
  const closing = $('#closing');
  const greeting = $('#greeting');

  /* ----------------------------------------------------------
     1. صفحة كلمة السر: قلوب ونجوم عايمة
     ---------------------------------------------------------- */
  function buildFloaters() {
    const box = $('#floaters');
    const frag = document.createDocumentFragment();
    const hearts = ['♥︎', '♥︎', '♡︎', '❤︎'];
    const stars = ['✦', '✧', '★︎'];
    const colors = ['#E88BAE', '#ffffff', '#9E1B32', '#F8C8DC', '#d9628d'];
    const still = reduced();
    const small = window.innerWidth < 600;

    const nFloat = still ? 14 : small ? 16 : 26;
    for (let i = 0; i < nFloat; i++) {
      const el = document.createElement('span');
      el.className = 'fl' + (still ? ' static' : '');
      el.textContent = hearts[(Math.random() * hearts.length) | 0];
      el.style.setProperty('--x', rand(2, 96).toFixed(1) + '%');
      el.style.setProperty('--y', rand(5, 92).toFixed(1) + '%');
      el.style.setProperty('--s', rand(11, 26).toFixed(0) + 'px');
      el.style.setProperty('--c', colors[(Math.random() * colors.length) | 0]);
      el.style.setProperty('--d', rand(12, 24).toFixed(1) + 's');
      el.style.setProperty('--dl', (-rand(0, 24)).toFixed(1) + 's');
      el.style.setProperty('--sw', rand(-40, 40).toFixed(0) + 'px');
      frag.appendChild(el);
    }

    const nStars = still ? 18 : small ? 18 : 30;
    for (let i = 0; i < nStars; i++) {
      const el = document.createElement('span');
      el.className = 'tw' + (still ? ' static' : '');
      el.textContent = stars[(Math.random() * stars.length) | 0];
      el.style.setProperty('--x', rand(2, 97).toFixed(1) + '%');
      el.style.setProperty('--y', rand(3, 96).toFixed(1) + '%');
      el.style.setProperty('--s', rand(8, 18).toFixed(0) + 'px');
      el.style.setProperty('--d', rand(2.2, 5).toFixed(1) + 's');
      el.style.setProperty('--dl', (-rand(0, 5)).toFixed(1) + 's');
      frag.appendChild(el);
    }
    box.appendChild(frag);
  }
  buildFloaters();

  /* ----------------------------------------------------------
     2. التحقق من كلمة السر
     ---------------------------------------------------------- */
  // يحوّل الأرقام العربية/الفارسية لأرقام إنجليزية (لو كتبتها بكيبورد عربي)
  function normalizeDigits(s) {
    return s
      .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
      .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  }

  async function isCorrect(value) {
    return value === PASSWORD;
  }

  let wrongCount = 0;
  function showWrong() {
    msgEl.textContent = WRONG_MESSAGES[wrongCount++ % WRONG_MESSAGES.length];
    msgEl.classList.add('show');
    form.classList.remove('shake');
    void form.offsetWidth; // إعادة تشغيل الأنيميشن
    form.classList.add('shake');
    input.select();
  }

  input.addEventListener('input', () => msgEl.classList.remove('show'));
  form.addEventListener('animationend', (e) => {
    form.classList.add('ready');          // بعد ظهور الفورم: نثبّته بدون إعادة الأنيميشن
    if (e.animationName === 'shake') form.classList.remove('shake');
  });

  let unlocked = false;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (unlocked) return;
    const value = normalizeDigits(input.value.trim());
    if (!value || !(await isCorrect(value))) { showWrong(); return; }
    unlock();
  });

  /* ----------------------------------------------------------
     3. الانتقال للصفحة الثانية
     ---------------------------------------------------------- */
  function unlock() {
    unlocked = true;
    btn.disabled = true;
    input.blur();
    input.value = '';

    scene.hidden = false;
    sky.start();
    requestAnimationFrame(() => {
      scene.classList.add('on');
      gate.classList.add('leaving');
    });
    setTimeout(() => { gate.hidden = true; $('#floaters').replaceChildren(); }, reduced() ? 50 : 1500);
    story();
  }

  function onceAnimationEnd(el, name, fallbackMs) {
    return new Promise((resolve) => {
      let done = false;
      const finish = () => { if (!done) { done = true; el.removeEventListener('animationend', h); resolve(); } };
      const h = (e) => { if (e.target === el && e.animationName === name) finish(); };
      el.addEventListener('animationend', h);
      setTimeout(finish, fallbackMs);
    });
  }

  function updateHint() {
    const overflow = scroller.scrollHeight - scroller.clientHeight > 12;
    const atEnd = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 12;
    hint.classList.toggle('show', overflow && !atEnd);
  }
  scroller.addEventListener('scroll', updateHint, { passive: true });
  window.addEventListener('resize', updateHint);

  async function story() {
    if (reduced()) {
      card.classList.add('instant');
      sky.formHeart(true);
      closing.classList.add('show');
      updateHint();
      return;
    }
    await wait(1700);                         // التحية تظهر أولًا
    card.classList.add('rise');               // الرسالة تطلع من تحت لنص الشاشة
    await onceAnimationEnd(card, 'rise', 3800);
    card.classList.remove('rise');
    card.classList.add('settled');
    updateHint();
    await wait(450);
    sky.formHeart(false);                     // قلب النجوم
    await wait(3000);
    closing.classList.add('show');            // السطر الختامي
  }

  /* ----------------------------------------------------------
     4. الكانفاس: نجوم متلألئة + قلب من النجوم + شرارات
     ---------------------------------------------------------- */
  const sky = (() => {
    const canvas = $('#sky');
    const ctx = canvas.getContext('2d');

    let W = 0, H = 0, dpr = 1, cx = 0, cy = 0, S = 1;
    let running = false, raf = 0, last = 0;
    let formStart = null, instantHeart = false;

    // ألوان: وردي فاتح، وردي، ذهبي وردي، أبيض
    const PALETTE = ['#F8C8DC', '#E88BAE', '#F2B8A2', '#FFFFFF', '#FFD9C7', '#F6A9C6'];

    function makeGlowSprite(color) {
      const c = document.createElement('canvas');
      c.width = c.height = 64;
      const g = c.getContext('2d');
      const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.14, color);
      grad.addColorStop(0.45, color + '55');
      grad.addColorStop(1, color + '00');
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
      return c;
    }
    const glow = PALETTE.map(makeGlowSprite);

    // شرارة بأربع أطراف
    const sparkle = (() => {
      const c = document.createElement('canvas');
      c.width = c.height = 96;
      const g = c.getContext('2d');
      const grad = g.createRadialGradient(48, 48, 0, 48, 48, 48);
      grad.addColorStop(0, 'rgba(255,255,255,.55)');
      grad.addColorStop(1, 'rgba(248,200,220,0)');
      g.fillStyle = grad; g.fillRect(0, 0, 96, 96);
      g.fillStyle = '#fff';
      g.shadowColor = '#F8C8DC'; g.shadowBlur = 8;
      g.beginPath();
      g.moveTo(48, 4);  g.quadraticCurveTo(52, 44, 92, 48);
      g.quadraticCurveTo(52, 52, 48, 92); g.quadraticCurveTo(44, 52, 4, 48);
      g.quadraticCurveTo(44, 44, 48, 4);
      g.fill();
      return c;
    })();

    /* --- هندسة القلب --- */
    const heartXY = (t) => ({
      x: 16 * Math.pow(Math.sin(t), 3),
      y: 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
    });

    // نقاط موزعة بالتساوي على محيط القلب (حسب طول القوس)
    const curve = (() => {
      const N = 1600, pts = [], cum = [0];
      let ymin = Infinity, ymax = -Infinity;
      for (let i = 0; i <= N; i++) {
        const p = heartXY((i / N) * Math.PI * 2);
        pts.push(p);
        ymin = Math.min(ymin, p.y); ymax = Math.max(ymax, p.y);
        if (i) cum.push(cum[i - 1] + Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y));
      }
      return { pts, cum, total: cum[N], ymid: (ymin + ymax) / 2, h: (ymax - ymin) / 16 };
    })();

    function pointOnCurve(f) { // f بين 0 و 1
      const target = f * curve.total;
      let lo = 0, hi = curve.cum.length - 1;
      while (lo < hi) { const m = (lo + hi) >> 1; if (curve.cum[m] < target) lo = m + 1; else hi = m; }
      return curve.pts[lo];
    }

    /* --- الجسيمات --- */
    let stars = [];      // نجوم القلب
    let outline = [];    // مؤشرات نجوم المحيط (لتوليد الشرارات)
    let dust = [];       // غبار نجمي في الخلفية
    let sparks = [];     // شرارات حيّة
    let nextSpark = 0;

    function build() {
      const small = window.innerWidth < 700;
      const k = small ? 0.62 : 1;
      stars = []; outline = [];

      const addLayer = (count, layerScale, jitter, sizeR, alphaR, isOutline) => {
        for (let i = 0; i < count; i++) {
          const p = pointOnCurve((i + Math.random() * 0.8) / count);
          const j = () => (Math.random() - 0.5) * 2 * jitter;
          const star = {
            ux: (p.x / 16) * layerScale + j(),
            uy: ((p.y - curve.ymid) / 16) * layerScale + j(),
            size: rand(sizeR[0], sizeR[1]),
            color: (Math.random() * glow.length) | 0,
            base: rand(alphaR[0], alphaR[1]),
            phase: rand(0, Math.PI * 2),
            speed: rand(1.2, 3.4),
            delay: rand(0, 1.9),
            dur: rand(1.7, 2.6),
            fx: Math.random(), fy: Math.random(),   // مكان البداية (نسبة من الشاشة)
            curve: rand(-90, 90),
            x: 0, y: 0, tx: 0, ty: 0
          };
          stars.push(star);
          if (isOutline) outline.push(star);
        }
      };
      //             العدد            مقياس  تشتت  حجم        شفافية
      addLayer(Math.round(340 * k), 1.00, 0.005, [2.6, 5.0], [0.8, 1.0], true);   // المحيط
      addLayer(Math.round(180 * k), 0.91, 0.016, [2.0, 4.0], [0.6, 1.0], false);
      addLayer(Math.round(130 * k), 0.82, 0.024, [1.8, 3.6], [0.5, 0.95], false);
      addLayer(Math.round(110 * k), 0.70, 0.034, [1.5, 3.0], [0.4, 0.85], false);
      addLayer(Math.round(130 * k), 1.09, 0.045, [1.2, 2.8], [0.35, 0.8], false); // هالة خارجية

      const nd = small ? 36 : 70;
      dust = Array.from({ length: nd }, () => ({
        x: Math.random(), y: Math.random(),
        r: rand(0.8, 2.3), a: rand(0.25, 0.75),
        v: rand(0.004, 0.014), sw: rand(0.002, 0.008),
        ph: rand(0, 6.28), sp: rand(0.6, 2.2),
        color: (Math.random() * glow.length) | 0
      }));
      layout();
    }

    function layout() {
      const small = window.innerWidth < 700;
      dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // القلب يملأ الشاشة ويحيط بالرسالة
      // العرض الكلي للقلب = 2 × S ، والارتفاع = curve.h × S
      S = Math.min((W * 0.99) / 2, (H * 0.95) / curve.h);
      cx = W / 2;
      cy = H / 2 + H * 0.01;
      for (const s of stars) { s.tx = cx + s.ux * S; s.ty = cy - s.uy * S; }
      if (!running || reduced()) drawFrame(performance.now() / 1000);
    }

    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    function drawFrame(t) {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      const still = reduced();

      // غبار النجوم
      for (const d of dust) {
        const x = (d.x + Math.sin(t * d.sp + d.ph) * d.sw) * W;
        const y = (((d.y - t * d.v) % 1) + 1) % 1 * H;
        const a = d.a * (still ? 0.7 : 0.45 + 0.55 * Math.sin(t * d.sp * 2 + d.ph));
        if (a <= 0.02) continue;
        const r = d.r * 3.2;
        ctx.globalAlpha = a;
        ctx.drawImage(glow[d.color], x - r, y - r, r * 2, r * 2);
      }

      // قلب النجوم
      if (formStart !== null) {
        const el = instantHeart ? 99 : t - formStart;
        const beat = still ? 1 : 1 + 0.012 * Math.pow(Math.max(0, Math.sin(t * 2.6)), 6);
        for (const s of stars) {
          let p = clamp((el - s.delay) / s.dur, 0, 1);
          if (p <= 0) continue;
          const e = easeOut(p);
          let x, y, a;
          if (p < 1) {
            const arc = Math.sin(Math.PI * p) * s.curve;
            x = s.fx * W + (s.tx - s.fx * W) * e + arc;
            y = s.fy * H + (s.ty - s.fy * H) * e - arc * 0.6;
            a = s.base * Math.min(1, p * 2.4);
          } else {
            const tw = still ? 1 : 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
            const sh = still ? 0 : 1.4;
            x = cx + (s.tx - cx) * beat + Math.sin(t * 0.9 + s.phase) * sh;
            y = cy + (s.ty - cy) * beat + Math.cos(t * 0.8 + s.phase) * sh;
            a = s.base * (0.35 + 0.65 * tw);
          }
          const r = s.size * 2.7;
          ctx.globalAlpha = a;
          ctx.drawImage(glow[s.color], x - r, y - r, r * 2, r * 2);
        }

        // شرارات
        if (!still && el > 3.2) {
          if (t > nextSpark && sparks.length < 22) {
            const o = outline[(Math.random() * outline.length) | 0];
            sparks.push({ x: o.tx + rand(-8, 8), y: o.ty + rand(-8, 8), t0: t, life: rand(1.1, 1.9), size: rand(10, 24), rot: rand(-0.5, 0.5) });
            nextSpark = t + rand(0.08, 0.2);
          }
          sparks = sparks.filter((sp) => t - sp.t0 < sp.life);
          for (const sp of sparks) {
            const f = (t - sp.t0) / sp.life;
            const k = Math.sin(Math.PI * f);
            const r = sp.size * k;
            ctx.save();
            ctx.globalAlpha = 0.9 * k;
            ctx.translate(sp.x, sp.y - f * 14);
            ctx.rotate(sp.rot + f * 0.6);
            ctx.drawImage(sparkle, -r, -r, r * 2, r * 2);
            ctx.restore();
          }
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    function loop(now) {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      if (now - last < 15) return; // سقف تقريبي ~60fps
      last = now;
      drawFrame(now / 1000);
    }

    function start() {
      if (!stars.length) build();
      if (reduced()) { drawFrame(performance.now() / 1000); return; }
      if (running) return;
      running = true; last = 0;
      raf = requestAnimationFrame(loop);
    }

    function formHeart(instant) {
      instantHeart = !!instant;
      formStart = performance.now() / 1000;
      if (reduced() || instant) drawFrame(formStart);
    }

    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => { if (stars.length) layout(); }, 120);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { running = false; cancelAnimationFrame(raf); }
      else if (!scene.hidden && !reduced()) { running = false; start(); }
    });

    return { start, formHeart };
  })();

  /* ----------------------------------------------------------
     5. زر الموسيقى (اختياري، بدون تشغيل تلقائي)
        الزر مخفي، ويظهر لوحده لو ملف music.mp3 موجود جنب index.html
     ---------------------------------------------------------- */
  const audio = $('#bgm');
  const musicBtn = $('#music');
  const showMusic = () => { musicBtn.hidden = false; };
  audio.addEventListener('loadedmetadata', showMusic);
  audio.addEventListener('canplay', showMusic);
  audio.volume = 0.7;

  musicBtn.addEventListener('click', async () => {
    if (audio.paused) {
      try {
        await audio.play();
        musicBtn.setAttribute('aria-pressed', 'true');
        musicBtn.setAttribute('aria-label', 'إيقاف الموسيقى');
      } catch (_) { /* المتصفح رفض التشغيل */ }
    } else {
      audio.pause();
      musicBtn.setAttribute('aria-pressed', 'false');
      musicBtn.setAttribute('aria-label', 'تشغيل الموسيقى');
    }
  });

})();
