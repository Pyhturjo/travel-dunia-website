/* ============================================================
   TRAVEL DUNIA — main.js  (v2 — fixed)
   ============================================================ */
(function () {
  'use strict';

  /* ── Smooth scroll ── */
  function smoothScrollTo(id) {
    var cleanId = id.startsWith('#') ? id.slice(1) : id;
    if (!cleanId) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    var target = document.getElementById(cleanId);
    if (!target) return;
    var hdr    = document.getElementById('siteHeader');
    var offset = hdr ? hdr.offsetHeight + 12 : 80;
    var top    = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }

  document.addEventListener('click', function (e) {
    var el = e.target;
    while (el && el.tagName !== 'A' && el !== document.body) el = el.parentElement;
    if (!el || el.tagName !== 'A') return;
    var href = el.getAttribute('href') || '';
    if (href.startsWith('#') && href.length > 1) {
      e.preventDefault();
      smoothScrollTo(href);
      var nav = document.getElementById('mainNav');
      if (nav && nav.classList.contains('open')) {
        nav.classList.remove('open');
        resetBurger();
      }
    }
  });

  /* ── Header sticky ── */
  function initHeader() {
    var hdr = document.getElementById('siteHeader');
    var stt = document.getElementById('stt');
    if (!hdr) return;
    function onScroll() {
      hdr.classList.toggle('scrolled', window.scrollY > 55);
      if (stt) stt.classList.toggle('show', window.scrollY > 450);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Burger menu ── */
  function resetBurger() {
    var b = document.getElementById('burger');
    if (!b) return;
    var sp = b.querySelectorAll('span');
    sp[0].style.transform = '';
    sp[1].style.opacity   = '';
    sp[2].style.transform = '';
  }

  function initBurger() {
    var burger = document.getElementById('burger');
    var nav    = document.getElementById('mainNav');
    if (!burger || !nav) return;
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      var sp   = burger.querySelectorAll('span');
      sp[0].style.transform = open ? 'rotate(45deg) translate(5px,5px)' : '';
      sp[1].style.opacity   = open ? '0' : '';
      sp[2].style.transform = open ? 'rotate(-45deg) translate(5px,-5px)' : '';
      burger.setAttribute('aria-expanded', open);
    });
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && !burger.contains(e.target)) {
        nav.classList.remove('open');
        resetBurger();
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── Hero slider ── */
  function initHero() {
    var wrapper = document.getElementById('heroSlides');
    if (!wrapper) return;
    var slides  = Array.from(wrapper.querySelectorAll('.hs'));
    var dots    = Array.from(document.querySelectorAll('.hd'));
    var current = 0;
    var timer   = null;

    function goTo(i) {
      if (dots[current]) dots[current].classList.remove('active');
      current = ((i % slides.length) + slides.length) % slides.length;
      if (dots[current]) dots[current].classList.add('active');
      wrapper.style.transform = 'translateX(-' + (current * 100) + '%)';
    }
    function startTimer() { timer = setInterval(function(){ goTo(current + 1); }, 5500); }
    function resetTimer() { clearInterval(timer); startTimer(); }

    goTo(0);
    startTimer();

    var prev = document.getElementById('hPrev');
    var next = document.getElementById('hNext');
    if (prev) prev.addEventListener('click', function(){ goTo(current - 1); resetTimer(); });
    if (next) next.addEventListener('click', function(){ goTo(current + 1); resetTimer(); });
    dots.forEach(function(d) {
      d.addEventListener('click', function(){ goTo(+d.dataset.i); resetTimer(); });
    });


    // Touch swipe
    var tx = 0;
    wrapper.addEventListener('touchstart', function(e){ tx = e.touches[0].clientX; }, { passive: true });
    wrapper.addEventListener('touchend', function(e){
      var diff = tx - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) { goTo(diff > 0 ? current + 1 : current - 1); resetTimer(); }
    });
  }

  /* ── Tour filters ── */
  function initFilters() {
    var chips    = Array.from(document.querySelectorAll('.fchip'));
    var cards    = Array.from(document.querySelectorAll('.tc[data-dest]'));
    var noResult = document.getElementById('noResults');
    if (!chips.length) return;

    function applyFilter(f) {
      var vis = 0;
      cards.forEach(function(card) {
        var show = f === 'all' || card.getAttribute('data-dest') === f;
        if (show) {
          card.classList.remove('is-hidden');
          vis++;
        } else {
          card.classList.add('is-hidden');
        }
      });
      if (noResult) noResult.classList.toggle('visible', vis === 0);
    }

    chips.forEach(function(chip) {
      chip.addEventListener('click', function() {
        chips.forEach(function(c){ c.classList.remove('active'); });
        chip.classList.add('active');
        applyFilter(chip.getAttribute('data-filter'));
      });
    });
  }

  /* ── Hero search ── */
  function initSearch() {
    var form = document.getElementById('searchForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var dest = form.dest ? form.dest.value : '';
      if (dest) {
        var chip = document.querySelector('.fchip[data-filter="' + dest + '"]');
        if (chip) {
          chip.click();
          showToast('🔍 Showing tours to ' + dest.replace(/-/g,' ').replace(/\b\w/g, function(c){ return c.toUpperCase(); }));
        } else {
          showToast('Browse our available tours below!');
        }
      } else {
        showToast('Browse our available tours below!');
      }
      smoothScrollTo('tours');
    });
  }

  /* ── Testimonials slider ── */
  function initTestimonials() {
    var track = document.getElementById('testiTrack');
    if (!track) return;
    var cards   = Array.from(track.querySelectorAll('.tcard'));
    var current = 0;

    function getVis() {
      return window.innerWidth < 600 ? 1 : window.innerWidth < 960 ? 2 : 3;
    }

    function update() {
      var vis   = getVis();
      var max   = Math.max(0, cards.length - vis);
      current   = Math.min(current, max);
      var pct   = 100 / vis;
      var gap   = 20; // px gap between cards
      cards.forEach(function(c) {
        c.style.flex = '0 0 calc(' + pct + '% - ' + (gap * (vis - 1) / vis) + 'px)';
      });
      // Use pixel offset calculation for reliability
      var cardEl    = cards[0];
      var cardWidth = cardEl ? (cardEl.getBoundingClientRect().width + gap) : 0;
      track.style.transform = 'translateX(-' + (current * cardWidth) + 'px)';
    }

    var tNext = document.getElementById('tNext');
    var tPrev = document.getElementById('tPrev');
    if (tNext) tNext.addEventListener('click', function() {
      if (current < cards.length - getVis()) { current++; update(); }
    });
    if (tPrev) tPrev.addEventListener('click', function() {
      if (current > 0) { current--; update(); }
    });

    update();
    var rt;
    window.addEventListener('resize', function() {
      clearTimeout(rt);
      rt = setTimeout(function(){ current = 0; update(); }, 120);
    });
  }

  /* ── Stat counters ── */
  function initCounters() {
    var els = document.querySelectorAll('.count[data-to]');
    if (!els.length) return;

    function animateCounter(target) {
      var end  = +target.dataset.to;
      var dur  = 1800;
      var step = end / (dur / 16);
      var val  = 0;
      function tick() {
        val = Math.min(val + step, end);
        target.textContent = Math.floor(val).toLocaleString() + '+';
        if (val < end) requestAnimationFrame(tick);
        else target.textContent = end.toLocaleString() + '+';
      }
      requestAnimationFrame(tick);
    }

    if ('IntersectionObserver' in window) {
      var ob = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            ob.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      els.forEach(function(el) { ob.observe(el); });
    } else {
      els.forEach(function(el) { animateCounter(el); });
    }
  }

  /* ── Scroll-reveal animations ── */
  function initAnimations() {
    var animEls = document.querySelectorAll('.anim');

    setTimeout(function() {
      animEls.forEach(function(el) { el.classList.add('in'); });
    }, 2000);

    if (!('IntersectionObserver' in window)) {
      // No IO support — show everything immediately
      animEls.forEach(function(el) { el.classList.add('in'); });
      return;
    }

    var ob = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          ob.unobserve(entry.target);
        }
      });
    }, { threshold: 0.04, rootMargin: '0px 0px -10px 0px' });

    animEls.forEach(function(el) {
      // If element is already in viewport on page load, show it immediately
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('in');
      } else {
        ob.observe(el);
      }
    });
  }

  /* ── Scroll to top ── */
  function initScrollTop() {
    var stt = document.getElementById('stt');
    if (stt) stt.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Contact form ── */
 function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();

      var name  = (form.elements['name']        ? form.elements['name'].value        : '').trim();
      var phone = (form.elements['phone']       ? form.elements['phone'].value       : '').trim();
      var email = (form.elements['email']       ? form.elements['email'].value       : '').trim();
      var dest  = (form.elements['destination'] ? form.elements['destination'].value : '').trim();
      var date  = (form.elements['date']        ? form.elements['date'].value        : '').trim();
      var msg   = (form.elements['message']     ? form.elements['message'].value     : '').trim();
      if (!name)  { showToast('⚠️ Please enter your full name.'); return; }
      if (!phone) { showToast('⚠️ Please enter your WhatsApp number.'); return; }

      var dateStr = '';
      if (date) {
        try {
          var d = new Date(date);
          dateStr = d.toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' });
        } catch(err) { dateStr = date; }
      }

      var lines = [];
      lines.push('Hello Travel Dunia! 👋');
      lines.push('I would like to inquire about a tour package.');
      lines.push('');
      lines.push('📋 *Booking Inquiry Details*');
      lines.push('━━━━━━━━━━━━━━━━━━━━');
      lines.push('👤 *Name:* ' + name);
      lines.push('📱 *My WhatsApp:* ' + phone);
      if (email)   lines.push('📧 *Email:* ' + email);
      if (dest)    lines.push('🌍 *Destination:* ' + dest);
      if (dateStr) lines.push('📅 *Travel Date:* ' + dateStr);
      if (msg)     lines.push('💬 *Message:* ' + msg);
      lines.push('━━━━━━━━━━━━━━━━━━━━');
      lines.push('Please get back to me with the best available packages. Thank you!');

      var waMessage = lines.join('\n');
      var waURL = 'https://wa.me/8801878072988?text=' + encodeURIComponent(waMessage);

      window.open(waURL, '_blank');
      showToast('✅ Opening WhatsApp with your details...');
      form.reset();
    });
  }

  /* ── FAQ accordion ── */
  function initFAQ() {
    document.querySelectorAll('.faq-item').forEach(function(item) {
      var q = item.querySelector('.faq-q');
      if (!q) return;
      q.addEventListener('click', function() {
        var isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(function(o){ o.classList.remove('open'); });
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  /* ── Toast ── */
  function showToast(msg) {
    var t = document.getElementById('toast');
    if (!t) return;
    clearTimeout(t._timer);
    t.textContent = msg;
    t.classList.add('show');
    t._timer = setTimeout(function(){ t.classList.remove('show'); }, 4000);
  }
  window.showToast = showToast;

  /* ── INIT ── */
  document.addEventListener('DOMContentLoaded', function() {
    initHeader();
    initBurger();
    initHero();
    initFilters();
    initSearch();
    initTestimonials();
    initCounters();
    initScrollTop();
    initContactForm();
    initFAQ();
    initAnimations();
  });

})();
/* ── Visa tabs ── */
/* ── Visa tabs ── */
document.querySelectorAll('.visa-tab').forEach(function(tab) {
  tab.addEventListener('click', function() {
    var country = tab.getAttribute('data-country');
    document.querySelectorAll('.visa-tab').forEach(function(t) { t.classList.remove('active'); });
    tab.classList.add('active');
    document.querySelectorAll('.visa-panel').forEach(function(p) { p.classList.remove('active'); });
    var panel = document.querySelector('.visa-panel[data-panel="' + country + '"]');
    if (panel) panel.classList.add('active');
  });
});

/* ── Visa type selector ── */
document.querySelectorAll('.vts-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var selector = btn.closest('.visa-type-selector');
    var country = selector.getAttribute('data-country');
    var type = btn.getAttribute('data-type');

    selector.querySelectorAll('.vts-btn').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');

    var panel = btn.closest('.visa-panel');
    panel.querySelectorAll('.vdocs').forEach(function(d) {
      d.style.display = d.getAttribute('data-for') === country + '-' + type ? '' : 'none';
    });
  });
});

