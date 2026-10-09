// "Río arriba" — motor de scroll: una sola placa de video continua scrubeada por el scroll
// y escenas coreografiadas sobre p = scrollY / (pista − viewport).
import Lenis from "lenis";

// ─── Datos de contacto (completar) ───
const CONTACT = {
  whatsapp: "5493757000000", // TODO: número real, formato internacional sin "+" ni espacios
  email: "hola@voragine.ar", // TODO: email real
  instagram: "https://instagram.com/", // TODO: perfil real
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ramp = (p, a, b) => clamp((p - a) / (b - a));
const expoOut = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeIn = (t) => t * t;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// ─── Mapa del recorrido (fracciones de p) ───
const TITLE_OUT = [0, 0.083];
const STATEMENT = { in: [0.1, 0.17], out: [0.27, 0.31] };
const WHO = { in: [0.37, 0.43], fly: [0.52, 0.62] };
const SERVICES = { from: 0.63, to: 0.75 };
const STATS = { from: 0.77, to: 0.91 };
const TITLE_IN = [0.917, 1];
const STAGE_OUT = [0.985, 1];
const STOPS = 6;

// ─── Entrada ───
const showPage = () => requestAnimationFrame(() => document.documentElement.classList.add("is-ready"));
document.fonts.ready.then(showPage);
setTimeout(showPage, 2500);

// ─── Smooth scroll ───
const lenis = reduceMotion ? null : new Lenis({ lerp: 0.1, smoothWheel: true });
if (lenis) {
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || a.getAttribute("href") === "#") return;
  e.preventDefault();
  const target = a.getAttribute("href") === "#top" ? 0 : $(a.getAttribute("href"));
  if (target === null) return;
  lenis ? lenis.scrollTo(target, { duration: 1.8 }) : target === 0 ? scrollTo(0, 0) : target.scrollIntoView();
});

// ─── Clips: seeks con gate sobre un reloj compartido (el mp4 va con todos los frames keyframe) ───
function createClip(video) {
  let seeking = false, lastSeek = 0;
  video.addEventListener("loadedmetadata", () => { video.pause(); video.currentTime = 0.001; });
  video.addEventListener("seeked", () => (seeking = false));
  return {
    video,
    get dur() { return video.duration && !isNaN(video.duration) ? video.duration : 0; },
    seek(t, now) {
      if (!seeking && Math.abs(t - video.currentTime) > 0.01 && now - lastSeek > 30) {
        seeking = true; lastSeek = now; video.currentTime = t;
      }
    },
  };
}
const clip = createClip($("#v1"));

// ─── Elementos ───
const stage = $("#stage");
const title = $("#title");
const scenes = Object.fromEntries($$(".scene").map((s) => [s.dataset.scene, s]));
const scenesRoot = $(".scenes");
const rows = { l: $$(".who__col--l .row"), r: $$(".who__col--r .row") };
const svcs = $$("[data-svc]");
const stats = $$("[data-stat]");
const progress = $(".progress"), stops = $$(".progress__stop");
const runway = $(".runway");

let W = innerWidth, H = innerHeight;
function measure() { W = innerWidth; H = innerHeight; }

// ─── Escritores ───
const setVar = (el, k, v) => el.style.setProperty(k, v);
const exit3d = (el, e) => {
  setVar(el, "--exit", e.toFixed(3));
  el.classList.toggle("is-exiting", e > 0 && e < 1);
  el.classList.toggle("is-gone", e >= 1);
};
const sceneIn = (el, v) => {
  setVar(el, "--o", v.toFixed(3));
  setVar(el, "--in", v.toFixed(3));
  el.classList.toggle("is-on", v > 0);
  el.classList.toggle("is-anim", v > 0 && v < 1);
};

function updateTitle(p) {
  const out = ramp(p, ...TITLE_OUT);
  const back = 1 - ramp(p, ...TITLE_IN);
  exit3d(title, Math.min(out, back));
}

function updateStatement(p) {
  const v = Math.min(expoOut(ramp(p, ...STATEMENT.in)), 1 - expoOut(ramp(p, ...STATEMENT.out)));
  sceneIn(scenes.statement, v);
}

function updateWho(p) {
  const v = Math.min(expoOut(ramp(p, ...WHO.in)), 1 - ramp(p, WHO.fly[1], WHO.fly[1] + 0.03));
  sceneIn(scenes.who, v);
  // las filas vuelan en pares (izq + der juntas, direcciones opuestas), escalonadas
  const span = WHO.fly[1] - WHO.fly[0];
  rows.l.forEach((row, i) => {
    const start = WHO.fly[0] + i * 0.2 * span;
    const f = easeIn(ramp(p, start, start + 0.6 * span));
    [row, rows.r[i]].forEach((r) => { setVar(r, "--fly", f.toFixed(3)); r.classList.toggle("is-flying", f > 0 && f < 1); });
  });
}

