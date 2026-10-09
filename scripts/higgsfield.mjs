// Genera los videos de la landing con Higgsfield (Kling 2.5 Turbo Pro) y los baja a media/raw/.
// Uso: node --env-file=.env scripts/higgsfield.mjs [nombre...]
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";

// Fotograma de partida de los tramos B (lo deja scripts/upload.mjs)
const LAST_FRAME_URL = process.env.IMG || (existsSync("media/raw/vuelo_a-last.url") ? readFileSync("media/raw/vuelo_a-last.url", "utf8").trim() : undefined);

const KEY = process.env.HIGGS;
if (!KEY) throw new Error("Falta HIGGS en .env (formato id:secret)");

const API = "https://api.higgsfield.ai";
const MODEL = "/kling-video/v2.5-turbo/pro/text-to-video";
const I2V = "/kling-video/v2.5-turbo/pro/image-to-video";
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
  // Montaje del hero — plano 2: mariposas (Iguazú es famosa por ellas).
  mariposa: {
    prompt: `Ultra cinematic macro shot of a metallic blue morpho butterfly slowly opening and closing its iridescent wings while perched on a wet dark leaf, placed in the left half of the frame against an almost pure black background. Tiny droplets of waterfall mist drift and sparkle in a beam of cold light, a few more butterflies flutter softly out of focus in the darkness. The camera slowly orbits and pushes in. The right half of the frame stays deep black. Low-key editorial lighting, high contrast, shot on ARRI Alexa, macro 100mm lens, shallow depth of field, natural film grain, photorealistic, slow motion, one continuous take, no cuts.`,
    negative: "text, letters, watermark, logo, people, cartoon, cgi look, bright background, daylight, cuts, scene change, shaky camera, blurry, low quality, deformed wings",
  },
  // Montaje del hero — plano 4: la vorágine real, remolino del río bajo la Garganta.
  rio: `Ultra cinematic top-down aerial drone shot looking straight down at the dark churning river below the Devil's Throat at Iguazu Falls. Thick white foam swirls into a giant spiral whirlpool on the deep black-green water, mist drifting across the frame, the spiral sits in the left half of the frame. The camera slowly rotates and descends toward the vortex. Moody low-key light, high contrast, deep blacks, shot on ARRI Alexa, natural film grain, photorealistic, one continuous take, perfectly smooth motion, no cuts.`,
  // Hero v3 — viaje continuo en 2 tramos encadenados (el B arranca del último frame del A).
  vuelo_a: {
    prompt: `Ultra cinematic continuous tracking shot, one single take. It opens on a toco toucan perched in elegant side profile on a dark mossy branch in the left third of the frame, low-key lighting, almost pure black background with slow drifting waterfall mist. The toucan leans forward, spreads its wings and takes flight toward the right and into the depth of the frame; the camera smoothly follows right behind it, flying through dark subtropical jungle, mist and shafts of cold silver light sweeping past, droplets sparkling. The toucan keeps gliding ahead in frame while the jungle slowly gets brighter and more misty, as if approaching a giant waterfall. Smooth steadicam-like camera motion, no cuts, photorealistic, shot on ARRI Alexa, anamorphic, natural film grain.`,
    negative: "text, letters, watermark, logo, people, buildings, cuts, scene change, cartoon, cgi look, deformed bird, extra wings, extra legs, shaky camera, blurry, low quality, daylight at the start",
  },
  // Tramo B — tres propuestas A/B/C (prompts afinados por panel de agentes), mismo frame de partida.
  vuelo_b1: { model: I2V, image_url: LAST_FRAME_URL, prompt: "Seamless continuation of the same unbroken tracking shot, one continuous take: same anamorphic lens, same cold silver light from the upper left, same low-key dark teal grading, constant exposure, same slow steadicam-like forward glide. The camera glides straight ahead behind the same toucan (dark maroon plumage, yellow throat, dark red-edged bill, teal wing coverts), flying on with slow wingbeats, then gliding. First the mossy foreground trunk, hanging vines and palm fronds slide out past the left edge. Then the last trees slip past on both sides and the mist thins; the tall misty waterfall behind the trunk comes into full view and widens, more waterfalls appearing beyond it, until the colossal Iguazu Falls spread across the view ahead: hundreds of white waterfalls pouring over jungle-crowned tiers of dark basalt in a vast horseshoe, the Devil's Throat dead ahead, towering spray clouds rising from the gorge, a faint pale rainbow in the mist. The toucan peels away to the left, wings tilting, growing smaller as it glides out of the left edge of frame, while the camera holds its straight course. In the final seconds the camera pushes slowly toward the heart of the Devil's Throat, fine spray drifting past the lens, the massive falls filling the frame. Photorealistic, shot on ARRI Alexa, natural film grain, perfectly smooth motion.", negative: "text, letters, watermark, logo, people, tourists, boats, buildings, walkways, railings, cut, jump cut, scene change, transition, fade, flicker, sudden brightness change, abrupt color shift, warm sunset light, golden hour, clear blue sky, harsh sunlight, oversaturated, double rainbow, cartoon, cgi look, 3d render, morphing, deformed bird, deformed wings, distorted beak, orange beak, extra wings, extra birds, second toucan, flock, camera shake, whip pan, zoom out, static image, letterbox, black bars, low quality", cfg_scale: 0.6 },
  vuelo_b2: { model: I2V, image_url: LAST_FRAME_URL, prompt: "Seamless continuation of the same shot. Photorealistic, ARRI Alexa, anamorphic lens, fine film grain, cold silver-blue grade, low-key exposure held constant. The same toucan, yellow throat, red-edged dark bill, teal wing coverts, glides to the right past a dark mossy trunk in the left foreground, a tall misty waterfall behind it, dark jungle around. At first nothing changes: the camera keeps tracking forward and right at the same slow pace, the toucan gives slow shallow wingbeats, the trunk drifts out of the left edge. Then the camera begins to rise while still pushing forward, climbing beside the toucan; mist and pale light shafts sink away below, the last treetops pass beneath the camera. Above the canopy the land opens out: the whole horseshoe of Iguazu Falls curves across the view ahead, the tall waterfall now one of hundreds pouring over a dark cliff, the Devil's Throat far ahead with a tall column of mist rising slowly, a thin band of cold gold first light on the horizon under a steel-blue sky, a faint rainbow in the spray. The toucan holds its course; as the camera overtakes it, the bird drifts toward the left edge of frame and slips out. The camera keeps advancing slowly and steadily, high and wide over the falls, sky still mostly dark.", negative: "cut, scene change, second bird, morphing bird, distorted beak, deformed wings, text, watermark, logo, people, boats, walkways, railings, buildings, helicopter, bright daylight, orange sky, overexposed, flicker, shaky camera, cartoon", cfg_scale: 0.6 },
  vuelo_b3: { model: I2V, image_url: LAST_FRAME_URL, prompt: "One continuous take, already in motion on the first frame: the camera keeps tracking right and forward at the same steady speed, behind the toucan, as the dark foreground trunk slides out of the left edge and the bird glides fully into view on spread wings. Same bird throughout: dark maroon body, yellow throat, dark bill with a red tip, silver and teal wings. After one second the toucan tips its bill down and dives steeply forward and down, wings swept half back; the camera pitches down and follows at the same distance, the canopy rushing up past the frame. Below, a deep gorge opens: colossal curtains of white water fall on both sides and grow taller as the camera drops, cold silver light scattering in the spray. Dense pale mist floods the frame, almost white; the toucan banks left and vanishes into it. The camera keeps descending through the mist and tilts to look straight down: directly below, white foam spirals in a slow whirlpool on near-black river water. The camera sinks toward the dark eye of the whirlpool until black water fills the frame, the last foam streaks dimming. Photorealistic, ARRI Alexa, anamorphic lens, fine film grain, low-key cold grading, smooth steadicam motion, no cuts.", negative: "text, watermark, logo, people, boats, buildings, walkways, railings, second bird, flock, extra wings, deformed beak, orange beak, morphing, scene change, cut, freeze frame, static camera, shaky camera, slow motion, warm sunlight, rainbow, bright sky, snow, cartoon, cgi look", cfg_scale: 0.6 },
  // "Río arriba" — recorrido continuo por Iguazú (6 clips encadenados). Parada 1: la ciudad de noche.
  iguazu_1: {
    prompt: `Ultra cinematic continuous steadicam shot, one single take, night in Puerto Iguazu, Argentina. The camera glides slowly forward at walking height along a lively open-air night market street (the Feirinha) by the riverside: strings of warm bulbs and neon signs in cyan, magenta and orange reflect on wet black pavement after light rain, craft stalls, hanging lanterns, steam from street food, lush tropical plants and palm trees between the stalls. People are only soft silhouettes and motion-blurred figures passing by. Fine drizzle sparkles in the lights. Toward the end the camera keeps advancing and the street opens onto a dark riverside promenade, the wide black river and the distant lights of two other cities glittering across the water. Deep blacks, moody teal and amber palette, anamorphic lens flares, shallow depth of field, shot on ARRI Alexa, natural film grain, photorealistic, perfectly smooth motion, no cuts.`,
    negative: "text, letters, readable signs, watermark, logo, close-up faces, recognizable people, crowd staring at camera, cuts, scene change, cartoon, cgi look, daylight, blurry, low quality, shaky camera, cars",
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
  const { prompt, duration = 10, negative = NEGATIVE, model = MODEL, image_url, cfg_scale = 0.5 } = typeof shot === "string" ? { prompt: shot } : shot;
  if (model.includes("image-to-video") && !image_url) throw new Error(`[${name}] falta la URL del frame de partida (scripts/upload.mjs o IMG)`);
  if (prompt.startsWith("__")) throw new Error(`[${name}] prompt sin completar`);
  const out = `media/raw/${name}.mp4`;
  if (existsSync(out)) return console.log(`[${name}] ya existe ${out}, salteo`);

  // Si ya se envió antes, retomamos el mismo request en vez de pagar otro.
  const stateFile = `media/raw/${name}.request.json`;
  let req = existsSync(stateFile) ? JSON.parse(await readFile(stateFile, "utf8")) : null;
  if (!req) {
    const res = await fetch(API + model, {
      method: "POST",
      headers: { ...headers, "Idempotency-Key": `voragine-${name}-v1` },
      body: JSON.stringify({ prompt, negative_prompt: negative, duration, cfg_scale, ...(image_url && { image_url }) }),
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
