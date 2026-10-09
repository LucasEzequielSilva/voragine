// Genera los videos de la landing con Higgsfield (Kling 2.5 Turbo Pro) y los baja a media/raw/.
// Uso: node --env-file=.env scripts/higgsfield.mjs [nombre...]
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const KEY = process.env.HIGGS;
if (!KEY) throw new Error("Falta HIGGS en .env (formato id:secret)");

const API = "https://api.higgsfield.ai";
const MODEL = "/kling-video/v2.5-turbo/pro/text-to-video";
const NEGATIVE =
  "text, letters, watermark, logo, people, tourists, boats, buildings, cuts, scene change, shaky camera, fisheye, blurry, low quality, oversaturated, cartoon, cgi look";

export const SHOTS = {
  // Hero + About: el video avanza con el scroll, se revelan las Cataratas.
  hero: `Ultra cinematic aerial drone shot at blue hour just before dawn. The camera glides slowly and steadily forward, low over a dense subtropical rainforest canopy wrapped in soft drifting mist. As it advances, the mist thins and reveals the immense Iguazu Falls: hundreds of white waterfalls cascading in a wide horseshoe through the jungle, a thick veil of spray rising into the cold blue air. Deep navy and teal palette, first faint light on the horizon, volumetric fog, shot on ARRI Alexa, anamorphic, 35mm, natural film grain, photorealistic, one continuous take, perfectly smooth camera motion, no cuts.`,
  // Hero estilo Avant: cascada que emerge de la oscuridad total, sujeto a la derecha del cuadro.
  noir: `Ultra cinematic low-key night shot of a single towering waterfall curtain at Iguazu Falls emerging from pure black darkness. The waterfall sits in the right half of the frame, the left half is deep black empty negative space. Cold silver moonlight rakes across the falling water, revealing every thread of white water and glowing mist against an absolute black background. The camera slowly and steadily pushes in and drifts slightly to the right. High contrast, black and silver with a faint teal tint, fine-art editorial photography look, shot on ARRI Alexa, anamorphic, natural film grain, photorealistic, one continuous take, perfectly smooth camera motion, no cuts.`,
  // Hero v2: retrato editorial de un tucán (rol de la modelo en Avant), sujeto en la mitad izquierda.
  tucan: {
    prompt: `Ultra cinematic editorial portrait of a toco toucan perched on a dark mossy branch, seen in elegant side profile, placed in the left third of the frame. Its huge glowing orange beak and glossy black feathers with a white throat stand out against an almost pure black background. Behind it, a faint veil of waterfall mist from Iguazu Falls drifts slowly, softly backlit with cold silver light. The right half of the frame is deep black empty negative space. The toucan slowly turns its head toward the camera and blinks, tiny mist droplets float through the light. The camera pushes in very slowly. Low-key fashion photography lighting, high contrast, shot on ARRI Alexa, 85mm lens, shallow depth of field, natural film grain, photorealistic, one continuous take, perfectly smooth motion, no cuts.`,
    negative: "text, letters, watermark, logo, people, multiple birds, cartoon, cgi look, bright background, daylight, cuts, scene change, shaky camera, blurry, low quality, deformed beak",
  },
  // Logo vivo: "vorágine" = remolino. Se usa con mix-blend-mode: lighten sobre negro.
  vortex: {
    duration: 5,
    prompt: `Top-down macro shot of a perfect swirling whirlpool vortex of crystal clear water spinning in the center of the frame against a pure absolute black background. Silver-white highlights trace the spiral currents and tiny droplets, studio lighting, the water glows white while everything around it is solid black. Hypnotic continuous rotation, seamless loop feel, minimal, elegant, photorealistic, macro lens, no camera movement, centered composition.`,
  },
  // Sección de servicios (sticky): descenso a la Garganta del Diablo.
  garganta: `Ultra cinematic drone shot slowly descending and pushing forward into the Devil's Throat at Iguazu Falls. A colossal curved curtain of white water plunges into a deep abyss, enormous clouds of mist billowing upward. Morning sunlight breaks through the spray and a soft rainbow appears in the mist. Deep blue shadows, luminous cyan water, crisp white foam, shot on ARRI Alexa, anamorphic lens, natural film grain, photorealistic, slow motion, one continuous take, perfectly smooth camera motion, no cuts.`,
};

const headers = { Authorization: `Key ${KEY}`, "Content-Type": "application/json" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generate(name, shot) {
  const { prompt, duration = 10, negative = NEGATIVE } = typeof shot === "string" ? { prompt: shot } : shot;
  const out = `media/raw/${name}.mp4`;
  if (existsSync(out)) return console.log(`[${name}] ya existe ${out}, salteo`);

  // Si ya se envió antes, retomamos el mismo request en vez de pagar otro.
  const stateFile = `media/raw/${name}.request.json`;
  let req = existsSync(stateFile) ? JSON.parse(await readFile(stateFile, "utf8")) : null;
  if (!req) {
    const res = await fetch(API + MODEL, {
      method: "POST",
      headers: { ...headers, "Idempotency-Key": `voragine-${name}-v1` },
      body: JSON.stringify({ prompt, negative_prompt: negative, duration, cfg_scale: 0.5 }),
    });
    if (!res.ok) throw new Error(`[${name}] submit ${res.status}: ${await res.text()}`);
    req = await res.json();
    await writeFile(stateFile, JSON.stringify(req, null, 2));
    console.log(`[${name}] enviado ${req.request_id}`);
  }

  let delay = 5000;
  for (;;) {
    await sleep(delay);
    delay = Math.min(delay * 1.3, 20000);
    const res = await fetch(req.status_url, { headers });
    if (!res.ok) { console.log(`[${name}] status ${res.status}, reintento`); continue; }
    const s = await res.json();
    if (s.status === "completed") {
      const video = await fetch(s.video.url);
      await writeFile(out, Buffer.from(await video.arrayBuffer()));
      return console.log(`[${name}] listo -> ${out}`);
    }
    if (["failed", "nsfw", "canceled"].includes(s.status))
      throw new Error(`[${name}] ${s.status}: ${s.error ?? ""}`);
    console.log(`[${name}] ${s.status}…`);
  }
}

await mkdir("media/raw", { recursive: true });
const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SHOTS);
const results = await Promise.allSettled(names.map((n) => generate(n, SHOTS[n])));
results.forEach((r) => r.status === "rejected" && console.error(r.reason.message));
if (results.some((r) => r.status === "rejected")) process.exit(1);
