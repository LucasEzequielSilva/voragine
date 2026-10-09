// Une el tramo A con el tramo B elegido (vuelo_b3, "inmersión") en un solo plano con microfundido.
// Uso: node scripts/concat.mjs  → media/raw/viaje.mp4
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

const A = "media/raw/vuelo_a.mp4";
const FADE = 0.15;
const dur = (f) => parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());

for (const n of [3]) {
  const B = `media/raw/vuelo_b${n}.mp4`;
  if (!existsSync(B)) continue;
  const offset = (dur(A) - FADE).toFixed(3);
  execFileSync("ffmpeg", [
    "-y", "-loglevel", "error", "-i", A, "-i", B,
    "-filter_complex", `[0:v][1:v]xfade=transition=fade:duration=${FADE}:offset=${offset},format=yuv420p[v]`,
    "-map", "[v]", "-an", "-c:v", "libx264", "-crf", "16", "-preset", "slow", "media/raw/viaje.mp4",
  ], { stdio: "inherit" });
  console.log(`✓ viaje (${(dur("media/raw/viaje.mp4")).toFixed(1)} s)`);
}
