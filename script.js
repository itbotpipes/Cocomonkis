// --- Navigation Drawer ---
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
  siteNav.classList.toggle('open', !isOpen);
});

siteNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  siteNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open menu');
}));

// --- Animated Stats Counter ---
function initStatsCounter() {
  const statsSection = document.querySelector('#stats');
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statsSection || !statNumbers.length) return;

  let hasAnimated = false;

  function runCounterAnimation() {
    if (hasAnimated) return;
    hasAnimated = true;

    statNumbers.forEach(el => {
      const target = parseInt(el.getAttribute('data-target') || '0', 10);
      const suffix = el.getAttribute('data-suffix') || '';
      const isComma = el.getAttribute('data-format') === 'comma';
      const duration = 1800;
      let startTimestamp = null;

      function step(timestamp) {
        if (!startTimestamp) startTimestamp = timestamp;
        const elapsed = timestamp - startTimestamp;
        const progress = Math.min(elapsed / duration, 1);
        // Smooth easeOutCubic curve
        const ease = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.floor(ease * target);
        const formatted = isComma ? currentVal.toLocaleString('en-IN') : currentVal;
        el.textContent = `${formatted}${suffix}`;

        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          const finalFormatted = isComma ? target.toLocaleString('en-IN') : target;
          el.textContent = `${finalFormatted}${suffix}`;
        }
      }

      window.requestAnimationFrame(step);
    });
  }

  // 1. Modern IntersectionObserver with generous margins
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          runCounterAnimation();
          observer.unobserve(statsSection);
        }
      });
    }, {
      root: null,
      threshold: 0.01,
      rootMargin: '100px 0px'
    });
    observer.observe(statsSection);
  }

  // 2. Immediate & Scroll/Resize Fallback (Guaranteed trigger)
  function checkVisibility() {
    if (hasAnimated) return;
    const rect = statsSection.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < windowHeight && rect.bottom > 0) {
      runCounterAnimation();
      window.removeEventListener('scroll', checkVisibility);
      window.removeEventListener('resize', checkVisibility);
    }
  }

  window.addEventListener('scroll', checkVisibility, { passive: true });
  window.addEventListener('resize', checkVisibility, { passive: true });
  checkVisibility();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStatsCounter);
} else {
  initStatsCounter();
}

// --- Dynamic Copyright Year ---
const yearEl = document.querySelector('#year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// --- WhatsApp Enquiry Form ---
document.querySelector('#enquiry-form')?.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const lines = [
    'Hi CocoMonkis, I have an enquiry.',
    `Name: ${data.get('name')}`,
    `Phone: ${data.get('phone')}`,
    `Interested in: ${data.get('interest')}`,
    data.get('message') ? `Message: ${data.get('message')}` : ''
  ].filter(Boolean);
  window.open(`https://wa.me/919974333061?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener,noreferrer');
});
