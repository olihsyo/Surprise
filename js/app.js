import { CONFIG } from "./config.js";
import { FX } from "./fx.js";
import { Music } from "./audio.js";

const $ = (id) => document.getElementById(id);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const el = { intro: $("intro"), card: $("card"), controls: $("controls"), photo: $("photo"), wrap: $("photoWrap"), ph: $("placeholder") };
let timers = [];
const later = (ms, fn) => timers.push(setTimeout(fn, reduced ? ms * 0.5 : ms));
const show = (id) => $(id).classList.add("in");

document.body.dataset.theme = CONFIG.theme;
$("introText").textContent = CONFIG.introText;
$("hello").textContent = CONFIG.greetingTitle;
$("name").textContent = CONFIG.recipientName;
$("msg").textContent = CONFIG.greetingMessage;
$("final").textContent = CONFIG.finalMessage;
$("final").hidden = !CONFIG.showFinalMessage;
document.title = `${CONFIG.greetingTitle} ${CONFIG.recipientName} ✨`;

// ছবি লোড — না পেলে সুন্দর প্লেসহোল্ডার
if (!CONFIG.showPhoto) el.wrap.hidden = true;
else {
  el.photo.onerror = () => { el.photo.hidden = true; el.ph.hidden = false; };
  el.photo.alt = CONFIG.recipientName;
  el.photo.src = CONFIG.photoPath;
}

let fx = null;
try {
  fx = new FX($("fx"), { particles: CONFIG.enableParticles, fireworks: CONFIG.enableFireworks,
    intensity: CONFIG.fireworksIntensity, reduced });
} catch { console.warn("Canvas unavailable; using CSS effects only."); }
const music = new Music(CONFIG.audioPath, CONFIG.enableMusic, $("mute"));

function begin() {
  el.intro.classList.add("leaving");
  music.play(); // ইউজারের ট্যাপের পরেই মিউজিক শুরু
  document.body.classList.add("lit");
  later(1000, () => { fx?.start(); el.intro.hidden = true; el.card.hidden = false; });
  later(2000, () => fx?.fireworks(true));
  later(3000, () => show("hello"));
  later(4600, () => show("name"));
  later(6800, () => show("msg"));
  later(8800, () => show("photoWrap"));
  later(10800, () => { show("final"); el.controls.hidden = false; });
  later(15000, () => fx?.fireworks(false));
}

function replay() {
  timers.forEach(clearTimeout); timers = [];
  fx?.stop();
  document.querySelectorAll("[data-step]").forEach((n) => n.classList.remove("in"));
  document.body.classList.remove("lit");
  el.card.hidden = true; el.controls.hidden = true;
  el.intro.hidden = false; el.intro.classList.remove("leaving");
  void el.intro.offsetWidth;
  begin();
}

$("begin").addEventListener("click", begin, { once: true });
$("replay").addEventListener("click", replay);
