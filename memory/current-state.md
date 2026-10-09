# Estado actual — Vorágine (landing agencia de marketing, Puerto Iguazú)

Última sesión: 2026-10-09

## Hecho
- Landing vanilla (Vite + Lenis) que combina el template "Avant Studio" (hero editorial negro, scroll-scrub, wipe del título)
  con la narrativa de "Cortex" (sets sticky con blur sobre video) de motionsites.ai.
- Hero = "El viaje del tucán": UN plano continuo de 20 s scrubeado por scroll, con 4 capítulos (El tucán → El vuelo →
  La bruma → final) y rótulo "0N / 04". Tramo A (10 s, text-to-video) + tramo B (10 s, image-to-video desde el último
  frame del A, prompts afinados por paneles de agentes) unidos con xfade 0.15 s (`scripts/concat.mjs`).
- Final elegido: V3 "Inmersión / La vorágine" (el tucán se lanza a la Garganta, la cámara termina sobre un remolino oscuro).
  V1 y V2 borradas de public/video; los clips crudos siguen en media/raw (gitignored).
- Otros videos: garganta (servicios, scrub), hero (fondo del contacto en loop), vortex (logo con blend lighten).
  Pipeline: `npm run videos` → `scripts/upload.mjs` (frame) → `scripts/concat.mjs` (A + vuelo_b3 → viaje.mp4) → `npm run encode`.
- Repo: https://github.com/LucasEzequielSilva/voragine.git (push funciona con el credential manager de Windows). Deploy automático en Vercel a cargo del usuario.
- Secciones: hero, manifiesto (definición RAE de vorágine + 275 saltos / 80 m / 3 países), servicios (3 sets),
  rubros, proceso, contacto (form → WhatsApp prellenado), footer.

## Próximos pasos
- Completar datos reales en `src/main.js` → CONTACT (WhatsApp, email, Instagram).
- Feedback del usuario sobre copy y look.
- Deploy (Vercel) + analítica (GA4 / Meta Pixel, hook `track()` ya listo).
