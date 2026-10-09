import Lenis from "lenis";

// ─── Datos de contacto (completar) ───
const CONTACT = {
  whatsapp: "5493757000000", // TODO: número real, formato internacional sin "+" ni espacios
  email: "hola@voragine.ar", // TODO: email real
  instagram: "https://instagram.com/", // TODO: perfil real
};

const isMobile = matchMedia("(max-width: 900px)").matches;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

document.body.classList.add("is-loading");

// ─── Fuentes de video (versión mobile más liviana) ───
const srcFor = (name) => `/video/${name}${isMobile ? "-mobile" : ""}.mp4`;
$$("video[data-video]").forEach((v) => (v.src = srcFor(v.dataset.video)));
const brand = $(".brand");
brand.play().catch(() => {});

// ─── Smooth scroll ───
const lenis = reduceMotion ? null : new Lenis({ lerp: 0.1, smoothWheel: true });
if (lenis) {
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}
const scrollToHash = (hash) => {
  const target = hash === "#top" ? 0 : $(hash);
  if (target === null) return;
  lenis ? lenis.scrollTo(target, { duration: 1.6 }) : (target === 0 ? scrollTo(0, 0) : target.scrollIntoView());
};
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || a.getAttribute("href") === "#") return;
  e.preventDefault();
  closeMenu();
  scrollToHash(a.getAttribute("href"));
});

// ─── Scrub de video por scroll (motor Avant: lerp + seeks con gate) ───
// Mapea el progreso de scroll de una sección a video.currentTime.
function createScrubber(video, section, { onFrame } = {}) {
  const K = 0.1, DEADBAND = 0.02, MIN_SEEK_MS = 30;
  let target = 0, cur = 0, seeking = false, lastSeek = 0;

  video.addEventListener("loadedmetadata", () => { video.pause(); video.currentTime = 0.001; });
  video.addEventListener("seeked", () => (seeking = false));

  const progress = () => {
    const r = section.getBoundingClientRect();
    const range = r.height - innerHeight;
    return range > 0 ? clamp(-r.top / range) : 0;
  };

  return (now) => {
    const d = video.duration;
    const p = progress();
    if (d && !isNaN(d)) {
      target = p * (d - 0.05);
      cur += (target - cur) * K;
      if (!seeking && Math.abs(cur - video.currentTime) > DEADBAND && now - lastSeek > MIN_SEEK_MS) {
        seeking = true;
        lastSeek = now;
        video.currentTime = cur;
      }
    }
    onFrame?.(p, d ? cur / d : p);
  };
}

const ticks = [];

// HERO: el título se barre L→R desde el 30 % y el video se recentra hasta el 60 %.
const heroTrack = $(".hero-track");
const titleBlock = $(".title-block");
const heroBg = $(".hero-bg");
const MASK_START = 0.3, SHIFT_PX = 225, CENTER_BY = 0.6;
ticks.push(
  createScrubber(heroBg, heroTrack, {
    onFrame: (scrollP, p) => {
      if (isMobile) return;
      titleBlock.style.setProperty("--wipe", clamp((p - MASK_START) / (1 - MASK_START)).toFixed(4));
      heroBg.style.setProperty("--shift", `${(-SHIFT_PX * (1 - clamp(p / CENTER_BY))).toFixed(1)}px`);
      heroBg.style.setProperty("--zoom", (1.06 + p * 0.08).toFixed(4));
    },
  })
);

// SERVICIOS: 3 sets que entran/salen con blur sobre la Garganta del Diablo (motor Cortex).
const solutions = $(".solutions");
const sets = $$(".set", solutions);
const bar = $(".solutions__progress", solutions);
const WINDOWS = [
  [0.0, 0.05, 0.24, 0.31],
  [0.35, 0.42, 0.58, 0.65],
  [0.69, 0.76, 0.95, 1.01],
];
const ramp = (p, [a, b, c, d]) => (p < a || p > d ? 0 : p < b ? (p - a) / (b - a) : p <= c ? 1 : 1 - (p - c) / (d - c));
ticks.push(
  createScrubber($(".solutions__bg"), solutions, {
    onFrame: (p) => {
      bar.style.setProperty("--p", p.toFixed(4));
      sets.forEach((set, i) => {
        const w = WINDOWS[i];
        const o = clamp(ramp(p, w));
        const travel = clamp((p - w[0]) / (w[3] - w[0]));
        set.style.setProperty("--o", o.toFixed(3));
        set.style.setProperty("--b", `${((1 - o) * 15).toFixed(2)}px`);
        set.style.setProperty("--yt", `${(-120 * travel).toFixed(1)}px`);
        set.style.setProperty("--yb", `${(120 * travel - 60).toFixed(1)}px`);
      });
    },
  })
);

