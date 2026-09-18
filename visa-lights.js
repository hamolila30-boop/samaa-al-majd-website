// Static section-local lights. Brightness captured from the existing visible preview.
(() => {
  const section = document.querySelector('.visa-section');
  if (!section) return;
  const layer = document.createElement('div');
  layer.className = 'visa-lights';
  layer.setAttribute('aria-hidden', 'true');
  const positions = [
    [3, 12], [19, 7], [43, 16], [67, 6], [96, 19], [5, 43],
    [49, 33], [94, 47], [13, 63], [36, 53], [65, 88], [97, 79],
    [26, 37], [79, 15], [2, 76], [47, 68], [22, 85], [83, 74],
    [56, 10], [73, 56], [39, 92], [91, 94]
  ];
  const opacity = [0.06, 0.1344, 0.06, 0.1799, 0.06, 0.8775, 0.1, 0.06, 0.2887, 0.1846, 0.06, 0.06, 0.06, 0.06, 0.1138, 0.7947, 0.2183, 0.06, 0.4902, 0.06, 0.6712, 0.3341];
  positions.forEach(([x, y], i) => {
    const light = document.createElement('span');
    light.className = 'visa-light';
    light.style.left = `${x}%`;
    light.style.top = `${y}%`;
    light.style.setProperty('--light-size', `${i % 5 === 0 ? 2.5 : i % 3 === 0 ? 2 : 1.5}px`);
    if ([0, 4, 6, 7, 15, 20].includes(i)) light.classList.add('visa-light-twinkle');
    if ([5, 11].includes(i)) light.classList.add('visa-light-twinkle', 'visa-light-accent');
    light.style.opacity = opacity[i];
    layer.append(light);
  });
  section.prepend(layer);
})();
