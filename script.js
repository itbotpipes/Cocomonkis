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
  const isExport = data.get('interest') === 'Export Enquiries';
  const targetNumber = isExport ? '919527162048' : '917623833000';
  window.open(`https://wa.me/${targetNumber}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener,noreferrer');
});

/* ─── VIDEO GALLERY SLIDER, SOUND TOGGLE & MODAL ─── */
(function () {
  const track = document.getElementById('galleryTrack');
  const prev  = document.getElementById('galleryPrev');
  const next  = document.getElementById('galleryNext');
  const videoModal = document.getElementById('videoModal');
  const modalVideo = document.getElementById('modalVideo');
  const videoModalClose = document.getElementById('videoModalClose');
  if (!track) return;

  const items = track.querySelectorAll('.gallery-item');

  // Helper to toggle sound button icon state
  function updateSoundIcon(btn, isMuted) {
    const mutedIcon = btn.querySelector('.sound-icon-muted');
    const unmutedIcon = btn.querySelector('.sound-icon-unmuted');
    if (mutedIcon && unmutedIcon) {
      mutedIcon.style.display = isMuted ? 'block' : 'none';
      unmutedIcon.style.display = isMuted ? 'none' : 'block';
    }
    btn.classList.toggle('is-active', !isMuted);
    btn.setAttribute('aria-label', isMuted ? 'Unmute video' : 'Mute video');
  }

  // Set up each card
  items.forEach(item => {
    const video = item.querySelector('video');
    const soundBtn = item.querySelector('.gallery-sound-btn');
    if (!video) return;

    // Ensure video is paused initially
    video.pause();

    // 1. Play ONLY on hover, pause on leave
    item.addEventListener('mouseenter', () => {
      video.play().catch(() => {});
      item.classList.add('playing');
    });

    item.addEventListener('mouseleave', () => {
      video.pause();
      item.classList.remove('playing');
    });

    // 2. Sound toggle on card
    if (soundBtn) {
      soundBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Do not trigger modal open
        const willMute = !video.muted;
        video.muted = willMute;
        if (!willMute) {
          video.play().catch(() => {});
          item.classList.add('playing');
          // Mute all other card videos so audio doesn't overlap
          items.forEach(otherItem => {
            const otherVid = otherItem.querySelector('video');
            const otherBtn = otherItem.querySelector('.gallery-sound-btn');
            if (otherVid && otherVid !== video) {
              otherVid.muted = true;
              if (otherBtn) updateSoundIcon(otherBtn, true);
            }
          });
        }
        updateSoundIcon(soundBtn, willMute);
      });
    }

    // 3. Click card to open in modal
    item.addEventListener('click', (e) => {
      // If clicked sound button, ignore
      if (e.target.closest('.gallery-sound-btn')) return;
      if (!videoModal || !modalVideo) return;

      // Pause current card video while watching in popup
      video.pause();
      item.classList.remove('playing');

      const src = video.currentSrc || video.src;
      modalVideo.src = src;
      modalVideo.currentTime = video.currentTime || 0;
      modalVideo.muted = false; // Popup plays with audio!
      videoModal.classList.add('active');
      document.body.style.overflow = 'hidden';

      const playPromise = modalVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          modalVideo.muted = true;
          modalVideo.play().catch(() => {});
        });
      }
    });
  });

  // Modal Close Functionality
  function closeModal() {
    if (!videoModal || !modalVideo) return;
    modalVideo.pause();
    modalVideo.removeAttribute('src'); // Stop buffering
    modalVideo.load();
    videoModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  videoModalClose?.addEventListener('click', closeModal);

  videoModal?.addEventListener('click', (e) => {
    if (e.target === videoModal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal?.classList.contains('active')) {
      closeModal();
    }
  });

  // Smooth scroll arrows for small screens
  function cardW() {
    return items[0] ? (items[0].offsetWidth + 20) : 300;
  }
  prev?.addEventListener('click', () => { 
    track.scrollBy({ left: -cardW(), behavior: 'smooth' }); 
  });
  next?.addEventListener('click', () => { 
    track.scrollBy({ left:  cardW(), behavior: 'smooth' }); 
  });
})();

