# Decisiones

## 2026-10-09 — Base: Avant Studio + Cortex, en vanilla
- Por qué: el usuario quiere "creativo y de conversión", valor percibido alto. Avant da lo creativo; Cortex la narrativa que vende.
- Descartado: React + Framer Motion (el template Cortex cargaba react@19 UMD, que no existe → 404). Vanilla es más liviano y fiel a Avant.
- Revisable: sí.

## 2026-10-09 — Concepto "vorágine = remolino de agua"
- Logo vivo = video de remolino (Higgsfield) con mix-blend-mode: lighten. Todo el contenido gira en torno a las Cataratas del Iguazú.

## 2026-10-09 — Videos scrubeados con todos los frames keyframe
- `-g 1` en ffmpeg para que video.currentTime sea instantáneo. El video noir se espeja (hflip) para que la cascada quede a la izquierda y el texto sobre negro.

## 2026-10-09 — Hero = montaje de planos, no un solo video scrubeado
- Por qué: un solo plano (aunque se mueva) se siente estático; cambios de plano = retención. Los planos corren en loop
  (movimiento constante) y el scroll dispara el corte (cortina vertical), así el scroll sigue teniendo protagonismo.
- Descartado: scrub puro del hero (v1 noir, v2 tucán). Se conservan como planos del montaje.
- Revisable: sí (orden/cantidad de planos).

## 2026-10-09 — Hero: un plano continuo con viaje (storytelling), no montaje de cortes
- Por qué: el usuario rechazó los cortes entre videos ("si es un cambio queda choto"); lo que retiene es un camino:
  el tucán (la marca) despega, atraviesa la bruma y llega a las Cataratas. El scroll avanza la historia.
- Cómo: Kling da 10 s por clip → tramo A + tramo B encadenado por image-to-video desde el último frame del A, xfade 0.15 s.
  El B se describe tal como salió el A (tucán bordó, pico oscuro) para evitar morphing.
- A/B/C del final (v1 revelación, v2 ascenso, v3 inmersión) elegible por `?hero=vN`. Pendiente de decisión.
- Descartado: montaje de 4 planos con cortina (commit 24ea6b1), scrub de un solo plano estático.
