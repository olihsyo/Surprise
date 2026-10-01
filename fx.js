// পার্টিকেল ও আতশবাজি — একটাই canvas, একটাই requestAnimationFrame লুপ
const INTENSITY = { low: [2600, 22], medium: [1700, 34], high: [1100, 48] };

export class FX {
  constructor(canvas, { particles = true, fireworks = true, intensity = "medium", reduced = false } = {}) {
    this.c = canvas; this.ctx = canvas.getContext("2d");
    if (!this.ctx) throw new Error("no canvas");
    const mobile = matchMedia("(pointer:coarse)").matches || innerWidth < 600;
    const [gap, count] = INTENSITY[intensity] || INTENSITY.medium;
    this.scale = reduced ? 0.35 : mobile ? 0.65 : 1;
    this.gap = reduced ? gap * 2 : gap;
    this.count = Math.round(count * this.scale);
    this.usePart = particles; this.useFw = fireworks;
    this.stars = []; this.rockets = []; this.sparks = [];
    this.running = false; this.firing = false; this.last = 0; this.nextLaunch = 0; this.raf = 0;
    this.loop = this.loop.bind(this);
    addEventListener("resize", () => this.resize());
    document.addEventListener("visibilitychange", () => (document.hidden ? this.pause() : this.running && this.start()));
    this.resize();
  }
  resize() {
    const d = Math.min(devicePixelRatio || 1, 2);
    this.w = innerWidth; this.h = innerHeight;
    this.c.width = this.w * d; this.c.height = this.h * d;
    this.ctx.setTransform(d, 0, 0, d, 0, 0);
    const n = this.usePart ? Math.round(Math.min(70, (this.w * this.h) / 14000) * this.scale) : 0;
    this.stars = Array.from({ length: n }, () => this.makeStar());
  }
  makeStar() {
    return { x: Math.random() * this.w, y: Math.random() * this.h, r: Math.random() * 1.6 + 0.4,
      vy: -(Math.random() * 0.12 + 0.03), ph: Math.random() * 6.28, heart: Math.random() < 0.12 };
  }
  start() { this.running = true; if (!this.raf) { this.last = performance.now(); this.raf = requestAnimationFrame(this.loop); } }
  pause() { cancelAnimationFrame(this.raf); this.raf = 0; }
  stop() { this.running = false; this.firing = false; this.pause(); this.rockets = []; this.sparks = []; this.ctx.clearRect(0, 0, this.w, this.h); }
  fireworks(on) { this.firing = on && this.useFw; }
  launch() {
    this.rockets.push({ x: this.w * (0.15 + Math.random() * 0.7), y: this.h, vx: (Math.random() - 0.5) * 1.2,
      vy: -(this.h * (0.0105 + Math.random() * 0.004)), peak: this.h * (0.15 + Math.random() * 0.3),
      hue: Math.random() * 60 + (Math.random() < 0.5 ? 320 : 30) });
  }
  explode(r) {
    const size = 0.6 + Math.random() * 0.8, n = Math.round(this.count * size);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 6.283 + Math.random() * 0.2, s = (Math.random() * 2 + 1.6) * size * (this.w < 600 ? 0.75 : 1);
      this.sparks.push({ x: r.x, y: r.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1,
        decay: 0.008 + Math.random() * 0.012, hue: r.hue + Math.random() * 30 });
    }
  }
  loop(t) {
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min((t - this.last) / 16.67, 3); this.last = t;
    const g = this.ctx; g.clearRect(0, 0, this.w, this.h);
    g.globalCompositeOperation = "lighter";
    for (const s of this.stars) {
      s.y += s.vy * dt; s.ph += 0.02 * dt;
      if (s.y < -10) { s.y = this.h + 10; s.x = Math.random() * this.w; }
      g.globalAlpha = 0.25 + 0.45 * Math.abs(Math.sin(s.ph));
      g.fillStyle = s.heart ? "#ff6fae" : "#fff";
      if (s.heart) { g.font = `${s.r * 7}px serif`; g.fillText("♥", s.x, s.y); }
      else { g.beginPath(); g.arc(s.x, s.y, s.r, 0, 6.283); g.fill(); }
    }
    if (this.firing && t > this.nextLaunch) { this.launch(); this.nextLaunch = t + this.gap * (0.6 + Math.random() * 0.8); }
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i]; r.x += r.vx * dt; r.y += r.vy * dt; r.vy *= 0.985;
      g.globalAlpha = 1; g.fillStyle = `hsl(${r.hue} 100% 80%)`; g.fillRect(r.x, r.y, 2, 6);
      if (r.y <= r.peak || Math.abs(r.vy) < 1.2) { this.explode(r); this.rockets.splice(i, 1); }
    }
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const p = this.sparks[i];
      p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.035 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= p.decay * dt;
      if (p.life <= 0) { this.sparks.splice(i, 1); continue; }
      g.globalAlpha = p.life; g.fillStyle = `hsl(${p.hue} 100% ${55 + p.life * 20}%)`;
      g.fillRect(p.x, p.y, 2.2, 2.2);
    }
    g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
  }
}
