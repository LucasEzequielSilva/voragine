# Estado actual — Vorágine (landing agencia de marketing, Puerto Iguazú)

Última sesión: 2026-10-09

## Hecho
- Landing vanilla (Vite + Lenis) que combina el template "Avant Studio" (hero editorial negro, scroll-scrub, wipe del título)
  con la narrativa de "Cortex" (sets sticky con blur sobre video) de motionsites.ai.
- Hero = "El viaje del tucán": UN plano continuo de 20 s scrubeado por scroll, con 4 capítulos (El tucán → El vuelo →
  La bruma → final) y rótulo "0N / 04". Tramo A (10 s, text-to-video) + tramo B (10 s, image-to-video desde el último
  frame del A, prompts afinados por paneles de agentes) unidos con xfade 0.15 s (`scripts/concat.mjs`).
- A/B/C del final del viaje: `?hero=v1` Revelación (default), `?hero=v2` Ascenso aéreo, `?hero=v3` Inmersión/vorágine.
  Falta que el usuario elija; después borrar las otras dos de public/video (≈22 MB c/u).
- Otros videos: garganta (servicios, scrub), hero (fondo del contacto en loop), vortex (logo con blend lighten).
  Pipeline: `npm run videos` → `scripts/upload.mjs` (frame) → `scripts/concat.mjs` → `npm run encode`.
- Repo: https://github.com/LucasEzequielSilva/voragine.git (push funciona con el credential manager de Windows). Deploy automático en Vercel a cargo del usuario.
- Secciones: hero, manifiesto (definición RAE de vorágine + 275 saltos / 80 m / 3 países), servicios (3 sets),
  rubros, proceso, contacto (form → WhatsApp prellenado), footer.

## Próximos pasos
- Elegir V1/V2/V3 del hero y borrar las variantes descartadas.
- Completar datos reales en `src/main.js` → CONTACT (WhatsApp, email, Instagram).
- Feedback del usuario sobre copy y look.
- Deploy (Vercel) + analítica (GA4 / Meta Pixel, hook `track()` ya listo).