if (!reduceMotion) {
  const loop = (now) => { ticks.forEach((t) => t(now)); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
} else {
  sets.forEach((s) => { s.style.setProperty("--o", 1); s.style.setProperty("--b", "0px"); });
  sets.slice(1).forEach((s) => (s.style.display = "none"));
}

// ─── Preloader: espera a que el hero tenga frames (mín. 1.2 s, máx. 7 s) ───
(() => {
  const loader = $(".loader");
  const count = $(".loader__count");
  const start = performance.now();
  let ready = false, shown = 0;
  const done = () => (ready = true);
  heroBg.readyState >= 2 ? done() : heroBg.addEventListener("loadeddata", done, { once: true });
  setTimeout(done, 7000);

  const step = (now) => {
    const elapsed = now - start;
    const goal = ready && elapsed > 1200 ? 100 : Math.min(90, (elapsed / 4000) * 90);
    shown += (goal - shown) * 0.12;
    count.textContent = String(Math.round(shown)).padStart(3, "0");
    if (goal === 100 && shown > 99.5) {
      count.textContent = "100";
      loader.classList.add("is-done");
      document.body.classList.remove("is-loading");
      setTimeout(() => loader.remove(), 1200);
      return;
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
})();

// ─── Reveals (blur-slide) + split por palabras ───
$$("[data-words]").forEach((el) => {
  const words = el.textContent.trim().split(/\s+/);
  el.setAttribute("aria-label", el.textContent.trim());
  el.innerHTML = words.map((w, i) => `<span class="w" aria-hidden="true" style="--i:${i}">${w}</span>`).join(" ");
});
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("is-in");
    if (e.target.matches(".stat")) countUp($(".stat__n", e.target));
    io.unobserve(e.target);
  }),
  { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
);
$$(".reveal, [data-words]").forEach((el) => io.observe(el));

function countUp(el) {
  const to = +el.dataset.count, suffix = el.dataset.suffix ?? "";
  if (reduceMotion) return (el.textContent = to + suffix);
  const t0 = performance.now(), dur = 1600;
  const f = (now) => {
    const k = clamp((now - t0) / dur);
    el.textContent = Math.round(to * (1 - Math.pow(1 - k, 4))) + suffix;
    if (k < 1) requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
}

// ─── Video del contacto: carga perezosa ───
const contactBg = $(".contact__bg");
new IntersectionObserver((entries, obs) => {
  if (!entries[0].isIntersecting) return;
  contactBg.src = srcFor(contactBg.dataset.lazy);
  contactBg.play().catch(() => {});
  obs.disconnect();
}, { rootMargin: "100% 0px" }).observe(contactBg);

// ─── Menú ───
const menu = $("#menu");
const menuBtn = $("[data-menu-open]");
function closeMenu() {
  menu.classList.remove("is-open");
  menuBtn.setAttribute("aria-expanded", "false");
  menuBtn.textContent = "Menú";
  lenis?.start();
  setTimeout(() => !menu.classList.contains("is-open") && (menu.hidden = true), 500);
}
menuBtn.addEventListener("click", () => {
  if (menu.classList.contains("is-open")) return closeMenu();
  menu.hidden = false;
  requestAnimationFrame(() => menu.classList.add("is-open"));
  menuBtn.setAttribute("aria-expanded", "true");
  menuBtn.textContent = "Cerrar";
  lenis?.stop();
});
addEventListener("keydown", (e) => e.key === "Escape" && menu.classList.contains("is-open") && closeMenu());

// ─── Hora local de Iguazú ───
const clockFmt = new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Argentina/Buenos_Aires" });
const tickClock = () => $$("[data-clock]").forEach((t) => (t.textContent = `${clockFmt.format(new Date())} h`));
tickClock();
setInterval(tickClock, 15000);
$$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

// ─── Contacto / conversión ───
const waLink = (text = "Hola Vorágine! Quiero hablar sobre mi marca.") =>
  `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
$$("[data-whatsapp]").forEach((a) => { a.href = waLink(); a.target = "_blank"; a.rel = "noopener"; });
$$("[data-email]").forEach((a) => (a.href = `mailto:${CONTACT.email}`));
$$("[data-instagram]").forEach((a) => (a.href = CONTACT.instagram));

const form = $("[data-lead-form]");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(form);
  let ok = true;
  ["nombre", "marca"].forEach((n) => {
    const input = form.elements[n];
    const bad = !String(data.get(n) ?? "").trim();
    input.setAttribute("aria-invalid", bad);
    if (bad && ok) { input.focus(); ok = false; }
  });
  if (!ok) return;
  const needs = data.getAll("necesidad");
  const lines = [
    `Hola Vorágine! Soy ${data.get("nombre")} de ${data.get("marca")}.`,
    needs.length && `Necesito: ${needs.join(", ")}.`,
    data.get("inversion") && `Inversión mensual estimada: ${data.get("inversion")}.`,
    String(data.get("mensaje") ?? "").trim(),
  ].filter(Boolean);
  track("lead_submit", { needs: needs.join("|"), inversion: data.get("inversion") });
  window.open(waLink(lines.join("\n")), "_blank", "noopener");
});

// Hook de analítica: conecta acá GA4 / Meta Pixel cuando estén.
function track(event, params = {}) {
  window.dataLayer?.push({ event, ...params });
  window.fbq?.("trackCustom", event, params);
}
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-cta]");
  if (el) track("cta_click", { cta: el.dataset.cta });
});

// ─── WhatsApp flotante: aparece después del hero, se oculta en el contacto ───
const floatWa = $(".float-wa");
const contact = $("#contacto");
let heroOut = false, contactIn = false;
const syncFloat = () => floatWa.classList.toggle("is-visible", heroOut && !contactIn);
new IntersectionObserver(([e]) => { heroOut = !e.isIntersecting; syncFloat(); }).observe($(".hero-track"));
new IntersectionObserver(([e]) => { contactIn = e.isIntersecting; syncFloat(); }, { threshold: 0.15 }).observe(contact);
