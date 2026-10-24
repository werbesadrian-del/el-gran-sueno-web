// CINE: la home cuenta, en un solo plano 3D, de la oscuridad a la luz y del cielo a la tierra.
// Guion en brand/web-home-guion-cine.md. Cinco actos:
//   1. Oscuridad: la Tierra sin luz y, arriba, una luz pequeña (El Gran Sueño de Dios).
//   2. La luz baja: al primer movimiento desciende, toca el planeta y el amanecer se extiende desde ahí.
//   3. Vida y color: el color aparece solo donde llegó la luz (verdes, montañas, mar).
//   4. Aventura: la cámara vuela bajo sobre el relieve y se dibuja un sendero, como alguien con mochila.
//   5. Gran Comisión: desde el final del sendero salen arcos a las naciones y las ciudades se encienden una
//      tras otra; aparece El Gran Sueño y la luz inunda la pantalla hasta volverse la página.
// Three.js 0.160 + postprocessing 6.35 (God Rays) + GSAP 3.12; texturas NASA (dominio público) en assets/tierra.
// Sin WebGL, sin GSAP o con movimiento reducido no se activa nada: la página se ve como siempre.
import * as THREE from 'three';
import { EffectComposer, RenderPass, EffectPass, GodRaysEffect } from 'postprocessing';

const peli = document.getElementById('pelicula');
const canvas = document.querySelector('.cine-tierra');
const alba = document.querySelector('.cine-alba');
const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const gsap = window.gsap;
let gl = null;
try { gl = canvas && canvas.getContext('webgl2', { alpha: false, antialias: false, depth: true, stencil: false, powerPreference: 'high-performance' }); } catch (e) { gl = null; }

if (peli && canvas && alba && !reduce && gsap && gl) iniciar();

