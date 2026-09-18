// Canvas effects only. The photograph and all foreground UI remain separate HTML.
// Landmarks are normalized to the clean master, allowing a same-composition
// higher-resolution image to replace it without changing scroll/render logic.
class HeroLighting {
  constructor(scene) {
    this.scene = scene;
    this.image = scene.querySelector('.hero-master');
    this.canvas = scene.querySelector('.hero-lighting');
    this.ctx = this.canvas.getContext('2d');
    this.mask = document.createElement('canvas');
    this.glow = document.createElement('canvas');
    this.glow.width = this.glow.height = 128;
    const g = this.glow.getContext('2d');
    const gradient = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255,247,223,.7)');
    gradient.addColorStop(.12, 'rgba(255,224,166,.27)');
    gradient.addColorStop(.4, 'rgba(242,202,128,.07)');
    gradient.addColorStop(1, 'rgba(242,202,128,0)');
    g.fillStyle = gradient; g.fillRect(0, 0, 128, 128);
    // Neutral white bloom for the beam only; city illumination stays unchanged.
    this.beamGlow = document.createElement('canvas');
    this.beamGlow.width = this.beamGlow.height = 128;
    const beamContext = this.beamGlow.getContext('2d');
    const beamGradient = beamContext.createRadialGradient(64, 64, 0, 64, 64, 64);
    beamGradient.addColorStop(0, 'rgba(255,255,255,.7)');
    beamGradient.addColorStop(.12, 'rgba(255,255,255,.27)');
    beamGradient.addColorStop(.4, 'rgba(255,255,255,.07)');
    beamGradient.addColorStop(1, 'rgba(255,255,255,0)');
    beamContext.fillStyle = beamGradient; beamContext.fillRect(0, 0, 128, 128);
    this.lastProgress = -1;
  }

  resize() {
    this.width = this.scene.clientWidth;
    this.height = this.scene.clientHeight;
    // Keep the crisp source image independent of the canvas pixel budget.
    this.dpr = Math.min(window.devicePixelRatio || 1, 2,
      Math.sqrt(5000000 / (this.width * this.height)));
    this.canvas.width = this.mask.width = Math.round(this.width * this.dpr);
    this.canvas.height = this.mask.height = Math.round(this.height * this.dpr);
    const iw = this.image.naturalWidth || 1672, ih = this.image.naturalHeight || 941;
    const scale = Math.max(this.width / iw, this.height / ih);
    this.imageWidth = iw * scale; this.imageHeight = ih * scale;
    // Must match .hero-master object-position. No values depend on scrolling.
    this.imageLeft = (this.width - this.imageWidth) * .558;
    this.buildProtection();
    this.lastProgress = -1;
  }

  buildProtection() {
    const c = this.mask.getContext('2d'), d = this.dpr;
    c.setTransform(d, 0, 0, d, 0, 0);
    c.clearRect(0, 0, this.width, this.height);
    const sceneRect = this.scene.getBoundingClientRect();
    const protect = rect => {
      const x = rect.left - sceneRect.left, y = rect.top - sceneRect.top;
      c.fillRect(x - 7, y - 5, rect.width + 14, rect.height + 10);
    };
    c.fillStyle = '#000'; c.shadowColor = '#000'; c.shadowBlur = 12 * d;
    // Text line boxes rather than one large opaque block over the photograph.
    for (const el of this.scene.querySelectorAll('h1,.lead,.eyebrow,.trust,.hero-slogan,.scroll-cue')) {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let node; (node = walker.nextNode());) {
        if (!node.textContent.trim()) continue;
        const range = document.createRange(); range.selectNodeContents(node);
        for (const rect of range.getClientRects()) protect(rect);
      }
    }
    for (const el of this.scene.querySelectorAll('.button')) protect(el.getBoundingClientRect());
    c.shadowBlur = 0;
    const edge = c.createLinearGradient(0, 0, 0, 32);
    edge.addColorStop(0, '#000'); edge.addColorStop(.25, '#000');
    edge.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = edge; c.fillRect(0, 0, this.width, 32);
  }

  render(progress) {
    if (!this.ctx || !this.width || progress === this.lastProgress) return;
    this.lastProgress = progress;
    const c = this.ctx, w = this.width, h = this.height;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    c.clearRect(0, 0, w, h);
    const ramp = (a, b) => Math.max(0, Math.min(1, (progress - a) / (b - a)));
    const x = this.imageLeft + this.imageWidth * (933 / 1672);
    const base = this.imageHeight * (597 / 941);
    const spire = this.imageHeight * (60 / 941);
    const q = ramp(.12, 1);
    const tip = q <= .82 ? base + (spire - base) * q / .82
      : spire + (Math.min(spire * .28, 18) - spire) * (q - .82) / .18;
    const strength = ramp(0, .2);
    c.globalCompositeOperation = 'screen';
    const glow = (cx, cy, rx, ry, opacity, sprite = this.glow) => {
      c.globalAlpha = opacity;
      c.drawImage(sprite, cx - rx, cy - ry, rx * 2, ry * 2);
    };
    // Very restrained illumination in the existing Downtown/fountain lights.
    glow(x, base, this.imageWidth * .1, this.imageHeight * .11, .2 * strength);
    glow(x - this.imageWidth * .1, base + this.imageHeight * .08,
      this.imageWidth * .15, this.imageHeight * .045, .09 * strength);
    if (q > 0) {
      const length = base - tip;
      const intensity = Math.min(1, q * 8);
      // Layered tapered shafts, no full-screen blur or moving background.
      const shaft = (width, color, opacity) => {
        c.globalAlpha = opacity * intensity;
        const fade = c.createLinearGradient(0, tip, 0, base);
        fade.addColorStop(0, color); fade.addColorStop(.55, color);
        fade.addColorStop(1, 'rgba(255,223,168,0)');
        c.fillStyle = fade;
        c.beginPath(); c.moveTo(x - width * .2, tip);
        c.quadraticCurveTo(x - width * .65, tip + length * .55, x - width, base);
        c.lineTo(x + width, base);
        c.quadraticCurveTo(x + width * .65, tip + length * .55, x + width * .2, tip);
        c.closePath(); c.fill();
      };
      shaft(25.3, 'rgba(255,255,255,.10)', .8);
      shaft(11.5, 'rgba(255,255,255,.20)', .8);
      shaft(3.2, 'rgba(255,255,255,.625)', .8);
      shaft(1.275, 'rgba(255,255,255,.95)', .95);
      // Local haze and a compact white traveling tip; fully deterministic.
      glow(x, tip, 43.7, 65, .8125 * intensity, this.beamGlow);
      glow(x, tip + length * .45, 57.5, Math.max(12, length * .6), .1625 * intensity, this.beamGlow);
      c.globalAlpha = intensity;
      const head = c.createRadialGradient(x, tip, 0, x, tip, 4);
      head.addColorStop(0, 'rgba(255,255,255,.98)');
      head.addColorStop(.3, 'rgba(255,255,255,.85)');
      head.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = head; c.beginPath(); c.ellipse(x, tip, 4, 5, 0, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1; c.globalCompositeOperation = 'destination-out';
    c.drawImage(this.mask, 0, 0, this.mask.width, this.mask.height, 0, 0, w, h);
    c.globalCompositeOperation = 'source-over';
  }
}
