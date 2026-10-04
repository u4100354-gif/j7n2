/* =========================================================
   Ульяна — общий скрипт для всех страниц
   ========================================================= */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Год ──────────────────────────────────────────────── */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ── Активный пункт меню ──────────────────────────────── */
  var page = document.body.dataset.page;
  if (page) {
    document.querySelectorAll('[data-nav="' + page + '"]').forEach(function (a) {
      a.classList.add('is-active');
    });
  }

  /* ── Мобильное меню ──────────────────────────────────── */
  var burger = document.querySelector('.nav__burger');
  var mob = document.querySelector('.nav__mobile');
  if (burger && mob) {
    burger.addEventListener('click', function () {
      mob.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', mob.classList.contains('is-open'));
    });
    mob.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { mob.classList.remove('is-open'); });
    });
  }

  /* ── Появление блоков ────────────────────────────────── */
  var rev = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var p = e.target.parentNode, i = 0;
        if (p) {
          for (var k = 0; k < p.children.length; k++) if (p.children[k] === e.target) { i = k; break; }
        }
        e.target.style.transitionDelay = (Math.min(i, 6) * 85) + 'ms';
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    rev.forEach(function (el) { io.observe(el); });
  } else {
    rev.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ── Вступление заголовка ────────────────────────────── */
  var title = document.querySelector('.hero__title');
  if (title && !reduce) {
    title.style.opacity = '0';
    title.style.transform = 'translateY(38px) scale(.95)';
    title.style.transition = 'opacity 1.1s cubic-bezier(.28,.11,.32,1),transform 1.1s cubic-bezier(.28,.11,.32,1)';
    requestAnimationFrame(function () {
      setTimeout(function () { title.style.opacity = '1'; title.style.transform = 'none'; }, 110);
    });
  }

  /* ── Параллакс ───────────────────────────────────────── */
  var layers = [].slice.call(document.querySelectorAll('[data-parallax]'));
  var ticking = false;
  function parallax() {
    var vh = window.innerHeight;
    layers.forEach(function (el) {
      var s = parseFloat(el.getAttribute('data-parallax')) || 0.1;
      var r = el.getBoundingClientRect();
      var c = r.top + r.height / 2 - vh / 2;
      el.style.transform = 'translate3d(0,' + (-c * s).toFixed(2) + 'px,0)';
    });
    ticking = false;
  }

  /* ── Скролл: прогресс, параллакс, кнопка «наверх» ───── */
  var bar = document.querySelector('.progress');
  var totop = document.querySelector('.totop');
  function onScroll() {
    if (bar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ')';
    }
    if (totop) totop.classList.toggle('is-show', window.scrollY > 700);
    if (!reduce && !ticking) { ticking = true; requestAnimationFrame(parallax); }
  }
  if (totop) {
    totop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* ── Счётчики ────────────────────────────────────────── */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;
    var start = null, dur = 1500;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * e).toLocaleString('ru-RU');
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var nums = document.querySelectorAll('[data-count]');
  if (nums.length) {
    if (!('IntersectionObserver' in window) || reduce) {
      nums.forEach(function (n) { n.textContent = n.getAttribute('data-count'); });
    } else {
      var co = new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); co.unobserve(e.target); } });
      }, { threshold: 0.5 });
      nums.forEach(function (n) { co.observe(n); });
    }
  }

  /* ── Карусель ────────────────────────────────────────── */
  document.querySelectorAll('[data-carousel]').forEach(function (root) {
    var slides = [].slice.call(root.querySelectorAll('.slide'));
    var dots = [].slice.call(root.querySelectorAll('.dot'));
    if (!slides.length) return;
    var idx = 0, timer = null;
    function go(i) {
      idx = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.classList.toggle('is-active', n === idx); });
      dots.forEach(function (d, n) { d.classList.toggle('is-active', n === idx); });
    }
    function start() { if (!reduce) { stop(); timer = setInterval(function () { go(idx + 1); }, 6500); } }
    function stop() { if (timer) clearInterval(timer); }
    dots.forEach(function (d, n) { d.addEventListener('click', function () { go(n); start(); }); });
    var inner = root.querySelector('.carousel__inner');
    if (inner) {
      inner.addEventListener('mouseenter', stop);
      inner.addEventListener('mouseleave', start);
    }
    go(0); start();
  });

  /* ── 3D-наклон ───────────────────────────────────────── */
  if (!reduce && !window.matchMedia('(hover: none)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(900px) rotateX(' + (-py * 7).toFixed(2) +
          'deg) rotateY(' + (px * 7).toFixed(2) + 'deg) translateY(-6px)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
  }

  /* ── Лайтбокс галереи ────────────────────────────────── */
  var lb = document.getElementById('lightbox');
  if (lb) {
    var lbImg = lb.querySelector('img');
    var lbCap = lb.querySelector('.lightbox__cap');
    document.querySelectorAll('.shot').forEach(function (s) {
      s.addEventListener('click', function () {
        var im = s.querySelector('img');
        lbImg.src = im.getAttribute('src');
        lbImg.alt = im.getAttribute('alt') || '';
        lbCap.innerHTML = s.querySelector('.shot__cap').innerHTML;
        lb.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      });
    });
    function closeLb() {
      lb.classList.remove('is-open');
      document.body.style.overflow = '';
    }
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.classList.contains('lightbox__close')) closeLb();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lb.classList.contains('is-open')) closeLb();
    });
  }

  /* ── Плавные якоря ───────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id.length < 2 || id === '#') return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - 40;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();