import * as THREE from './three.module.min.js';

const kap = document.getElementById('gezegen');
if (kap) basla(kap);

function webglVar() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch (e) {
    return false;
  }
}

function basla(kap) {
  if (!webglVar()) return;
  const azHareket = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  kap.appendChild(renderer.domElement);

  const sahne = new THREE.Scene();
  const kamera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  kamera.position.set(0, 0, 4.6);

  // Güneş solda-üstte: gece tarafı (terminatör) gerçekçi görünsün
  const gunes = new THREE.DirectionalLight(0xfff1e0, 3.4);
  gunes.position.set(-3.2, 1.6, 2.6);
  sahne.add(gunes);
  sahne.add(new THREE.AmbientLight(0x2a1810, 0.35));

  const doku = new THREE.TextureLoader().load('assets/mars-2k.webp', () => {
    kap.classList.add('hazir');
    ciz();
  });
  doku.colorSpace = THREE.SRGBColorSpace;
  doku.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const mars = new THREE.Mesh(
    new THREE.SphereGeometry(1, 96, 96),
    new THREE.MeshStandardMaterial({ map: doku, roughness: 1, metalness: 0 })
  );
  mars.rotation.z = THREE.MathUtils.degToRad(25.2); // Mars'ın eksen eğikliği
  mars.rotation.y = 1.1;
  sahne.add(mars);

  // Atmosfer halesi: kenarda ince, soluk turuncu-mavimsi parıltı
  const hale = new THREE.Mesh(
    new THREE.SphereGeometry(1.045, 64, 64),
    new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: 'varying vec3 n;void main(){n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: 'varying vec3 n;void main(){float f=pow(0.72-dot(n,vec3(0.,0.,1.)),3.0);gl_FragColor=vec4(0.95,0.55,0.35,1.0)*f*0.55;}'
    })
  );
  sahne.add(hale);

  function boyutla() {
    const w = kap.clientWidth, h = kap.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    kamera.aspect = w / h;
    kamera.updateProjectionMatrix();
    ciz();
  }
  function ciz() { renderer.render(sahne, kamera); }

  new ResizeObserver(boyutla).observe(kap);
  boyutla();
  if (azHareket) return;

  let gorunur = true, onceki = performance.now();
  new IntersectionObserver((e) => { gorunur = e[0].isIntersecting; }).observe(kap);
  (function dongu(t) {
    requestAnimationFrame(dongu);
    const dt = Math.min((t - onceki) / 1000, 0.1);
    onceki = t;
    if (!gorunur || document.hidden) return;
    mars.rotation.y += 0.035 * dt;
    ciz();
  })(onceki);
}
