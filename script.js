document.querySelector('#contactForm').onsubmit = e => { e.preventDefault(); document.querySelector('#contactResult').textContent = 'Thank you — your request is ready to be connected to email or WhatsApp when the site goes live.'; e.target.reset(); };

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
