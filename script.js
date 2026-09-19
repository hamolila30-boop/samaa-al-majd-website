(() => {
  const form = document.querySelector('#contactForm');
  const result = document.querySelector('#contactResult');
  const button = form.querySelector('button[type="submit"]');
  let sending = false;

  result.setAttribute('role', 'status');
  result.setAttribute('aria-live', 'polite');

  form.onsubmit = async event => {
    event.preventDefault();
    if (sending) return;
    sending = true;
    button.disabled = true;
    result.textContent = '';

    try {
      const payload = Object.fromEntries(new FormData(form));
      payload.access_key = '938744a4-e2b0-44b5-9dc0-c7adeeed5dd1';
      payload.subject = 'New Consultation Request — SAMAA AL MAJD';
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok || data.success !== true) throw new Error('Submission failed');
      form.reset();
      result.textContent = 'Thank you — your request has been received. Our team will contact you shortly.';
    } catch {
      result.textContent = 'Sorry, your request could not be sent. Please try again or contact us on WhatsApp.';
    } finally {
      sending = false;
      button.disabled = false;
    }
  };
})();

// Same sticky geometry and scroll mapping; output is now deterministic lighting.
const hero = document.querySelector('.hero');
const heroScene = document.querySelector('.hero-scene');
const heroLighting = new HeroLighting(heroScene);
let heroScrollStart = 0;
let heroScrollDistance = 1;
let heroScrollFrame = 0;

function measureHero() {
  const stickyTop = parseFloat(getComputedStyle(heroScene).top) || 0;
  heroScrollStart = hero.getBoundingClientRect().top + window.scrollY - stickyTop;
  heroScrollDistance = Math.max(1, hero.offsetHeight - heroScene.offsetHeight);
  heroLighting.resize();
  scheduleHeroFrame();
}

function updateHeroFrame() {
  heroScrollFrame = 0;
  if (document.hidden) return;
  const progress = Math.max(0, Math.min(1, (window.scrollY - heroScrollStart) / heroScrollDistance));
  heroLighting.render(progress);
}

function scheduleHeroFrame() {
  if (!heroScrollFrame) heroScrollFrame = requestAnimationFrame(updateHeroFrame);
}

window.addEventListener('scroll', scheduleHeroFrame, { passive: true });
window.addEventListener('resize', measureHero, { passive: true });
window.addEventListener('pageshow', measureHero);
document.addEventListener('visibilitychange', scheduleHeroFrame);
heroLighting.image.addEventListener('load', measureHero);
document.fonts.ready.then(measureHero);
new ResizeObserver(measureHero).observe(heroScene);
measureHero();
