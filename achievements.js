// One restrained entrance, independent of the Hero's scroll renderer.
(() => {
  const section = document.querySelector('.achievements');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!section || reducedMotion.matches || !('IntersectionObserver' in window)) return;
  const counters = [...section.querySelectorAll('[data-count]')];
  const format = new Intl.NumberFormat('en-US');
  let frame = 0;
  const finish = () => {
    cancelAnimationFrame(frame);
    counters.forEach(el => { el.textContent = `${format.format(Number(el.dataset.count))}+`; });
    section.classList.remove('achievements-entering');
  };
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    if (reducedMotion.matches) return;
    section.classList.add('achievements-entering');
    const started = performance.now();
    const tick = now => {
      const progress = Math.min(1, (now - started) / 1050);
      const eased = 1 - Math.pow(1 - progress, 3);
      counters.forEach(el => {
        el.textContent = `${format.format(Math.round(Number(el.dataset.count) * (.8 + .2 * eased)))}+`;
      });
      if (progress < 1) frame = requestAnimationFrame(tick);
      else finish();
    };
    frame = requestAnimationFrame(tick);
  }, { threshold: .35 });
  observer.observe(section);
  reducedMotion.addEventListener('change', event => { if (event.matches) finish(); });
})();
