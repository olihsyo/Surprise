// অডিও ফাইল না থাকলেও সাইট ঠিকঠাক চলবে
export class Music {
  constructor(path, enabled, btn) {
    this.btn = btn; this.muted = false; this.a = null;
    if (!enabled || !path) { btn.hidden = true; return; }
    this.a = new Audio(); this.a.loop = true; this.a.volume = 0.6; this.a.preload = "none";
    this.a.addEventListener("error", () => { btn.hidden = true; });
    this.a.src = path;
    btn.addEventListener("click", () => this.toggle());
  }
  async play() {
    if (!this.a) return;
    try { await this.a.play(); } catch { this.btn.hidden = true; }
  }
  toggle() {
    if (!this.a) return;
    this.muted = !this.muted; this.a.muted = this.muted;
    this.btn.textContent = this.muted ? "🔇" : "🔊";
    this.btn.setAttribute("aria-pressed", String(this.muted));
    this.btn.setAttribute("aria-label", this.muted ? "Unmute music" : "Mute music");
  }
}
