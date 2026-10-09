// Recodifica media/raw/*.mp4 para la web. Los videos que se scrubean con el scroll van con
// todos los frames keyframe (-g 1) para que setear video.currentTime sea instantáneo.
import { mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

const JOBS = {
  // Montaje del hero: loops, no scrub
  tucan: { scrub: false, crf: 26 },
  noir: { scrub: false, crf: 26, vf: "hflip" }, // espejado: cascada a la izquierda
  mariposa: { scrub: false, crf: 26 },
  rio: { scrub: false, crf: 26 },
  garganta: { scrub: true },
  hero: { scrub: false, width: 1280, mobile: 720 }, // fondo en loop del contacto
  vortex: { scrub: false, vf: "crop=ih*0.62:ih*0.62", width: 320, mobile: null }, // logo
};

mkdirSync("public/video", { recursive: true });
const ff = (args) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });

for (const [name, job] of Object.entries(JOBS)) {
  const src = `media/raw/${name}.mp4`;
  if (!existsSync(src)) continue;
  const { scrub, vf, width = 1920, mobile = 960, crf = scrub ? 24 : 25 } = job;
  const filter = (w) => [vf, `scale=${w}:-2`].filter(Boolean).join(",");
  const gop = scrub ? ["-g", "1"] : ["-g", "48"];
  const common = ["-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", ...gop, "-movflags", "+faststart", "-preset", "slow"];

  ff(["-i", src, "-vf", filter(width), ...common, "-crf", String(crf), `public/video/${name}.mp4`]);
  if (mobile) ff(["-i", src, "-vf", filter(mobile), ...common, "-crf", "27", `public/video/${name}-mobile.mp4`]);
  ff(["-i", src, "-vf", filter(width), "-frames:v", "1", "-q:v", "3", `public/video/${name}.jpg`]);
  console.log(`✓ ${name}`);
}