function iniciar() {
  const escenario = peli.querySelector('.peli-escenario');
  const secciones = [...escenario.querySelectorAll(':scope > section')];
  const climax = secciones[secciones.length - 1];
  const nombre = climax.querySelector('.name-reveal');

  const LADOS = ['arriba', 'arriba', 'izq', 'der', 'arriba', 'arriba', 'arriba', 'arriba', 'arriba', 'centro'];
  secciones.forEach((s, i) => s.setAttribute('data-lado', LADOS[i] || 'centro'));
  const renglones = secciones.map((s) => {
    const lista = [];
    s.querySelectorAll('.st-small, .st-big').forEach((p) => {
      p.innerHTML = p.innerHTML.split(/<br\s*\/?>/i).map((t) => '<span class="renglon"><span class="renglon-in">' + t.trim() + '</span></span>').join('');
      lista.push(...p.querySelectorAll('.renglon-in'));
    });
    return lista;
  });

  // Línea de tiempo: de 0 a 1 la portada; cada escena dura 1 (la escena i empieza en i + 1); la final dura 2
  const ESC = secciones.length + 1;
  const DUR = 1 + ESC;
  const LARGO = 0.5;
  document.body.classList.add('cine-on');
  peli.classList.add('peli-on');
  const siguiente = peli.nextElementSibling;
  const medir = () => {
    peli.style.height = ((ESC * LARGO + 2) * window.innerHeight) + 'px';
    // La sección que sigue sube por encima de la luz que inundó la pantalla: sin escenario vacío entre medio
    if (siguiente) { siguiente.style.marginTop = (-window.innerHeight) + 'px'; siguiente.style.position = 'relative'; siguiente.style.zIndex = '7'; }
  };
  medir();

  // ---------- Render ----------
  let movil = window.innerWidth < 700;
  const PR = Math.min(window.devicePixelRatio || 1, movil ? 1.4 : 1.6);
  const renderer = new THREE.WebGLRenderer({ canvas, context: gl, antialias: false, powerPreference: 'high-performance', stencil: false, depth: true });
  renderer.setPixelRatio(PR);
  renderer.setClearColor(0x000000, 1);
  const escena = new THREE.Scene();
  const camara = new THREE.PerspectiveCamera(35, 1, 0.1, 400);
  const tierra = new THREE.Group();
  escena.add(tierra);
  const aXYZ = (lon, lat, r = 1) => {
    const la = lat * Math.PI / 180, lo = lon * Math.PI / 180;
    return new THREE.Vector3(r * Math.cos(la) * Math.cos(lo), r * Math.sin(la), -r * Math.cos(la) * Math.sin(lo));   // misma convención que el mapa de la esfera
  };

  // La luz llega desde arriba y se extiende por el mundo desde donde toca
  const uSol = new THREE.Vector3(0.3, 0.62, 0.72).normalize();
  const uRevelaC = new THREE.Vector3(0, 1, 0.15).normalize();
  const vacia = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1); vacia.needsUpdate = true;
  const uT = {
    uDia: { value: vacia }, uRelieve: { value: vacia }, uAgua: { value: vacia },
    uSol: { value: uSol }, uRevela: { value: 0 }, uRevelaC: { value: uRevelaC }, uListo: { value: 0 }, uBump: { value: movil ? 1.6 : 2.2 }
  };
  // Texturas NASA (dominio público, vía three-globe) comprimidas y guardadas en la web: 2k en el celular, 4k en computadora
  const IMG = '/assets/tierra/';
  const cargador = new THREE.TextureLoader();
  cargador.setCrossOrigin('anonymous');
  const textura = (archivo, srgb) => new Promise((ok) => cargador.load(IMG + archivo, (t) => {
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    ok(t);
  }, undefined, () => ok(null)));
  Promise.all([textura(movil ? 'tierra-dia-2k.webp' : 'tierra-dia-4k.webp', true), textura('tierra-relieve.webp', false), textura('tierra-agua.webp', false)])
    .then(([dia, relieve, agua]) => {
      if (!dia) return;
      uT.uDia.value = dia;
      if (relieve) uT.uRelieve.value = relieve;
      if (agua) uT.uAgua.value = agua;
      gsap.to(uT.uListo, { value: 1, duration: 1.2, ease: 'power2.out' });
    });

  const matTierra = new THREE.ShaderMaterial({
    uniforms: uT,
    vertexShader: `
      varying vec2 vUv; varying vec3 vNw; varying vec3 vPw;
      void main(){ vUv = uv; vNw = normalize(mat3(modelMatrix) * normal); vec4 w = modelMatrix * vec4(position,1.); vPw = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `
      uniform sampler2D uDia, uRelieve, uAgua; uniform vec3 uSol, uRevelaC;
      uniform float uRevela, uListo, uBump;
      varying vec2 vUv; varying vec3 vNw; varying vec3 vPw;
      void main(){
        vec3 ng = normalize(vNw);
        vec3 V = normalize(cameraPosition - vPw);
        // Relieve de las montañas (bump por derivadas del mapa de altura)
        float h = texture2D(uRelieve, vUv).r;
        vec3 dpx = dFdx(vPw), dpy = dFdy(vPw);
        float dhx = dFdx(h), dhy = dFdy(h);
        vec3 r1 = cross(dpy, ng), r2 = cross(ng, dpx);
        float det = dot(dpx, r1);
        vec3 grad = sign(det) * (dhx * r1 + dhy * r2);
        vec3 n = normalize(abs(det) * ng - grad * uBump * 0.012);

        // Color de la línea de Adrián: natural, sombras frías, firma verde pino
        vec3 c = texture2D(uDia, vUv).rgb;
        float L = dot(c, vec3(0.2126, 0.7152, 0.0722));
        c = mix(vec3(L), c, 0.88);
        float verde = smoothstep(0.0, 0.06, c.g - max(c.r, c.b));
        c = mix(c, c * vec3(0.84, 1.0, 0.9), verde * 0.65);
        float agua = texture2D(uAgua, vUv).r;
        c = mix(c, c * vec3(0.78, 0.9, 1.0) * 0.82, agua);

        // De la oscuridad a la luz: donde llegó la luz hay color; donde no, apenas una sombra gris
        float ang = acos(clamp(dot(ng, uRevelaC), -1.0, 1.0));
        float rev = smoothstep(uRevela, uRevela - 0.5, ang);
        float frente = uRevela > 0.001 ? smoothstep(0.22, 0.0, abs(ang - uRevela + 0.1)) * (1.0 - smoothstep(2.9, 3.3, uRevela)) : 0.0;
        vec3 base = mix(vec3(L) * 0.3, c, rev);
        float d = max(dot(n, uSol), 0.0);
        vec3 luz = base * (0.006 + 1.2 * d * mix(0.03, 1.0, rev));
        luz += vec3(1.0, 0.98, 0.95) * pow(max(dot(reflect(-uSol, n), V), 0.0), 38.0) * agua * rev * 0.55;
        luz += c * frente * 0.35 + vec3(0.92, 0.96, 1.0) * frente * 0.05;

        // Borde de atmósfera: un hilo de luz en la oscuridad, pleno cuando llegó el día
        float fres = pow(1.0 - max(dot(ng, V), 0.0), 4.0);
        vec3 borde = vec3(0.62, 0.78, 0.96) * fres * mix(0.14, 1.0, rev) * (0.2 + 0.8 * smoothstep(-0.4, 0.6, dot(ng, uSol)));

        gl_FragColor = vec4(luz * uListo + borde, 1.0);
        #include <colorspace_fragment>
      }`
  });
  tierra.add(new THREE.Mesh(new THREE.SphereGeometry(1, 160, 160), matTierra));

  // Atmósfera exterior, que también se enciende con la luz
  const uAtm = { uSol: { value: uSol }, uFuerza: { value: 0.2 } };
  const atmosfera = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 96), new THREE.ShaderMaterial({
    uniforms: uAtm,
    vertexShader: 'varying vec3 vN; varying vec3 vNw; void main(){ vN = normalize(normalMatrix*normal); vNw = normalize(mat3(modelMatrix)*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'uniform vec3 uSol; uniform float uFuerza; varying vec3 vN; varying vec3 vNw; void main(){ float i = pow(clamp(-vN.z, 0.0, 1.0), 3.0); float s = clamp(dot(vNw, uSol) * 0.6 + 0.55, 0.1, 1.1); float a = i * s * uFuerza; gl_FragColor = vec4(vec3(0.55,0.74,0.96) * a, a); }',
    side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
  }));
  atmosfera.scale.setScalar(1.13);
  escena.add(atmosfera);

  // Estrellas
  const nE = movil ? 1400 : 2600, pe = new Float32Array(nE * 3);
  for (let i = 0; i < nE; i++) { const v = new THREE.Vector3().randomDirection().multiplyScalar(90 + Math.random() * 80); pe.set([v.x, v.y, v.z], i * 3); }
  const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.BufferAttribute(pe, 3));
  const estrellas = new THREE.Points(ge, new THREE.PointsMaterial({ color: 0xFAF8F5, size: movil ? 1.3 : 1.5, sizeAttenuation: false, transparent: true, opacity: 0.55, depthWrite: false }));
  escena.add(estrellas);

  const uComunes = { uPR: { value: PR }, uTiempo: { value: 0 } };
  const puntoLuz = (tam) => new THREE.ShaderMaterial({
    uniforms: Object.assign({ uA: { value: 0 }, uTam: { value: tam } }, uComunes),
    vertexShader: 'uniform float uPR, uA, uTiempo, uTam; varying float vA; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vA = uA*(0.88+0.12*sin(uTiempo*2.4)); gl_PointSize = uTam*uPR/(-mv.z); gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'varying float vA; void main(){ float d = length(gl_PointCoord-0.5); float a = (exp(-d*d*140.)*1.5 + exp(-d*d*16.)*0.35) * vA; gl_FragColor = vec4(vec3(0.9,0.95,1.0)*a, a); }',
    blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
  });
  const unPunto = (mat, padre) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 1.01], 3)); const p = new THREE.Points(g, mat); padre.add(p); return p; };

  // Tu lugar: un punto de luz que se enciende
  const matLugar = puntoLuz(110);
  const lugar = unPunto(matLugar, tierra);

  // El sendero: un camino sobre el relieve que se dibuja mientras la cámara vuela bajo
  const matSendero = new THREE.ShaderMaterial({
    uniforms: { uProg: { value: 0 } },
    vertexShader: 'attribute float aT; varying float vT; void main(){ vT = aT; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'uniform float uProg; varying float vT; void main(){ if (vT > uProg) discard; float a = 0.7 + 0.9*smoothstep(uProg-0.12, uProg, vT); gl_FragColor = vec4(vec3(1.0,0.95,0.86)*a, a); }',
    blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
  });
  const sendero = new THREE.Line(new THREE.BufferGeometry(), matSendero);
  tierra.add(sendero);
  const matCaminante = puntoLuz(70);
  const caminante = unPunto(matCaminante, tierra);
  let caminoPts = [];

  // Ciudades de las naciones: se encienden una tras otra, cada una con un pulso
  const CIUDADES = [
    [-58.4, -34.6], [-3.7, 40.4], [19.8, 41.3], [36.3, 33.5], [35.9, 31.95], [35.5, 33.9], [31.2, 30.0], [36.16, 36.2], [23.7, 37.98], [12.5, 41.9], [-77.0, -12.0], [-99.1, 19.4], [-74.0, 40.7],
    [-0.1, 51.5], [36.8, -1.3], [3.4, 6.5], [77.2, 28.6], [37.6, 55.8], [116.4, 39.9], [139.7, 35.7],
    [106.8, -6.2], [151.2, -33.9], [-46.6, -23.5], [18.4, -33.9], [15.3, -4.3], [121.0, 14.6], [29.0, 41.0],
    [55.3, 25.2], [100.5, 13.7], [-118.2, 34.0], [-74.1, 4.7], [38.7, 9.0], [127.0, 37.6], [-70.6, -33.4]
  ];
  const JERUSALEN = aXYZ(35.2, 31.8);
  const nC = CIUDADES.length;
  const matCiudades = new THREE.ShaderMaterial({
    uniforms: Object.assign({ uAvance: { value: 0 } }, uComunes),
    vertexShader: `
      attribute float aT; attribute float aLugar; uniform float uAvance, uPR, uTiempo;
      varying float vLit; varying float vOla; varying float vLugar;
      void main(){
        vec4 mv = modelViewMatrix*vec4(position,1.); vec3 vn = normalize(normalMatrix*position);
        float paso = (uAvance - aT) * (aLugar > 0.5 ? 1.0 : 3.0);
        vLugar = aLugar;
        vLit = clamp(paso, 0., 1.) * smoothstep(0.0, 0.3, vn.z) * (0.85 + 0.15*sin(uTiempo*2.0 + aT*9.0));
        vOla = (aLugar > 0.5 && paso > 0.0 && paso < 1.0) ? paso : -1.0;
        gl_PointSize = (aLugar > 0.5 ? 150.0 : 14.0) * uPR / (-mv.z);
        gl_Position = projectionMatrix*mv;
      }`,
    fragmentShader: `
      varying float vLit; varying float vOla; varying float vLugar;
      void main(){
        float d = length(gl_PointCoord-0.5) * 2.0;
        float a = vLugar > 0.5 ? (exp(-d*d*900.)*1.6 + exp(-d*d*90.)*0.45) * vLit : smoothstep(1.0, 0.2, d) * vLit * 0.95;
        if (vOla >= 0.0) a += smoothstep(0.05, 0.0, abs(d - vOla*0.95)) * (1.0 - vOla) * 0.9 * step(0.01, vLit);
        gl_FragColor = vec4(mix(vec3(1.0,0.96,0.9), vec3(0.72,0.86,1.0), vLugar)*a, a);
      }`,
    blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
  });
  const gc = new THREE.BufferGeometry();
  tierra.add(new THREE.Points(gc, matCiudades));
  let arcos = [], generaciones = 1;

  // La fuente de luz: pequeña, arriba del mundo; al final queda en lo alto y sus rayos caen
  const fuente = new THREE.Mesh(new THREE.SphereGeometry(movil ? 0.022 : 0.035, 24, 24), new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, depthWrite: false }));
  escena.add(fuente);
  const TAM_HALO = movil ? 34 : 60;
  const matHalo = puntoLuz(TAM_HALO);
  const halo = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3)), matHalo);
  escena.add(halo);
  const compositor = new EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType, multisampling: Math.min(movil ? 2 : 4, renderer.capabilities.maxSamples || 0) });   // bordes suaves
  compositor.addPass(new RenderPass(escena, camara));
  const rayos = new GodRaysEffect(camara, fuente, {
    density: 0.97, decay: 0.94, weight: 0.32, exposure: 0.42, samples: movil ? 48 : 72,
    clampMax: 1.0, resolutionScale: movil ? 0.5 : 0.6, blur: true
  });
  compositor.addPass(new EffectPass(camara, rayos));

  // ---------- El viaje: la cámara va de un lugar real a otro ----------
  // mira: [longitud, latitud] del lugar que la cámara busca; tipo: 'vuelo' (bajo, como un dron sobre el relieve),
  // 'horizonte' (el mundo abajo) o 'orbita'. cz distancia; ex, ey dónde queda el planeta en pantalla.
  const ARGENTINA = [-65, -32];
  const K = [
    { cz: 3.6, ey: -1.05, mira: [35.2, 31.8], tipo: 'horizonte' },               // portada: la luz sobre Israel
    { cz: 2.05, ey: -1.08, mira: [35.2, 31.8], tipo: 'vuelo', fov: 40 },         // antes de que nacieras: Jerusalén de cerca
    { cz: 4.4, cy: 0.1, ey: -0.55, mira: [28, 24], tipo: 'orbita' },             // tu lugar: el amanecer avanza
    { cz: 3.7, ex: 1, mira: [8, 14], tipo: 'orbita' },                           // África y el Mediterráneo
    { cz: 3.5, cy: 0.1, ex: -1, mira: [-18, 2], tipo: 'orbita' },                // el Atlántico
    { cz: 3.1, ey: -0.9, mira: [-48, -16], tipo: 'horizonte' },                  // comenzamos viendo: América
    { cz: 2.05, ey: -1.1, mira: [-65.5, -24], tipo: 'vuelo', fov: 44, roll: 0.05 },  // los Andes del norte argentino
    { cz: 1.95, ey: -1.1, mira: [-70, -36], tipo: 'vuelo', fov: 46, roll: -0.05 },  // vuelo por la cordillera
    { cz: 2.3, ey: -1.05, mira: [-71.5, -45], tipo: 'vuelo', fov: 42, roll: 0.03 }, // la Patagonia: no fuiste diseñado para recorrerlo solo
    { cz: 5.4, ey: -0.35, mira: [-20, 12], tipo: 'orbita' },                     // la red de luz entre las naciones
    { cz: 2.45, ey: -1.36, mira: [-10, 22], tipo: 'horizonte' }                  // El Gran Sueño
  ];
  const MEDIO = Math.tan(17.5 * Math.PI / 180);
  const ajustar = (k) => {
    const h = k.tipo !== 'orbita';
    if (movil) return { cz: h ? k.cz * 1.05 : k.cz * 1.55, cy: k.cy || 0, ex: 0, ey: h ? k.ey * 0.98 : (k.ey || 0) - 0.75 };
    const ancho = MEDIO * k.cz * camara.aspect;
    return { cz: k.cz, cy: k.cy || 0, ex: k.ex ? Math.sign(k.ex) * ancho * 0.74 : 0, ey: k.ey || 0 };
  };
  // Giro e inclinación del planeta para que el lugar quede donde mira la cámara
  function orientar(k, rotPrevia) {
    const a = ajustar(k);
    const c = new THREE.Vector3(-a.ex, (a.cy || 0) - a.ey, a.cz).normalize();
    const meta = c.add(new THREE.Vector3(a.ex ? -Math.sign(a.ex) * 0.3 : 0, k.tipo === 'orbita' ? 0.35 : 0.95, 0)).normalize();
    const v = aXYZ(k.mira[0], k.mira[1]);
    let mejor = -2, rM = 0, iM = 0;
    for (let i = -0.7; i <= 0.7001; i += 0.02) {
      const ci = Math.cos(i), si = Math.sin(i);
      for (let r = 0; r < Math.PI * 2; r += 0.01) {
        const cr = Math.cos(r), sr = Math.sin(r);
        const x1 = v.x * cr + v.z * sr, z1 = -v.x * sr + v.z * cr;
        const y2 = v.y * ci - z1 * si, z2 = v.y * si + z1 * ci;
        const d = x1 * meta.x + y2 * meta.y + z2 * meta.z;
        if (d > mejor) { mejor = d; rM = r; iM = i; }
      }
    }
    if (rotPrevia !== undefined) { while (rM - rotPrevia > Math.PI) rM -= Math.PI * 2; while (rM - rotPrevia < -Math.PI) rM += Math.PI * 2; }
    return { rot: rM, incl: iM };
  }
  let giros = [];
  function calcularGiros() {
    giros = [];
    K.forEach((k, i) => giros.push(orientar(k, i ? giros[i - 1].rot : undefined)));
  }

  // Los nombres de los lugares: un guiño discreto
  const rotulos = [['Argentina', [-66.5, -29]]].map(([texto, ll]) => {
    const el = document.createElement('div');
    el.className = 'cine-rotulo'; el.textContent = texto; el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
    return { el, v: aXYZ(ll[0], ll[1], 1.01) };
  });

  // El sendero del mochilero por la cordillera: Humahuaca, Salta, Aconcagua, Neuquén, Bariloche, El Bolsón, El Chaltén
  const RUTA = [[-65.35, -23.2], [-65.4, -24.8], [-67.2, -28.5], [-69.9, -32.65], [-70.4, -36.5], [-70.9, -39.5], [-71.3, -41.1], [-71.5, -42.6], [-72.2, -45.6], [-72.9, -49.3]];
  function trazarSendero() {
    const curva = new THREE.CatmullRomCurve3(RUTA.map((p) => aXYZ(p[0], p[1], 1.004)));
    caminoPts = curva.getSpacedPoints(320).map((p) => p.normalize().multiplyScalar(1.0045));
    const pos = new Float32Array(caminoPts.length * 3), tt = new Float32Array(caminoPts.length);
    caminoPts.forEach((p, k) => { pos.set([p.x, p.y, p.z], k * 3); tt[k] = k / (caminoPts.length - 1); });
    sendero.geometry.dispose();
    sendero.geometry = new THREE.BufferGeometry();
    sendero.geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    sendero.geometry.setAttribute('aT', new THREE.BufferAttribute(tt, 1));
    // Compañeros de camino: luces que aparecen junto al sendero (no fuiste diseñado para recorrerlo solo)
    const cp = [], cu = [];
    for (let k = 0; k < 70; k++) {
      const u = 0.25 + Math.random() * 0.75, p = caminoPts[Math.floor(u * (caminoPts.length - 1))];
      const e = new THREE.Vector3(0, 1, 0).cross(p).normalize(), n = p.clone().cross(e).normalize();
      const r = 0.006 + Math.random() * 0.03, a = Math.random() * Math.PI * 2;
      const q = p.clone().addScaledVector(e, Math.cos(a) * r).addScaledVector(n, Math.sin(a) * r).normalize().multiplyScalar(1.005);
      cp.push(q.x, q.y, q.z); cu.push(Math.random());
    }
    gCompania.setAttribute('position', new THREE.Float32BufferAttribute(cp, 3));
    gCompania.setAttribute('aU', new THREE.Float32BufferAttribute(cu, 1));
  }
  const gCompania = new THREE.BufferGeometry();
  const matCompania = new THREE.ShaderMaterial({
    uniforms: Object.assign({ uComp: { value: 0 } }, uComunes),
    vertexShader: 'attribute float aU; uniform float uComp, uPR, uTiempo; varying float vA; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vA = clamp((uComp - aU) * 6.0, 0.0, 1.0) * (0.8 + 0.2*sin(uTiempo*2.6 + aU*40.0)); gl_PointSize = 22.0*uPR/(-mv.z); gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'varying float vA; void main(){ float d = length(gl_PointCoord-0.5); float a = (exp(-d*d*120.)*1.4 + exp(-d*d*18.)*0.3) * vA; gl_FragColor = vec4(vec3(1.0,0.95,0.86)*a, a); }',
    blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
  });
  tierra.add(new THREE.Points(gCompania, matCompania));

  // La red de luz que se multiplica desde Jerusalén (Hch 1:8)
  function trazarRed() {
    // La luz se multiplica desde Jerusalén (Hch 1:8): llega a 3 lugares cercanos; cada uno la lleva a 2 o 3
    // más que todavía no la tienen, y así se abre como una red. Cada lugar se enciende cuando le llega
    // (generación g llega en g + 1) y alrededor se encienden sus personas.
    const lugares = [JERUSALEN.clone()].concat(CIUDADES.map((c) => aXYZ(c[0], c[1])));
    const llegada = new Array(lugares.length).fill(-1), uniones = [];
    llegada[0] = 0;
    const cola = [{ v: JERUSALEN, gen: 0, idx: 0 }];
    while (cola.length) {
      const nodo = cola.shift();
      const libres = lugares.map((v, i) => i).filter((i) => llegada[i] < 0).sort((a, b) => lugares[a].angleTo(nodo.v) - lugares[b].angleTo(nodo.v));
      const cuantos = nodo.gen === 0 ? 3 : (nodo.gen % 2 ? 2 : 3);
      libres.slice(0, cuantos).forEach((i) => {
        llegada[i] = nodo.gen + 1;
        uniones.push({ A: nodo.v, B: lugares[i], gen: nodo.gen });
        cola.push({ v: lugares[i], gen: nodo.gen + 1, idx: i });
      });
    }
    generaciones = Math.max(...llegada) + 1;
    const pts = [], tiempos = [], tam = [];
    lugares.forEach((v, i) => {
      const w = v.clone().multiplyScalar(1.006); pts.push(w.x, w.y, w.z); tiempos.push(llegada[i]); tam.push(1);
      const e = new THREE.Vector3(0, 1, 0).cross(v).normalize(), nn = v.clone().cross(e).normalize();
      for (let k = 0; k < 26; k++) {
        const r = 0.012 + Math.random() * 0.075, a = Math.random() * Math.PI * 2;
        const q = v.clone().addScaledVector(e, Math.cos(a) * r).addScaledVector(nn, Math.sin(a) * r).normalize().multiplyScalar(1.005);
        pts.push(q.x, q.y, q.z); tiempos.push(llegada[i] + 0.12 + (r / 0.087) * 0.7 + Math.random() * 0.15); tam.push(0);
      }
    });
    gc.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    gc.setAttribute('aT', new THREE.Float32BufferAttribute(tiempos, 1));
    gc.setAttribute('aLugar', new THREE.Float32BufferAttribute(tam, 1));
    arcos.forEach((a) => { tierra.remove(a.linea); a.linea.geometry.dispose(); a.m.dispose(); });
    arcos = uniones.map(({ A, B, gen }) => {
      const ang = A.angleTo(B), M = 72, p = new Float32Array(M * 3), t2 = new Float32Array(M);
      for (let k = 0; k < M; k++) {
        const t = k / (M - 1);
        const v = A.clone().lerp(B, t).normalize().multiplyScalar(1.004 + Math.sin(Math.PI * t) * (0.04 + ang * 0.14));
        p.set([v.x, v.y, v.z], k * 3); t2[k] = t;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(p, 3));
      g.setAttribute('aT', new THREE.BufferAttribute(t2, 1));
      const m = new THREE.ShaderMaterial({
        uniforms: { uProg: { value: 0 } },
        vertexShader: 'attribute float aT; varying float vT; void main(){ vT = aT; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
        fragmentShader: 'uniform float uProg; varying float vT; void main(){ if (vT > uProg) discard; float a = 0.3 + 1.1*smoothstep(uProg-0.2, uProg, vT); gl_FragColor = vec4(vec3(0.78,0.9,1.0)*a, a); }',
        blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
      });
      const linea = new THREE.Line(g, m);
      tierra.add(linea);
      return { linea, m, gen };
    });
  }

  const INICIO = { revela: 0, altura: 0.95, cielo: 0, rayos: movil ? 0.42 : 0.75, lugar: 0, sendero: 0, compania: 0, arcos: 0, alba: 0, jer: 0, arg: 0, fov: 35, roll: 0 };
  const S = {};

  let tl = null, avance = 0;
  function armar() {
    if (tl) tl.kill();
    calcularGiros();
    Object.assign(S, INICIO, ajustar(K[0]), giros[0]);
    tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
    // La cámara viaja: cada tramo empieza un poco antes de la escena y llega cuando la frase ya está
    for (let i = 1; i < K.length; i++) {
      const k = ajustar(K[i]);
      tl.to(S, { cz: k.cz, cy: k.cy, ex: k.ex, ey: k.ey, rot: giros[i].rot, incl: giros[i].incl, fov: K[i].fov || 35, roll: K[i].roll || 0, duration: i === 1 ? 1.05 : 1.0, ease: 'sine.inOut' }, i === 1 ? 0 : i - 0.5);
    }
    renglones.forEach((lista, i) => {
      if (!lista.length) return;
      const t0 = i + 1;
      tl.fromTo(lista, { yPercent: 115, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.32, stagger: 0.06, ease: 'power3.out' }, t0 + 0.04 - (i === 0 ? 0.3 : 0));
      if (i < secciones.length - 1) tl.to(lista, { yPercent: -110, opacity: 0, duration: 0.26, stagger: 0.04, ease: 'power2.in' }, t0 + 0.74);
    });
    // La luz baja sobre Jerusalén, el amanecer se extiende con el viaje y llega el color
    tl.to(S, { altura: 0.015, duration: 0.65, ease: 'sine.inOut' }, 0.15);   // la luz sale de la piedrita y baja a la Tierra
    tl.to(S, { rayos: 0, duration: 0.7, ease: 'power1.out' }, 0.75);
    tl.to(S, { revela: 0.5, duration: 0.8, ease: 'power2.out' }, 0.78);
    tl.to(S, { revela: 3.4, duration: 4.6, ease: 'power1.inOut' }, 1.6);
    tl.to(S, { jer: 1, duration: 0.3 }, 1.0).to(S, { jer: 0, duration: 0.3 }, 1.75);
    tl.to(S, { lugar: 1, duration: 0.4, ease: 'power2.out' }, 2.2).to(S, { lugar: 0, duration: 0.5 }, 3.6);
    // Argentina: vuelo bajo por la cordillera y el sendero del mochilero; aparecen compañeros de camino
    tl.to(S, { arg: 1, duration: 0.3 }, 6.15).to(S, { arg: 0, duration: 0.3 }, 7.6);
    tl.to(S, { sendero: 1, duration: 2.6, ease: 'none' }, 6.3);
    tl.to(S, { compania: 1, duration: 0.9, ease: 'power1.out' }, 8.05);
    // La red de luz entre las naciones
    tl.to(S, { arcos: 1, duration: 1.8, ease: 'none' }, 8.9);
    // El Gran Sueño: la luz queda en lo alto, sus rayos caen, el nombre baja y la luz inunda la pantalla
    tl.set(S, { cielo: 1 }, 10.0);
    tl.to(S, { rayos: movil ? 0.6 : 0.9, duration: 0.5, ease: 'power2.out' }, 10.05);
    tl.fromTo(nombre, { y: () => -window.innerHeight * 0.42, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' }, 10.2);
    tl.fromTo(nombre.querySelector('span'), { filter: 'blur(18px)', opacity: 0.1 }, { filter: 'blur(0px)', opacity: 1, duration: 0.4, ease: 'power2.out' }, 10.45);
    const cta = climax.querySelector('.cine-cta');
    if (cta) tl.fromTo(cta, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 10.7);
    tl.to(S, { alba: 1, duration: 0.32, ease: 'power2.in' }, DUR - 0.32);
    tl.progress(avance);
  }

  function tamano() {
    const w = window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    movil = w < 700;
    renderer.setSize(w, h, false);
    compositor.setSize(w, h, false);
    camara.aspect = w / h; camara.updateProjectionMatrix();
  }
  tamano(); trazarSendero(); trazarRed(); armar();

  // ---------- Cuadro a cuadro ----------
  const vMeta = new THREE.Vector3(), vSal = new THREE.Vector3();
  const vLugar = new THREE.Vector3(), vJer = new THREE.Vector3(), vRot = new THREE.Vector3(), vCam = new THREE.Vector3();
  const reloj = new THREE.Clock();
  let lugarFijo = false, activo = true, fovPrevio = 35;
  function cuadro() {
    requestAnimationFrame(cuadro);
    if (document.hidden) return;
    const y = window.scrollY, vh = window.innerHeight;
    const inicio = peli.offsetTop, fin = inicio + peli.offsetHeight - 2 * vh;
    const meta = y < inicio ? (y / Math.max(1, inicio)) / DUR : (1 + Math.min(1, (y - inicio) / Math.max(1, fin - inicio)) * ESC) / DUR;
    // Al terminar el relato la luz cubre la pantalla y la sección siguiente sube por encima
    const pasada = y - fin;
    alba.style.visibility = pasada < vh ? 'visible' : 'hidden';
    if (pasada > 0) alba.style.opacity = '1';                     // aunque se baje rápido, la luz cubre todo
    escenario.style.visibility = pasada > 0 ? 'hidden' : 'visible';
    const debe = pasada < 2;
    if (debe !== activo) {
      activo = debe;
      canvas.style.visibility = activo ? 'visible' : 'hidden';
      rotulos.forEach((r) => { r.el.style.visibility = activo ? 'visible' : 'hidden'; });
    }
    if (!activo) return;
    avance += (meta - avance) * 0.085;
    if (Math.abs(meta - avance) < 0.00003) avance = meta;
    tl.progress(Math.min(1, avance));

    uComunes.uTiempo.value = reloj.getElapsedTime();
    tierra.position.set(S.ex, S.ey, 0);
    tierra.rotation.set(S.incl, S.rot, 0);
    tierra.updateMatrixWorld();
    atmosfera.position.copy(tierra.position);
    camara.position.set(0, S.cy, S.cz);
    camara.up.set(Math.sin(S.roll), Math.cos(S.roll), 0);
    camara.lookAt(0, S.cy * 0.5, 0);
    if (Math.abs(S.fov - fovPrevio) > 0.01) { camara.fov = S.fov; camara.updateProjectionMatrix(); fovPrevio = S.fov; }
    estrellas.rotation.y = S.rot * 0.05;

    // La luz: primero sobre Jerusalén y bajando hasta tocarla; al final, en lo alto de la pantalla
    vJer.copy(JERUSALEN).applyQuaternion(tierra.quaternion).normalize();
    // Sale de la piedrita del sendero (pequeña) y baja creciendo hasta tocar Jerusalén
    const k = Math.max(0, Math.min(1, (0.95 - S.altura) / 0.935)), ks = k * k * (3 - 2 * k);
    if (S.cielo > 0.5) { fuente.position.set(0, movil ? 0.82 : 0.9, -1.6); fuente.scale.setScalar(1); matHalo.uniforms.uTam.value = TAM_HALO; }
    else {
      vMeta.set(S.ex, S.ey, 0).addScaledVector(vJer, 1.015);
      const ls = window.__luzSendero;
      if (ls) {
        const zN = vCam.copy(vMeta).project(camara).z;
        vSal.set(ls.x / window.innerWidth * 2 - 1, -(ls.y / vh) * 2 + 1, zN).unproject(camara);
        fuente.position.copy(vSal).lerp(vMeta, ks);
      } else fuente.position.set(S.ex, S.ey, 0).addScaledVector(vJer, 1 + S.altura);
      fuente.scale.setScalar(0.3 + 0.7 * ks);
      matHalo.uniforms.uTam.value = TAM_HALO * (0.36 + 0.64 * ks);
    }
    halo.position.copy(fuente.position);
    matHalo.uniforms.uA.value = S.cielo > 0.5 ? 0.9 : Math.max(0, 1 - S.revela * 1.4);
    rayos.blendMode.opacity.value = S.rayos * (S.cielo > 0.5 ? 1 : 0.12 + 0.88 * ks);
    fuente.visible = S.rayos > 0.01;
    uRevelaC.copy(vJer);
    uT.uRevela.value = S.revela;
    // En los vuelos bajos la atmósfera se nota más en el horizonte
    uAtm.uFuerza.value = (0.18 + Math.min(1, S.revela / 2.2)) * (1 + Math.max(0, (S.fov - 35) / 10) * 0.5);

    matLugar.uniforms.uA.value = S.lugar;
    if (S.lugar > 0.001 && !lugarFijo) {
      vLugar.set(S.ex + 0.16, S.ey + 0.4, 0.9); tierra.worldToLocal(vLugar); vLugar.normalize().multiplyScalar(1.008);
      lugar.geometry.attributes.position.setXYZ(0, vLugar.x, vLugar.y, vLugar.z); lugar.geometry.attributes.position.needsUpdate = true;
      lugarFijo = true;
    }
    if (S.lugar <= 0.001) lugarFijo = false;

    // El mochilero por la cordillera y sus compañeros de camino
    matSendero.uniforms.uProg.value = S.sendero;
    const pC = caminoPts[Math.min(caminoPts.length - 1, Math.floor(S.sendero * (caminoPts.length - 1)))];
    if (pC) { caminante.geometry.attributes.position.setXYZ(0, pC.x * 1.002, pC.y * 1.002, pC.z * 1.002); caminante.geometry.attributes.position.needsUpdate = true; }
    matCaminante.uniforms.uA.value = S.sendero > 0.001 ? Math.max(0, 1 - S.arcos * 8) : 0;
    matCompania.uniforms.uComp.value = S.compania;

    // La luz se multiplica: cada generación de arcos sale cuando la anterior llegó
    const G = (generaciones + 0.9) * S.arcos;
    arcos.forEach((a) => { a.m.uniforms.uProg.value = Math.max(0, Math.min(1, G - a.gen)); });
    matCiudades.uniforms.uAvance.value = G;

    // Los nombres siguen a su lugar en pantalla y se apagan si el lugar queda del otro lado del mundo
    rotulos.forEach((r, i) => {
      const a = S.arg;
      if (a < 0.01) { r.el.style.opacity = '0'; return; }
      vRot.copy(r.v).applyMatrix4(tierra.matrixWorld);
      const frente = vCam.copy(camara.position).sub(tierra.position).normalize().dot(vRot.clone().sub(tierra.position).normalize());
      vRot.project(camara);
      r.el.style.transform = 'translate(' + ((vRot.x + 1) / 2 * window.innerWidth).toFixed(1) + 'px,' + ((1 - vRot.y) / 2 * vh).toFixed(1) + 'px)';
      r.el.style.opacity = (a * Math.max(0, Math.min(1, (frente - 0.1) * 4))).toFixed(3);
    });

    alba.style.opacity = S.alba.toFixed(3);
    compositor.render();
  }
  cuadro();

  let anchoPrevio = window.innerWidth;
  window.addEventListener('resize', () => {
    tamano();
    if (window.innerWidth !== anchoPrevio) { anchoPrevio = window.innerWidth; medir(); armar(); }
  });
}
