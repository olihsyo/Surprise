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
// নামের প্রতিটা অক্ষর আলাদা করে ফোটে
[...CONFIG.recipientName].forEach((c, i) => {
  if (c === " ") return $("name").append(" ");
  const s = document.createElement("span"); s.className = "ch"; s.textContent = c; s.style.setProperty("--i", i); $("name").append(s);
});
$("name").setAttribute("aria-label", CONFIG.recipientName);
$("msg").textContent = CONFIG.greetingMessage;
const lines = CONFIG.finalLines || [CONFIG.finalMessage];
lines.forEach((t, i) => {
  const s = document.createElement("span"); s.className = "ln" + (t ? "" : " gap"); s.textContent = t; s.style.setProperty("--i", i); $("final").append(s);
});
if (!CONFIG.wishes?.length) $("wishBtn").hidden = true;
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
  later(10800 + lines.length * 500 + 800, () => { show("wishBtn"); fx?.finale(); });
  later(15000, () => fx?.fireworks(false));
}

function replay() {
  timers.forEach(clearTimeout); timers = [];
  fx?.stop();
  document.querySelectorAll("[data-step]").forEach((n) => n.classList.remove("in"));
  document.body.classList.remove("lit");
  el.card.hidden = true; el.controls.hidden = true; $("wishBox").hidden = true;
  el.intro.hidden = false; el.intro.classList.remove("leaving");
  void el.intro.offsetWidth;
  begin();
}

$("begin").addEventListener("click", begin, { once: true });
$("replay").addEventListener("click", replay);

// ট্যাপ করলে হার্ট
document.addEventListener("pointerdown", (e) => {
  if (el.card.hidden || e.target.closest("button")) return;
  fx?.burst(e.clientX, e.clientY);
});

// ডেস্কটপে কার্ড হালকা হেলে যায়
if (matchMedia("(hover:hover)").matches && !reduced) {
  document.addEventListener("pointermove", (e) => {
    el.card.style.setProperty("--ry", (e.clientX / innerWidth - 0.5) * 8 + "deg");
    el.card.style.setProperty("--rx", -(e.clientY / innerHeight - 0.5) * 8 + "deg");
  });
}

// র‍্যান্ডম উইশ
let lastWish = -1;
$("wishBtn").addEventListener("click", () => {
  const w = CONFIG.wishes; let i;
  do i = Math.floor(Math.random() * w.length); while (i === lastWish && w.length > 1);
  lastWish = i; $("wishText").textContent = w[i]; $("wishBox").hidden = false;
  fx?.burst(innerWidth / 2, innerHeight / 2, 40); $("wishClose").focus();
});
const closeWish = () => { $("wishBox").hidden = true; };
$("wishClose").addEventListener("click", closeWish);
document.addEventListener("keydown", (e) => e.key === "Escape" && closeWish());
