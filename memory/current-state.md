# Estado actual — Vorágine (landing agencia de marketing, Puerto Iguazú)

Última sesión: 2026-10-09

## Hecho
- Landing vanilla (Vite + Lenis) que combina el template "Avant Studio" (hero editorial negro, scroll-scrub, wipe del título)
  con la narrativa de "Cortex" (sets sticky con blur sobre video) de motionsites.ai.
- 4 videos generados con Higgsfield API (Kling 2.5 Turbo Pro) via `npm run videos`: noir (hero), garganta (servicios),
  hero (fondo del contacto), vortex (logo con blend lighten). Recodificados con `npm run encode` (scrub = -g 1).
- Secciones: hero, manifiesto (definición RAE de vorágine + 275 saltos / 80 m / 3 países), servicios (3 sets),
  rubros, proceso, contacto (form → WhatsApp prellenado), footer.

## Próximos pasos
- Completar datos reales en `src/main.js` → CONTACT (WhatsApp, email, Instagram).
- Feedback del usuario sobre copy y look.
- Deploy (Vercel) + analítica (GA4 / Meta Pixel, hook `track()` ya listo).