/* ── Visa WhatsApp apply ── */
function applyVisaWA(country, btn) {
  var panel = btn.closest('.visa-panel');

  var activeBtn = panel.querySelector('.vts-btn.active');
  var visaType = activeBtn ? activeBtn.textContent.trim() : 'Tourist';

  var activeDoc = panel.querySelector('.vdocs:not([style*="none"])');
  var docItems = [];
  if (activeDoc) {
    activeDoc.querySelectorAll('li').forEach(function(li) {
      docItems.push('  • ' + li.textContent.trim());
    });
  }

  var lines = [
    'Hello Travel Dunia! 👋',
    'I would like to apply for a visa. Please assist me.',
    '',
    '🌍 *Visa Application Details*',
    '━━━━━━━━━━━━━━━━━━━━',
    '🏳️ *Country:* ' + country,
    '📋 *Visa Type:* ' + visaType,
    '',
    '📄 *Required documents I need to prepare:*',
  ].concat(docItems).concat([
    '',
    '━━━━━━━━━━━━━━━━━━━━',
    'Please confirm the current fee, processing time, and next steps. Thank you!'
  ]);

  var url = 'https://wa.me/8801878072988?text=' + encodeURIComponent(lines.join('\n'));
  window.open(url, '_blank');
}


/* ── Video sound toggle ── */
function toggleSound() {
  var video = document.getElementById('tdVideo');
  var btn = document.getElementById('soundBtn');
  video.muted = !video.muted;
  btn.textContent = video.muted ? '🔇' : '🔊';
}


/* ── Loading screen ── */
function hideLoader() {
  var loader = document.getElementById('loader');
  if (loader) loader.classList.add('hide');
}
setTimeout(hideLoader, 2500);
window.addEventListener('load', function() {
  setTimeout(hideLoader, 400);
});

/* ── WhatsApp popup ── */
function closeWaPopup() {
  document.getElementById('waPopup').classList.remove('show');
  sessionStorage.setItem('waPopupClosed', '1');
}
setTimeout(function() {
  if (!sessionStorage.getItem('waPopupClosed')) {
    var popup = document.getElementById('waPopup');
    if (popup) popup.classList.add('show');
  }
}, 30000); // 30 seconds