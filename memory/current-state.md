# Estado actual — Vorágine (landing agencia de marketing, Puerto Iguazú)

Última sesión: 2026-10-09

## Hecho
- Landing vanilla (Vite + Lenis) que combina el template "Avant Studio" (hero editorial negro, scroll-scrub, wipe del título)
  con la narrativa de "Cortex" (sets sticky con blur sobre video) de motionsites.ai.
- 7 videos generados con Higgsfield API (Kling 2.5 Turbo Pro) via `npm run videos`. Hero = montaje de 4 planos en loop
  (tucan, noir, mariposa, rio) que el scroll corta con cortina vertical + contador "01 / 04". garganta (servicios, scrub),
  hero (fondo del contacto), vortex (logo con blend lighten). Recodificados con `npm run encode`.
- Repo git inicializado, remoto https://github.com/LucasEzequielSilva/voragine.git. Push pendiente de auth (gh logueado como janamiyen).
- Secciones: hero, manifiesto (definición RAE de vorágine + 275 saltos / 80 m / 3 países), servicios (3 sets),
  rubros, proceso, contacto (form → WhatsApp prellenado), footer.

## Próximos pasos
- Completar datos reales en `src/main.js` → CONTACT (WhatsApp, email, Instagram).
- Feedback del usuario sobre copy y look.
- Deploy (Vercel) + analítica (GA4 / Meta Pixel, hook `track()` ya listo).
