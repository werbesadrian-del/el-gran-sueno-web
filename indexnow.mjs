// Avisa a Bing, Yandex, Seznam y Naver (IndexNow) que el sitio cambió, así lo vuelven a leer ya.
// Bing es la base de ChatGPT, Copilot y DuckDuckGo. Correr DESPUÉS de que el deploy esté en vivo:
//   node indexnow.mjs
// La llave es el archivo 32799ebb68a971a087fbd78360608f16.txt de la raíz (tiene que seguir publicado).
import fs from 'fs';
const KEY = '32799ebb68a971a087fbd78360608f16';
const HOST = 'elgransueno.org';
const urls = [...fs.readFileSync('sitemap.xml', 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
urls.push('https://' + HOST + '/llms.txt');
const r = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: 'https://' + HOST + '/' + KEY + '.txt', urlList: urls }),
});
console.log('IndexNow:', r.status, r.status === 200 || r.status === 202 ? 'aviso recibido (' + urls.length + ' URLs)' : await r.text());
