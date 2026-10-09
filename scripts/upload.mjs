// Sube una imagen a Higgsfield y devuelve su public_url (para usar como image_url en image-to-video).
// Uso: node --env-file=.env scripts/upload.mjs ruta/frame.jpg
import { readFile } from "node:fs/promises";

const KEY = process.env.HIGGS;
const file = process.argv[2];
if (!KEY || !file) throw new Error("Uso: HIGGS en .env + ruta de imagen");

const content_type = file.endsWith(".png") ? "image/png" : "image/jpeg";
const res = await fetch("https://api.higgsfield.ai/files/generate-upload-url", {
  method: "POST",
  headers: { Authorization: `Key ${KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({ content_type }),
});
if (!res.ok) throw new Error(`generate-upload-url ${res.status}: ${await res.text()}`);
const { upload_url, upload_headers, public_url } = await res.json();

// La URL prefirmada no lleva credenciales de Higgsfield, solo los headers que devuelve.
const put = await fetch(upload_url, { method: "PUT", headers: upload_headers, body: await readFile(file) });
if (!put.ok) throw new Error(`upload ${put.status}: ${await put.text()}`);
console.log(public_url);
