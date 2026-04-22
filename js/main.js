// ─── SCROLL PROGRESS BAR + GO-TO-TOP ───
(function () {
  const bar = document.getElementById('scroll-progress');
  const goTop = document.getElementById('go-top');
  const SHOW_THRESHOLD = 400;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const doc = document.documentElement;
    const total = doc.scrollHeight - doc.clientHeight;

    if (bar) {
      const pct = total > 0 ? (y / total) * 100 : 0;
      bar.style.width = pct.toFixed(1) + '%';
      bar.setAttribute('aria-valuenow', Math.round(pct));
    }

    if (goTop) {
      goTop.classList.toggle('visible', y >= SHOW_THRESHOLD);
    }
  }, { passive: true });

  if (goTop) {
    goTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();

// ─── ROUTER (Multi-page version) ───
function go(id) {
  const pageMap = {
    'home': 'index.html',
    'services': 'services.html',
    'fca': 'fca.html',
    'capital': 'capital.html',
    'risk': 'risk.html',
    'industries': 'industries.html',
    'technology': 'technology.html',
    'casestudies': 'casestudies.html',
    'about': 'about.html',
    'contact': 'contact.html'
  };
  
  if (pageMap[id]) {
    window.location.href = pageMap[id];
  }
  return false;
}

// ─── PAGE-HERO PARALLAX ───
const PARALLAX_STRENGTH = 0.30;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let parallaxRaf = null;
let lastScrollY = -1;

function tickParallax() {
  const y = window.scrollY;

  if (y !== lastScrollY) {
    lastScrollY = y;

    const hero = document.querySelector('.page-hero');
    if (hero) {
      const bg = hero.querySelector('.page-hero-bg');
      if (bg) {
        const rect = hero.getBoundingClientRect();
        if (rect.bottom > -100 && rect.top < window.innerHeight + 100) {
          const heroTop = rect.top + y;
          const shift = (y - heroTop) * PARALLAX_STRENGTH;
          const clamped = Math.max(-110, Math.min(60, shift));
          bg.style.transform = `translateY(${clamped}px)`;
        }
      }
    }

    document.querySelectorAll('.tech-section').forEach(section => {
      const bg = section.querySelector('.tech-section-bg');
      if (!bg) return;

      const rect = section.getBoundingClientRect();
      if (rect.bottom > -100 && rect.top < window.innerHeight + 100) {
        const sectionMidpoint = rect.top + rect.height / 2;
        const viewportMid = window.innerHeight / 2;
        const offset = (sectionMidpoint - viewportMid) * PARALLAX_STRENGTH;
        const clamped = Math.max(-90, Math.min(90, offset));
        bg.style.transform = `translateY(${clamped}px)`;
      }
    });
  }

  parallaxRaf = requestAnimationFrame(tickParallax);
}

function startParallax() {
  if (reducedMotion) return;
  if (parallaxRaf) return;
  lastScrollY = -1;
  parallaxRaf = requestAnimationFrame(tickParallax);
}

function stopParallax() {
  if (parallaxRaf) {
    cancelAnimationFrame(parallaxRaf);
    parallaxRaf = null;
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) { stopParallax(); }
  else { startParallax(); }
});

window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (nav) {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  }
}, { passive: true });

// ─── HAMBURGER ───
const hbg = document.getElementById('hbg');
const mobMenu = document.getElementById('mobMenu');
if (hbg && mobMenu) {
  hbg.addEventListener('click', () => {
    mobMenu.classList.toggle('open');
  });
}

function closeMob() {
  if (mobMenu) {
    mobMenu.classList.remove('open');
  }
}

// ─── SCROLL REVEAL ───
const REVEAL_SELECTOR = [
  '.sr', '.sr-up', '.sr-down', '.sr-left', '.sr-right', '.sr-scale', '.sr-fade',
  '.sr-3d-up', '.sr-3d-left', '.sr-3d-right', '.sr-3d-flip', '.sr-3d-scale', '.sr-3d-depth'
].join(', ');

let obs;
function initReveal() {
  if (obs) obs.disconnect();
  obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -48px 0px' });

  document.querySelectorAll(REVEAL_SELECTOR).forEach(el => {
    el.classList.remove('in');
    obs.observe(el);
  });

  setTimeout(init3DTilt, 80);
}

// ─── COUNTER ANIMATION ENGINE ───
const COUNTER_DURATION = 2000;
const COUNTER_EASE = t => 1 - Math.pow(1 - t, 3);

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    runCounter(entry.target);
    counterObserver.unobserve(entry.target);
  });
}, { threshold: 0.35 });

function formatNumber(n, useComma) {
  if (useComma) return Math.round(n).toLocaleString('en-CA');
  return Number.isInteger(n) ? String(Math.round(n)) : n.toFixed(1);
}

