(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var preStart = Date.now();
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function prefersDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  var theme = lsGet('rz-theme') || (prefersDark() ? 'dark' : 'light');
  root.setAttribute('data-theme', theme);
  root.setAttribute('dir', lsGet('rz-dir') || 'ltr');

  function syncDirLabel() {
    $$('.dir-label').forEach(function (label) {
      label.textContent = root.getAttribute('dir') === 'rtl' ? 'RTL' : 'LTR';
    });
  }
  syncDirLabel();

  window.addEventListener('load', function () {
    $$('a[aria-label="Facebook"]').forEach(function (a) { a.href = 'https://facebook.com'; a.target = '_blank'; a.rel = 'noopener'; });
    $$('a[aria-label="Instagram"]').forEach(function (a) { a.href = 'https://instagram.com'; a.target = '_blank'; a.rel = 'noopener'; });
    $$('a[aria-label="X"]').forEach(function (a) { a.href = 'https://x.com'; a.target = '_blank'; a.rel = 'noopener'; });
    $$('a[aria-label="WhatsApp"]').forEach(function (a) { a.href = 'https://wa.me/919876543210'; a.target = '_blank'; a.rel = 'noopener'; });

    var pre = $('#preloader');
    if (pre) {
      var seen = lsGet('rz-visited');
      if (!seen) lsSet('rz-visited', '1');
      var minShow = seen ? 100 : 970;
      var wait = Math.max(0, minShow - (Date.now() - preStart));
      setTimeout(function () {
        pre.classList.add('done');
        setTimeout(function () { if (pre && pre.parentNode) pre.parentNode.removeChild(pre); }, 700);
      }, wait);
    }
    revealInit();
  });

  var lastClick = Date.now();

  function goTo(url) {
    window.location.href = url;
  }

  doc.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    if (Date.now() - lastClick < 320) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || a.target === '_blank' || a.hasAttribute('download') || a.classList.contains('no-transition')) return;
    if (/^[a-z]+:/i.test(href) && !href.toLowerCase().startsWith('http')) return;
    if (href.toLowerCase().indexOf('http') === 0) return;
    e.preventDefault();
    lastClick = Date.now();
    goTo(href);
  });

  var header = $('#siteHeader');
  var backTop = $('#backTop');

  function onScroll() {
    var y = window.pageYOffset || doc.documentElement.scrollTop;
    if (header) header.classList.toggle('scrolled', y > 8);
    if (backTop) backTop.classList.toggle('show', y > 480);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backTop) {
    backTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  var themeToggle = $('#themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      lsSet('rz-theme', next);
    });
  }

  var dirToggle = $('#dirToggle');
  if (dirToggle) {
    dirToggle.addEventListener('click', function () {
      var next = root.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl';
      root.setAttribute('dir', next);
      lsSet('rz-dir', next);
      syncDirLabel();
    });
  }

  var navToggle = $('#navToggle');
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      var open = doc.body.classList.toggle('nav-open');
      this.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }



  $$('.main-nav a').forEach(function (a) {
    a.addEventListener('click', function () {
      if (doc.body.classList.contains('nav-open')) doc.body.classList.remove('nav-open');
    });
  });

  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && doc.body.classList.contains('nav-open')) {
      doc.body.classList.remove('nav-open');
    }
  });

  // Click outside to close menu
  doc.addEventListener('click', function (e) {
    if (doc.body.classList.contains('nav-open')) {
      if (!e.target.closest('#mainNav') && !e.target.closest('#navToggle')) {
        doc.body.classList.remove('nav-open');
        if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
      }
    }
  });

  var heroSliders = $$('.hero-slider');
  heroSliders.forEach(function (slider) {
    var slides = $$('.slide', slider);
    var dots = $$('.slider-dots button', slider);
    var prev = $('.slider-arrow.prev', slider);
    var next = $('.slider-arrow.next', slider);
    var count = $('.slider-count b', slider);
    var idx = 0;
    var timer = null;

    function updateCount() {
      if (count) count.textContent = String(idx + 1).padStart(2, '0');
    }

    function go(i) {
      idx = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.classList.toggle('is-active', n === idx); });
      dots.forEach(function (d, n) { d.classList.toggle('is-active', n === idx); });
      updateCount();
    }

    function nextSlide() { go(idx + 1); }
    function prevSlide() { go(idx - 1); }

    function start() { stop(); timer = setInterval(nextSlide, 6500); }
    function stop() { if (timer) clearInterval(timer); }

    if (next) next.addEventListener('click', function () { nextSlide(); start(); });
    if (prev) prev.addEventListener('click', function () { prevSlide(); start(); });
    dots.forEach(function (d, n) {
      d.addEventListener('click', function () { go(n); start(); });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);

    if (slides.length > 1) {
      start();
      slides.forEach(function (s, n) {
        var t = s.querySelector('.slide-bg');
        if (t) { t.style.animation = 'none'; void t.offsetWidth; t.style.animation = ''; }
      });
    }
  });

  function revealInit() {
    var els = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  var counters = $$('[data-count]');
  if (counters.length) {
    function animateCounter(el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      var duration = 2000;
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = Math.floor(eased * target);
        el.textContent = val.toLocaleString('en-IN') + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString('en-IN') + suffix;
      }
      requestAnimationFrame(step);
    }
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            cio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cio.observe(el); });
    } else {
      counters.forEach(animateCounter);
    }
  }

  var tSliders = $$('[data-t-slider]');
  tSliders.forEach(function (slider) {
    var track = $('.t-track', slider);
    var cards = $$('.t-card', slider);
    if (!track || !cards.length) return;
    var dotsWrap = $('.t-dots', slider);
    var prev = $('.t-prev', slider);
    var next = $('.t-next', slider);
    var idx = 0;

    function perView() {
      var w = window.innerWidth;
      if (w < 768) return 1;
      if (w < 1200) return 2;
      return 3;
    }

    var pv = perView();
    var max = Math.max(cards.length - pv, 0);

    function renderDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      for (var i = 0; i <= max; i++) {
        var b = doc.createElement('button');
        b.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
        if (i === 0) b.classList.add('is-active');
        b.addEventListener('click', (function (n) {
          return function () { idx = n; update(); };
        })(i));
        dotsWrap.appendChild(b);
      }
    }

    function update() {
      var currentPv = perView();
      cards.forEach(function (card) {
        card.style.flex = '0 0 ' + (100 / currentPv) + '%';
        card.style.maxWidth = (100 / currentPv) + '%';
      });
      max = Math.max(cards.length - currentPv, 0);
      if (idx > max) idx = max;
      if (idx < 0) idx = 0;
      track.style.transform = 'translateX(-' + (idx * 100 / currentPv) + '%)';
      if (dotsWrap) {
        var dotButtons = $$('button', dotsWrap);
        if (dotButtons.length !== (max + 1)) {
          renderDots();
        }
        $$('button', dotsWrap).forEach(function (d, n) { d.classList.toggle('is-active', n === idx); });
      }
    }

    if (prev) prev.addEventListener('click', function () { idx = Math.max(idx - 1, 0); update(); });
    if (next) next.addEventListener('click', function () { idx = Math.min(idx + 1, max); update(); });

    var touchX = 0;
    track.addEventListener('touchstart', function (e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - touchX;
      if (dx > 46) { idx = Math.max(idx - 1, 0); update(); }
      else if (dx < -46) { idx = Math.min(idx + 1, max); update(); }
    }, { passive: true });

    var raf = null;
    window.addEventListener('resize', function () {
      clearTimeout(raf);
      raf = setTimeout(function () { update(); }, 200);
    });

    renderDots();
    update();
  });

  $$('.faq-item').forEach(function (item) {
    var q = $('.faq-q', item);
    if (!q) return;
    var a = $('.faq-a', item);
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');
      $$('.faq-item.is-open').forEach(function (other) {
        if (other !== item) {
          other.classList.remove('is-open');
          $('.faq-a', other).style.maxHeight = null;
        }
      });
      item.classList.toggle('is-open', !isOpen);
      if (!isOpen && a) a.style.maxHeight = a.scrollHeight + 'px';
      else if (a) a.style.maxHeight = null;
    });
  });

  $$('.tabs').forEach(function (tabs) {
    var btns = $$('.tab-btn', tabs);
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-tab');
        btns.forEach(function (b) { b.classList.toggle('is-active', b === btn); });
        $$('[data-tab-panel]', tabs).forEach(function (panel) {
          panel.classList.toggle('is-active', panel.getAttribute('data-tab-panel') === target);
        });
      });
    });
  });

  function bindRechargeTabs(rootEl) {
    if (!rootEl) return;
    $$('.rz-tab', rootEl).forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-rz');
        $$('.rz-tab', rootEl).forEach(function (t) { t.classList.toggle('is-active', t === tab); });
        $$('.rz-panel', rootEl).forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-rz') === target); });
      });
    });
  }

  $$('[data-recharge]').forEach(function (wrap) {
    bindRechargeTabs(wrap);

    $$('.amount-chip', wrap).forEach(function (chip) {
      chip.addEventListener('click', function () {
        $$('.amount-chip', wrap).forEach(function (c) { c.classList.remove('is-active'); });
        chip.classList.add('is-active');
        var amount = $('.rz-amount', wrap);
        if (amount) amount.value = chip.getAttribute('data-value');
      });
    });

    var form = $('.rz-form', wrap);
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var number = $('.rz-number', wrap).value.trim();
        var operator = $('.op-radio input:checked', wrap);
        var amount = $('.rz-amount', wrap).value.trim();
        var service = $('.rz-tab.is-active', wrap).getAttribute('data-label') || 'Service';

        if (!number) return showFormMsg(form, 'Please enter a valid number.', false);
        if (!operator) return showFormMsg(form, 'Please select an operator / provider.', false);
        if (!amount || isNaN(Number(amount)) || Number(amount) < 10) return showFormMsg(form, 'Please enter a valid amount (min ' + String.fromCharCode(8377) + '10).', false);

        var operatorName = operator.getAttribute('data-name') || 'Operator';
        var operatorLogo = operator.getAttribute('data-logo') || 'OP';
        var logoGrad = operator.getAttribute('data-grad') || 'linear-gradient(135deg,#0E7C7E,#0B3B43)';
        var txn = 'RZ' + Date.now().toString(36).toUpperCase().slice(-8);

        $('.m-operator-logo', wrap).textContent = operatorLogo;
        $('.m-operator-logo', wrap).style.background = logoGrad;
        $('.m-service', wrap).textContent = service;
        $('.m-number', wrap).textContent = number;
        $('.m-operator', wrap).textContent = operatorName;
        $('.m-amount', wrap).textContent = String.fromCharCode(8377) + Number(amount).toLocaleString('en-IN');
        $('.m-txn', wrap).textContent = txn;
        $('.modal-overlay', wrap).classList.add('show');
      });
    }

    var closeModal = function () { $('.modal-overlay', wrap).classList.remove('show'); };
    var overlay = $('.modal-overlay', wrap);
    if (overlay) {
      $$('.modal-close, .modal-done', overlay).forEach(function (b) { b.addEventListener('click', closeModal); });
      overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
    }
  });

  function showFormMsg(form, msg, ok) {
    var box = form.querySelector('.form-alert');
    if (!box) return;
    box.textContent = msg;
    box.classList.remove('show');
    void box.offsetWidth;
    box.classList.add(ok ? 'form-ok' : 'form-err');
    box.classList.add('show');
    setTimeout(function () { box.classList.remove('show'); }, 4000);
  }

  $$('form[data-validate]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var inputs = $$('input[required], select[required], textarea[required]', form);
      var valid = true;
      inputs.forEach(function (inp) {
        if (!inp.value.trim()) valid = false;
        else if (inp.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim())) valid = false;
        else if (inp.type === 'tel' && inp.value.replace(/\D/g, '').length < 10) valid = false;
      });
      var ok = $('.success-msg', form);
      var err = $('.error-msg', form);
      if (!valid) {
        if (err) { err.classList.add('show'); setTimeout(function () { err.classList.remove('show'); }, 4500); }
        return;
      }
      if (ok) ok.classList.add('show');
      if (err) err.classList.remove('show');
      if (form.classList.contains('newsletter-form')) {
        $('input[type="email"]', form).value = '';
      }
      setTimeout(function () { if (ok) ok.classList.remove('show'); }, 6000);
    });
  });

  var cookieBar = $('#cookieBar');
  if (cookieBar && !lsGet('rz-cookie')) {
    setTimeout(function () { cookieBar.classList.add('show'); }, 2200);
    var accept = $('#cookieAccept');
    if (accept) {
      accept.addEventListener('click', function () {
        lsSet('rz-cookie', '1');
        cookieBar.classList.remove('show');
      });
    }
  }

  var yearEls = $$('[data-year]');
  yearEls.forEach(function (el) { el.textContent = new Date().getFullYear(); });

  var countdown = $('#countdown');
  if (countdown) {
    var endKey = 'rz-maint-end';
    var end = Number(lsGet(endKey));
    if (!end || end < Date.now()) {
      end = Date.now() + (2 * 24 * 60 * 60 * 1000) + (14 * 60 * 60 * 1000) + (32 * 60 * 1000);
      lsSet(endKey, String(end));
    }
    var dEl = $('#cd-days'), hEl = $('#cd-hours'), mEl = $('#cd-mins'), sEl = $('#cd-secs');
    function tick() {
      var diff = Math.max(end - Date.now(), 0);
      var d = Math.floor(diff / 86400000);
      var h = Math.floor(diff % 86400000 / 3600000);
      var m = Math.floor(diff % 3600000 / 60000);
      var s = Math.floor(diff % 60000 / 1000);
      if (dEl) dEl.textContent = String(d).padStart(2, '0');
      if (hEl) hEl.textContent = String(h).padStart(2, '0');
      if (mEl) mEl.textContent = String(m).padStart(2, '0');
      if (sEl) sEl.textContent = String(s).padStart(2, '0');
    }
    tick();
    setInterval(tick, 1000);
  }

  function storeStatus() {
    var now = new Date();
    var day = now.getDay();
    var mins = now.getHours() * 60 + now.getMinutes();
    var open = (day >= 1 && day <= 6 && mins >= 480 && mins < 1290) || (day === 0 && mins >= 600 && mins < 1080);
    $$('[data-store-status]').forEach(function (el) {
      var label = el.querySelector('span:last-child');
      if (label) label.textContent = open ? 'Open Now' : 'Currently Closed';
      el.classList.toggle('is-closed', !open);
    });
    var statusText = document.getElementById('status-text');
    var statusNote = document.getElementById('status-note');
    if (statusText) statusText.textContent = open ? 'Open Now — we are at the counter.' : 'Currently closed — see timings below.';
    if (statusNote) statusNote.textContent = open ? 'Come on in, no appointment needed.' : 'We open today at ' + (day === 0 ? '10:00 AM' : '8:00 AM') + '.';
  }
  storeStatus();
  setInterval(storeStatus, 30000);

  function dayStatus() {
    $$('.timing-day').forEach(function (row) {
      var key = row.getAttribute('data-day');
      var names = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      var now = new Date();
      var today = names[now.getDay()];
      if (key === today) row.classList.add('today');
      var chip = $('.timing-chip', row);
      if (chip) {
        var open = chip.classList.contains('open');
        if (key === today) {
          var mins = now.getHours() * 60 + now.getMinutes();
          var openRange = open;
          if (!openRange) chip.textContent = 'Open Soon';
        }
        if (key === today && !chip.textContent) chip.textContent = open ? 'Open Now' : 'Closed';
      }
    });
  }
  dayStatus();

  $$('.blog-filter').forEach(function (filter) {
    var btns = $$('.filter-btn', filter);
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var f = btn.getAttribute('data-filter');
        $$('[data-category]').forEach(function (item) {
          var show = f === '*' || item.getAttribute('data-category') === f;
          item.style.display = show ? '' : 'none';
        });
      });
    });
  });

  var tocLinks = $$('.toc-widget a[href^="#"]');
  tocLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href').slice(1);
      var target = doc.getElementById(id);
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - 120, behavior: 'smooth' });
      }
    });
  });
})();