// Slots consecutivos: cada ítem llega (e 1→0), se queda y se va (e 0→1), como el título
function slots(p, items, from, to, { arrive = 0.3, hold = 0.45 } = {}) {
  const w = (to - from) / items.length;
  items.forEach((el, i) => {
    const a = from + i * w, local = ramp(p, a, a + w);
    let e;
    if (local <= 0 || local >= 1) e = 1;
    else if (local < arrive) e = 1 - local / arrive;
    else if (local < arrive + hold) e = 0;
    else e = (local - arrive - hold) / (1 - arrive - hold);
    exit3d(el, clamp(e));
  });
}
function updateServices(p) {
  sceneIn(scenes.services, p > SERVICES.from - 0.01 && p < SERVICES.to + 0.01 ? 1 : 0);
  slots(p, svcs, SERVICES.from, SERVICES.to);
}
function updateStats(p) {
  sceneIn(scenes.stats, p > STATS.from - 0.01 && p < STATS.to + 0.01 ? 1 : 0);
  slots(p, stats, STATS.from, STATS.to, { arrive: 0.34, hold: 0.4 });
}

function updateStage(p) {
  // al final del recorrido la placa se funde a negro para que vuelva el título
  setVar(stage, "--stage-out", ramp(p, ...STAGE_OUT).toFixed(3));
}

function updateShade(p) {
  // más velo cuando hay texto para leer
  const s = Math.max(
    Math.min(expoOut(ramp(p, ...STATEMENT.in)), 1 - ramp(p, ...STATEMENT.out)),
    Math.min(expoOut(ramp(p, ...WHO.in)), 1 - ramp(p, WHO.fly[1], WHO.fly[1] + 0.03)),
    Math.min(ramp(p, SERVICES.from - 0.02, SERVICES.from), 1 - ramp(p, SERVICES.to - 0.02, SERVICES.to)) * 0.8,
    Math.min(ramp(p, STATS.from - 0.02, STATS.from), 1 - ramp(p, STATS.to, STATS.to + 0.02)) * 0.5
  );
  setVar(scenesRoot, "--shade", s.toFixed(3));
}

function updateProgress(p) {
  setVar(progress, "--po", p > 0.03 && p < 0.97 ? 1 : 0);
  setVar(progress, "--pp", p.toFixed(4));
  const i = Math.min(STOPS - 1, Math.floor(p * STOPS));
  stops.forEach((s, k) => s.classList.toggle("is-active", k === i));
}

// Reloj suavizado: el scroll mueve el tiempo del video
let smoothT = 0;
function updateScrub(p, dt, now) {
  const dur = clip.dur;
  if (!dur) return;
  const target = p * (dur - 0.05);
  smoothT += (target - smoothT) * (1 - Math.exp(-dt * 8));
  if (Math.abs(target - smoothT) < 0.002) smoothT = target;
  clip.seek(smoothT, now);
}

const progressP = () => clamp(scrollY / Math.max(1, runway.offsetHeight - H));
function drive(p, dt = 0.05, now = performance.now()) {
  updateTitle(p);
  updateStatement(p);
  updateWho(p);
  updateServices(p);
  updateStats(p);
  updateStage(p);
  updateShade(p);
  updateProgress(p);
  if (!reduceMotion) updateScrub(p, dt, now);
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (innerWidth !== W || innerHeight !== H) measure();
  drive(progressP(), dt, now);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Diagnóstico: window.__plate.drive(p) ejecuta la coreografía sin scrollear
window.__plate = { p: progressP, drive };

// ─── Logo vivo ───
$(".brand").play().catch(() => {});

// ─── Reloj y año ───
const clockFmt = new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Argentina/Buenos_Aires" });
const tickClock = () => $$("[data-clock]").forEach((t) => (t.textContent = `${clockFmt.format(new Date())} h`));
tickClock(); setInterval(tickClock, 15000);
$$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

// ─── Conversión ───
const waLink = (text = "Hola Vorágine! Tengo un negocio en Iguazú y quiero hablar con ustedes.") =>
  `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
$$("[data-whatsapp]").forEach((a) => { a.href = waLink(); a.target = "_blank"; a.rel = "noopener"; });
$$("[data-email]").forEach((a) => (a.href = `mailto:${CONTACT.email}`));
$$("[data-instagram]").forEach((a) => (a.href = CONTACT.instagram));

function track(event, params = {}) {
  window.dataLayer?.push({ event, ...params });
  window.fbq?.("trackCustom", event, params);
}
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-cta]");
  if (el) track("cta_click", { cta: el.dataset.cta });
});

$("[data-lead-form]").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.currentTarget, data = new FormData(form);
  let ok = true;
  ["nombre", "marca"].forEach((n) => {
    const bad = !String(data.get(n) ?? "").trim();
    form.elements[n].setAttribute("aria-invalid", bad);
    if (bad && ok) { form.elements[n].focus(); ok = false; }
  });
  if (!ok) return;
  const needs = data.getAll("necesidad");
  const lines = [
    `Hola Vorágine! Soy ${data.get("nombre")} de ${data.get("marca")}, en Iguazú.`,
    needs.length && `Necesito: ${needs.join(", ")}.`,
    data.get("inversion") && `Inversión mensual estimada: ${data.get("inversion")}.`,
    String(data.get("mensaje") ?? "").trim(),
  ].filter(Boolean);
  track("lead_submit", { needs: needs.join("|"), inversion: data.get("inversion") });
  window.open(waLink(lines.join("\n")), "_blank", "noopener");
});