function runCounter(el) {
  const target = parseFloat(el.dataset.count);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const useComma = el.dataset.format === 'comma';

  if (isNaN(target)) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = prefix + formatNumber(target, useComma) + suffix;
    return;
  }

  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / COUNTER_DURATION, 1);
    const eased = COUNTER_EASE(progress);
    const current = eased * target;

    el.textContent = prefix + formatNumber(current, useComma) + suffix;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = prefix + formatNumber(target, useComma) + suffix;
    }
  }

  requestAnimationFrame(step);
}

function initCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const target = parseFloat(el.dataset.count);
    const useComma = el.dataset.format === 'comma';
    if (!isNaN(target)) {
      el.textContent = prefix + formatNumber(0, useComma) + suffix;
    }
    counterObserver.unobserve(el);
    counterObserver.observe(el);
  });
}

function runHeroCounters() {
  const statsInner = document.querySelector('.hero-stats-inner');
  if (!statsInner) return;

  statsInner.querySelectorAll('[data-count]').forEach((el, i) => {
    setTimeout(() => runCounter(el), 600 + i * 120);
  });
}

// ─── 3D CARD TILT SYSTEM ───
function init3DTilt() {
  const cards = document.querySelectorAll('.svc-card, .tcard, .sec-card, .cs-card, .diff-card');
  
  cards.forEach(card => {
    if (card.parentElement.classList.contains('card-3d-wrap')) return;
    
    const wrap = document.createElement('div');
    wrap.className = 'card-3d-wrap';
    card.parentNode.insertBefore(wrap, card);
    wrap.appendChild(card);

    wrap.addEventListener('mousemove', (e) => {
      const rect = wrap.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(12px)`;
    });

    wrap.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    });
  });
}

// ─── HERO 3D PARALLAX ENGINE ───
function initHeroParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const hero = document.getElementById('hero');
  if (!hero) return;
  
  const videoWrap = document.getElementById('heroVideoWrap') || hero.querySelector('.hero-video-wrap');
  const overlay = document.getElementById('heroOverlay') || hero.querySelector('.hero-overlay');
  const heroContent = hero.querySelector('.hero-content');
  const statsBand = hero.querySelector('.hero-stats-band');

  if (!videoWrap) return;

  spawnParticles();
}

function spawnParticles() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  const particleContainer = document.createElement('div');
  particleContainer.className = 'hero-particles';
  particleContainer.style.cssText = `
    position: absolute;
    inset: 0;
    z-index: 5;
    overflow: hidden;
    pointer-events: none;
  `;
  hero.appendChild(particleContainer);

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    const size = 2 + Math.random() * 3;
    const left = Math.random() * 100;
    const delay = Math.random() * -20;
    const duration = 15 + Math.random() * 15;

    particle.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: rgba(255, 255, 255, ${0.15 + Math.random() * 0.25});
      border-radius: 50%;
      left: ${left}%;
      bottom: -20px;
      animation: floatUp ${duration}s linear ${delay}s infinite;
    `;

    particleContainer.appendChild(particle);
  }

  const style = document.createElement('style');
  style.textContent = `
    @keyframes floatUp {
      0% { transform: translateY(0) translateX(0); opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { transform: translateY(-120vh) translateX(${Math.random() * 100 - 50}px); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

// ─── SERVICE ACCORDION ───
function toggleAcc(header) {
  const item = header.parentElement;
  const isOpen = item.classList.contains('open');
  
  document.querySelectorAll('.svc-acc-item').forEach(i => {
    i.classList.remove('open');
  });
  
  if (!isOpen) {
    item.classList.add('open');
  }
}

function filterServices(category, btn) {
  document.querySelectorAll('.svc-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  document.querySelectorAll('.svc-acc-item').forEach(item => {
    if (category === 'all' || item.dataset.category === category) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

// ─── INITIALIZE ON LOAD ───
window.addEventListener('load', () => {
  const hc = document.querySelector('.hero-content');
  const hb = document.querySelector('.hero-stats-band');

  if (hc) {
    hc.style.cssText = 'opacity:0;transform:translateY(28px)';
    setTimeout(() => {
      hc.style.cssText = 'transition:opacity .9s ease,transform .9s ease;opacity:1;transform:none';
    }, 80);
  }
  if (hb) {
    hb.style.cssText = 'opacity:0;transform:translateY(16px)';
    setTimeout(() => {
      hb.style.cssText = 'transition:opacity .9s ease .3s,transform .9s ease .3s;opacity:1;transform:none';
    }, 80);
  }

  const vid = document.getElementById('heroVideo');
  if (vid) {
    vid.muted = true;
    const playPromise = vid.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { vid.pause(); } 
      else { vid.play().catch(() => {}); }
    });
  }

  initReveal();
  startParallax();
  
  const isHomePage = document.getElementById('hero');
  if (isHomePage) {
    runHeroCounters();
    initHeroParallax();
  }
  
  initCounters();
  init3DTilt();
});
