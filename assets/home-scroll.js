// CINE: la home es una sola escena 3D desde la portada.
// La Tierra real (texturas NASA: Blue Marble, relieve, luces de ciudades) queda fija detrás; la portada y el
// relato pasan por encima y una sola cámara viaja con el scroll. Cada movimiento responde a una frase:
//   portada                    -> amanecer sobre el horizonte del mundo
//   tu vida ya tenía un lugar  -> se enciende un punto de luz
//   comenzamos viendo          -> sale el sol y se ve el mundo con sus montañas
//   no fuiste diseñado para recorrerlo solo -> arcos de luz unen ciudades
//   El Gran Sueño              -> rayos de luz bajan del cielo, el nombre desciende y una onda enciende las
//                                 luces de las ciudades; al final la luz inunda la pantalla y se vuelve página.
// Three.js 0.160 + postprocessing 6.35 (God Rays) + GSAP 3.12. Sin WebGL, sin GSAP o con movimiento
// reducido no se activa nada: la página se ve como siempre.
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

  const LADOS = ['centro', 'arriba', 'izq', 'der', 'arriba', 'arriba', 'izq', 'der', 'arriba', 'centro'];
  secciones.forEach((s, i) => s.setAttribute('data-lado', LADOS[i] || 'centro'));
  const renglones = secciones.map((s) => {
    const lista = [];
    s.querySelectorAll('.st-small, .st-big').forEach((p) => {
      p.innerHTML = p.innerHTML.split(/<br\s*\/?>/i).map((t) => '<span class="renglon"><span class="renglon-in">' + t.trim() + '</span></span>').join('');
      lista.push(...p.querySelectorAll('.renglon-in'));
    });
    return lista;
  });

  // Línea de tiempo: de 0 a 1 es la portada; cada escena dura 1 y la final dura 2
  const ESC = secciones.length + 1;
  const DUR = 1 + ESC;
  const LARGO = 0.9;
  document.body.classList.add('cine-on');
  peli.classList.add('peli-on');
  const medir = () => { peli.style.height = ((ESC * LARGO + 1) * window.innerHeight) + 'px'; };
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
    return new THREE.Vector3(r * Math.cos(la) * Math.sin(lo), r * Math.sin(la), r * Math.cos(la) * Math.cos(lo));
  };

  // Texturas NASA (dominio público) servidas por three-globe en jsdelivr
  const IMG = 'https://cdn.jsdelivr.net/npm/three-globe@2.31.0/example/img/';
  const cargador = new THREE.TextureLoader();
  cargador.setCrossOrigin('anonymous');
  const uSol = new THREE.Vector3(0, 0.45, -1).normalize();
  const uOndaC = new THREE.Vector3(0, 0.97, 0.25).normalize();
  const uT = {
    uDia: { value: null }, uNoche: { value: null }, uRelieve: { value: null }, uAgua: { value: null },
    uSol: { value: uSol }, uOnda: { value: 0 }, uOndaC: { value: uOndaC }, uCiudades: { value: 0.9 },
    uListo: { value: 0 }, uBump: { value: movil ? 1.6 : 2.2 }
  };
  const vacia = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1); vacia.needsUpdate = true;
  uT.uDia.value = uT.uNoche.value = uT.uRelieve.value = uT.uAgua.value = vacia;
  const textura = (archivo, srgb) => new Promise((ok) => cargador.load(IMG + archivo, (t) => {
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    ok(t);
  }, undefined, () => ok(null)));
  Promise.all([textura('earth-blue-marble.jpg', true), textura('earth-night.jpg', true), textura('earth-topology.png', false), textura('earth-water.png', false)])
    .then(([dia, noche, relieve, agua]) => {
      if (!dia) return;
      uT.uDia.value = dia;
      if (noche) uT.uNoche.value = noche;
      if (relieve) uT.uRelieve.value = relieve;
      if (agua) uT.uAgua.value = agua;
      gsap.to(uT.uListo, { value: 1, duration: 1.4, ease: 'power2.out' });
    });

  const matTierra = new THREE.ShaderMaterial({
    uniforms: uT,
    vertexShader: `
      varying vec2 vUv; varying vec3 vNw; varying vec3 vPw;
      void main(){ vUv = uv; vNw = normalize(mat3(modelMatrix) * normal); vec4 w = modelMatrix * vec4(position,1.); vPw = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `
      uniform sampler2D uDia, uNoche, uRelieve, uAgua; uniform vec3 uSol, uOndaC;
      uniform float uOnda, uCiudades, uListo, uBump;
      varying vec2 vUv; varying vec3 vNw; varying vec3 vPw;
      void main(){
        vec3 ng = normalize(vNw);
        vec3 V = normalize(cameraPosition - vPw);
        // Relieve: las montañas se marcan con el mapa de altura (bump por derivadas)
        float h = texture2D(uRelieve, vUv).r;
        vec3 dpx = dFdx(vPw), dpy = dFdy(vPw);
        float dhx = dFdx(h), dhy = dFdy(h);
        vec3 r1 = cross(dpy, ng), r2 = cross(ng, dpx);
        float det = dot(dpx, r1);
        vec3 grad = sign(det) * (dhx * r1 + dhy * r2);
        vec3 n = normalize(abs(det) * ng - grad * uBump * 0.012);

        // Color: natural, apenas desaturado, sombras frías y firma verde pino
        vec3 c = texture2D(uDia, vUv).rgb;
        float L = dot(c, vec3(0.2126, 0.7152, 0.0722));
        c = mix(vec3(L), c, 0.86);
        float verde = smoothstep(0.0, 0.06, c.g - max(c.r, c.b));
        c = mix(c, c * vec3(0.84, 1.0, 0.9), verde * 0.65);
        float agua = texture2D(uAgua, vUv).r;
        c = mix(c, c * vec3(0.78, 0.9, 1.0) * 0.82, agua);

        float d = dot(n, uSol);
        float dia = smoothstep(-0.14, 0.3, dot(ng, uSol));
        vec3 luz = c * (0.03 + 1.2 * max(d, 0.0));
        float brillo = pow(max(dot(reflect(-uSol, n), V), 0.0), 38.0) * agua * dia;
        luz += vec3(1.0, 0.98, 0.95) * brillo * 0.55;

        // La onda de luz que baja del cielo: recorre el mundo desde donde toca
        float ang = acos(clamp(dot(ng, uOndaC), -1.0, 1.0));
        float dentro = uOnda > 0.0 ? smoothstep(uOnda, uOnda - 0.55, ang) : 0.0;
        float frente = uOnda > 0.0 ? smoothstep(0.09, 0.0, abs(ang - uOnda)) : 0.0;
        luz += c * 0.6 * dentro * (1.0 - dia);

        // Del lado de noche, las luces reales de las ciudades
        vec3 ciudades = pow(texture2D(uNoche, vUv).rgb, vec3(1.35)) * (uCiudades + dentro * 3.2) * (1.0 - dia);
        ciudades *= vec3(1.0, 0.93, 0.84);

        // Atmósfera en el borde
        float fres = pow(1.0 - max(dot(ng, V), 0.0), 4.0);
        vec3 borde = vec3(0.62, 0.78, 0.96) * fres * (0.12 + 0.9 * smoothstep(-0.35, 0.6, dot(ng, uSol)));

        vec3 col = (luz + ciudades) * uListo + borde + vec3(0.85, 0.92, 1.0) * frente * 0.45;
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`
  });
  tierra.add(new THREE.Mesh(new THREE.SphereGeometry(1, 160, 160), matTierra));

  // Atmósfera exterior: halo que toma la luz del sol (amanecer por detrás, día de frente)
  const atmosfera = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 96), new THREE.ShaderMaterial({
    uniforms: { uSol: { value: uSol }, uFuerza: { value: 1.25 } },
    vertexShader: 'varying vec3 vN; varying vec3 vNw; void main(){ vN = normalize(normalMatrix*normal); vNw = normalize(mat3(modelMatrix)*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'uniform vec3 uSol; uniform float uFuerza; varying vec3 vN; varying vec3 vNw; void main(){ float i = pow(clamp(-vN.z, 0.0, 1.0), 3.0); float s = clamp(dot(vNw, uSol) * 0.75 + 0.4, 0.05, 1.1); vec3 c = mix(vec3(0.5,0.7,0.95), vec3(1.0,0.97,0.94), clamp(s - 0.4, 0.0, 1.0)); float a = i * s * uFuerza; gl_FragColor = vec4(c * a, a); }',
    side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
  }));
  atmosfera.scale.setScalar(1.13);
  escena.add(atmosfera);

  // Estrellas
  const nE = movil ? 1400 : 2600, pe = new Float32Array(nE * 3);
  for (let i = 0; i < nE; i++) { const v = new THREE.Vector3().randomDirection().multiplyScalar(90 + Math.random() * 80); pe.set([v.x, v.y, v.z], i * 3); }
  const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.BufferAttribute(pe, 3));
  const estrellas = new THREE.Points(ge, new THREE.PointsMaterial({ color: 0xFAF8F5, size: movil ? 1.3 : 1.5, sizeAttenuation: false, transparent: true, opacity: 0.6, depthWrite: false }));
  escena.add(estrellas);

  // Ciudades y arcos: el camino compartido
  const CIUDADES = [
    [-58.4, -34.6], [-3.7, 40.4], [19.8, 41.3], [35.2, 31.8], [-77.0, -12.0], [-99.1, 19.4], [-74.0, 40.7],
    [-0.1, 51.5], [36.8, -1.3], [3.4, 6.5], [77.2, 28.6], [37.6, 55.8], [116.4, 39.9], [139.7, 35.7],
    [106.8, -6.2], [151.2, -33.9], [-46.6, -23.5], [18.4, -33.9], [15.3, -4.3], [121.0, 14.6], [29.0, 41.0],
    [55.3, 25.2], [100.5, 13.7], [-118.2, 34.0], [-74.1, 4.7], [38.7, 9.0], [127.0, 37.6], [-70.6, -33.4]
  ];
  const UNIONES = [[0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [5, 6], [6, 7], [3, 8], [8, 9], [3, 10], [7, 11], [10, 12], [12, 13],
    [10, 14], [14, 15], [0, 16], [16, 17], [9, 18], [13, 19], [2, 20], [3, 21], [10, 22], [5, 23], [4, 24], [8, 25], [12, 26], [0, 27]];
  const uComunes = { uPR: { value: PR }, uTiempo: { value: 0 }, uLugar: { value: 0 } };
  const nC = CIUDADES.length, pc = new Float32Array(nC * 3), ic = new Float32Array(nC);
  CIUDADES.forEach((c, i) => { const v = aXYZ(c[0], c[1], 1.006); pc.set([v.x, v.y, v.z], i * 3); ic[i] = i; });
  const gc = new THREE.BufferGeometry();
  gc.setAttribute('position', new THREE.BufferAttribute(pc, 3));
  gc.setAttribute('aIdx', new THREE.BufferAttribute(ic, 1));
  const matCiudades = new THREE.ShaderMaterial({
    uniforms: Object.assign({ uCiudades: { value: 0 } }, uComunes),
    vertexShader: 'attribute float aIdx; uniform float uCiudades, uPR, uTiempo; varying float vA; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vec3 vn = normalize(normalMatrix*position); float lit = clamp(uCiudades - aIdx, 0., 1.); vA = lit * (0.8 + 0.2*sin(uTiempo*2.0 + aIdx*1.7)) * smoothstep(0.0, 0.3, vn.z); gl_PointSize = 34.0 * uPR / (-mv.z); gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'varying float vA; void main(){ float d = length(gl_PointCoord-0.5); float a = (exp(-d*d*60.)*1.3 + exp(-d*d*9.)*0.3) * vA; gl_FragColor = vec4(vec3(0.82,0.9,1.0)*a, a); }',
    blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
  });
  tierra.add(new THREE.Points(gc, matCiudades));
  const arcos = UNIONES.map(([a, b]) => {
    const A = aXYZ(CIUDADES[a][0], CIUDADES[a][1]), B = aXYZ(CIUDADES[b][0], CIUDADES[b][1]);
    const ang = A.angleTo(B), N = 72, pos = new Float32Array(N * 3), tt = new Float32Array(N);
    for (let k = 0; k < N; k++) {
      const t = k / (N - 1);
      const v = A.clone().lerp(B, t).normalize().multiplyScalar(1.004 + Math.sin(Math.PI * t) * (0.07 + ang * 0.16));
      pos.set([v.x, v.y, v.z], k * 3); tt[k] = t;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aT', new THREE.BufferAttribute(tt, 1));
    const m = new THREE.ShaderMaterial({
      uniforms: { uProg: { value: 0 } },
      vertexShader: 'attribute float aT; varying float vT; void main(){ vT = aT; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader: 'uniform float uProg; varying float vT; void main(){ if (vT > uProg) discard; float cabeza = smoothstep(uProg-0.2, uProg, vT); float a = 0.4 + 1.1*cabeza; gl_FragColor = vec4(vec3(0.85,0.93,1.0)*a, a); }',
      blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
    });
    tierra.add(new THREE.Line(g, m));
    return m;
  });

  // Tu lugar: un punto de luz sobre el mundo
  const gLugar = new THREE.BufferGeometry();
  gLugar.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 1.008], 3));
  tierra.add(new THREE.Points(gLugar, new THREE.ShaderMaterial({
    uniforms: uComunes,
    vertexShader: 'uniform float uPR, uLugar, uTiempo; varying float vA; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vA = uLugar*(0.85+0.15*sin(uTiempo*2.4)); gl_PointSize = 110.0*uPR*uLugar/(-mv.z); gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'varying float vA; void main(){ float d = length(gl_PointCoord-0.5); float a = (exp(-d*d*110.)*1.4 + exp(-d*d*14.)*0.4) * vA; gl_FragColor = vec4(vec3(0.85,0.93,1.0)*a, a); }',
    blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
  })));

  // Fuente de los rayos: el sol del amanecer en la portada, la luz del cielo al final
  const fuente = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), new THREE.MeshBasicMaterial({ color: 0xFFFCF6, transparent: true, depthWrite: false }));
  escena.add(fuente);
  const compositor = new EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType });
  compositor.addPass(new RenderPass(escena, camara));
  const rayos = new GodRaysEffect(camara, fuente, {
    density: 0.96, decay: 0.9, weight: 0.4, exposure: 0.5, samples: movil ? 40 : 64,
    clampMax: 1.0, resolutionScale: movil ? 0.4 : 0.5, blur: true
  });
  compositor.addPass(new EffectPass(camara, rayos));

  // ---------- Cámara y luz por momento ----------
  // cz distancia; ex, ey dónde queda el planeta; h plano de horizonte (en el celular no se aleja)
  const K = [
    { cz: 2.45, cy: 0, ex: 0, ey: -1.34, h: 1 },   // portada: amanecer sobre el horizonte
    { cz: 13, cy: 0, ex: 0, ey: -0.1 },             // antes de que nacieras
    { cz: 4.8, cy: 0.15, ex: 0, ey: -0.62 },        // tu lugar
    { cz: 3.7, cy: 0, ex: 1, ey: 0 },
    { cz: 3.5, cy: 0.1, ex: -1, ey: 0 },
    { cz: 3.2, cy: 0, ex: 0, ey: -0.95 },           // comenzamos viendo
    { cz: 2.25, cy: 0, ex: 0, ey: -1.1, h: 1 },     // horizonte de día con montañas
    { cz: 3.5, cy: 0, ex: 1, ey: 0 },
    { cz: 3.7, cy: 0.1, ex: -1, ey: 0 },            // no fuiste diseñado para recorrerlo solo
    { cz: 5.6, cy: 0, ex: 0, ey: -0.4 },
    { cz: 2.45, cy: 0, ex: 0, ey: -1.36, h: 1 }     // El Gran Sueño
  ];
  const MEDIO = Math.tan(17.5 * Math.PI / 180);
  const ajustar = (k) => {
    if (movil) return { cz: k.h ? k.cz * 1.05 : k.cz * 1.55, cy: k.cy, ex: 0, ey: k.h ? k.ey * 0.98 : k.ey - 0.75 };
    const ancho = MEDIO * k.cz * camara.aspect;
    return { cz: k.cz, cy: k.cy, ex: k.ex ? Math.sign(k.ex) * ancho * 0.74 : 0, ey: k.ey };
  };
  const INICIO = { rot: 0.4, sol: 0, lugar: 0, arcos: 0, onda: 0, rayos: 0.5, fy: -0.5, fz: -3.2, alba: 0 };
  const S = Object.assign({}, INICIO, ajustar(K[0]));

  let tl = null, avance = 0;
  function armar() {
    if (tl) tl.kill();
    Object.assign(S, INICIO, ajustar(K[0]));
    tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
    tl.to(S, { rot: INICIO.rot + 3.0, duration: DUR, ease: 'none' }, 0);
    for (let i = 1; i < K.length; i++) {
      const k = ajustar(K[i]);
      tl.to(S, { cz: k.cz, cy: k.cy, ex: k.ex, ey: k.ey, duration: i === 1 ? 1 : 0.85 }, i === 1 ? 0 : i - 0.45);
    }
    // Texto del relato: la escena i empieza en i + 1
    renglones.forEach((lista, i) => {
      if (!lista.length) return;
      const t0 = i + 1;
      tl.fromTo(lista, { yPercent: 115, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.32, stagger: 0.06, ease: 'power3.out' }, t0 + 0.04 - (i === 0 ? 0.3 : 0));
      if (i < secciones.length - 1) tl.to(lista, { yPercent: -110, opacity: 0, duration: 0.26, stagger: 0.04, ease: 'power2.in' }, t0 + 0.74);
    });
    // Luz: el amanecer de la portada se apaga; noche hasta comenzamos viendo; sale el sol; atardece al final
    tl.to(S, { rayos: 0, duration: 0.6 }, 0.25);
    tl.to(S, { lugar: 1, duration: 0.4, ease: 'power2.out' }, 2.15).to(S, { lugar: 0, duration: 0.5 }, 4.6);
    tl.to(S, { sol: 1, duration: 0.95, ease: 'power1.inOut' }, 5.05);
    tl.to(S, { arcos: 1, duration: 1.9, ease: 'none' }, 8.05);
    tl.to(S, { sol: 0.12, duration: 0.9 }, 9.6);
    // El Gran Sueño baja del cielo: la fuente queda por encima de la pantalla y los rayos caen
    tl.set(S, { fy: 1.02, fz: -1.6 }, 10.0);
    tl.to(S, { rayos: 1, duration: 0.45, ease: 'power2.out' }, 10.05);
    tl.fromTo(nombre, { y: () => -window.innerHeight * 0.42, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' }, 10.2);
    tl.fromTo(nombre.querySelector('span'), { filter: 'blur(18px)', opacity: 0.1 }, { filter: 'blur(0px)', opacity: 1, duration: 0.4, ease: 'power2.out' }, 10.45);
    tl.to(S, { onda: Math.PI * 1.02, duration: 0.95, ease: 'power1.inOut' }, 10.7);
    tl.to(S, { alba: 1, duration: 0.42, ease: 'power2.in' }, DUR - 0.45);
    tl.progress(avance);
  }

  function tamano() {
    const w = window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    movil = w < 700;
    renderer.setSize(w, h, false);
    compositor.setSize(w, h, false);
    camara.aspect = w / h; camara.updateProjectionMatrix();
  }
  tamano(); armar();

  // ---------- Cuadro a cuadro ----------
  const reloj = new THREE.Clock();
  const vLugar = new THREE.Vector3();
  let lugarFijo = false, activo = true;
  function cuadro() {
    requestAnimationFrame(cuadro);
    if (document.hidden) return;
    // El scroll manda, de la portada al final del relato, con inercia de cámara
    const y = window.scrollY, vh = window.innerHeight;
    const inicio = peli.offsetTop, fin = inicio + peli.offsetHeight - vh;
    const meta = y < inicio ? (y / Math.max(1, inicio)) / DUR : (1 + Math.min(1, (y - inicio) / Math.max(1, fin - inicio)) * ESC) / DUR;
    const debe = y < fin + vh * 0.05;
    if (debe !== activo) { activo = debe; canvas.style.visibility = alba.style.visibility = activo ? 'visible' : 'hidden'; }
    if (!activo) return;
    avance += (meta - avance) * 0.1;
    if (Math.abs(meta - avance) < 0.00003) avance = meta;
    tl.progress(Math.min(1, avance));

    const t = reloj.getElapsedTime();
    uComunes.uTiempo.value = t;
    tierra.position.set(S.ex, S.ey, 0);
    tierra.rotation.set(0.38, S.rot + t * 0.01, 0);
    atmosfera.position.copy(tierra.position);
    camara.position.set(0, S.cy, S.cz);
    camara.lookAt(0, S.cy * 0.5, 0);
    estrellas.rotation.y = S.rot * 0.05;

    uSol.set(-0.55 * S.sol, 0.42, -1 + 1.75 * S.sol).normalize();
    fuente.position.set(0, S.fy, S.fz);
    rayos.blendMode.opacity.value = S.rayos;
    fuente.visible = S.rayos > 0.01;

    uComunes.uLugar.value = S.lugar;
    if (S.lugar > 0.001 && !lugarFijo) {
      vLugar.set(S.ex + 0.16, S.ey + 0.4, 0.9); tierra.worldToLocal(vLugar); vLugar.normalize().multiplyScalar(1.008);
      gLugar.attributes.position.setXYZ(0, vLugar.x, vLugar.y, vLugar.z); gLugar.attributes.position.needsUpdate = true;
      lugarFijo = true;
    }
    if (S.lugar <= 0.001) lugarFijo = false;

    const A = arcos.length;
    arcos.forEach((m, k) => { m.uniforms.uProg.value = Math.max(0, Math.min(1, S.arcos * (A * 0.42 + 1) - k * 0.42)); });
    matCiudades.uniforms.uCiudades.value = S.arcos * CIUDADES.length + (S.onda > 0 ? CIUDADES.length : 0);
    uT.uOnda.value = S.onda;
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
