/*
 * 3D model viewer for .model-stage[data-model] elements (created by script.js).
 * Loaded as an ES module only over http(s). Uses the vendored copy of three.js in /vendor.
 * - Models load lazily when they scroll near the viewport, and stop rendering when off-screen.
 * - data-interactive="full": drag/zoom/pan with OrbitControls (detail page).
 * - data-interactive="rotate": drag to rotate only (home showcase), page scroll is untouched.
 *   The model turns slowly on its own; after the visitor lets go, it waits briefly, glides back
 *   to its starting view and resumes turning.
 * - No data-interactive: the model slowly turns on its own.
 * - If WebGL or loading fails, the poster image simply stays visible.
 */
import * as THREE from "../vendor/three/build/three.module.min.js";
import { GLTFLoader } from "../vendor/three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "../vendor/three/addons/controls/OrbitControls.js";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const loader = new GLTFLoader();
const modelCache = new Map(); // url -> Promise<THREE.Object3D>

function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch (e) {
    return false;
  }
}

function loadModel(url) {
  if (!modelCache.has(url)) {
    modelCache.set(url, new Promise((resolve, reject) => loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject)));
  }
  return modelCache.get(url).then((scene) => scene.clone());
}

function mount(stage) {
  // data-interactive: "full" = rotate/zoom/pan; "rotate" = drag to rotate only, so page scrolling is never captured.
  const mode = stage.dataset.interactive;
  const interactive = mode === "full" || mode === "rotate";
  stage.classList.add("is-loading");

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const canvas = renderer.domElement;
  canvas.className = "model-canvas";
  canvas.setAttribute("aria-hidden", "true");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.001, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9aa0a8, 2.0));
  // Lights ride with the camera so the model stays well lit from every angle.
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(1, 1.5, 2);
  const rim = new THREE.DirectionalLight(0xffffff, 0.9);
  rim.position.set(-2, 0.5, -1);
  camera.add(key, rim);
  scene.add(camera);

  const pivot = new THREE.Group(); // turned by auto-rotation on cards
  scene.add(pivot);

  const RETURN_DELAY = 1500; // ms without interaction before the showcase model glides back
  const RETURN_TIME = 1400;  // ms the glide back to the starting view takes

  let controls = null;
  let home = null;  // starting camera placement (reset target)
  let glide = null; // active return-to-start animation
  let idleTimer = 0;
  let visible = true;
  let running = false;
  let last = performance.now();

  function resize() {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (!running) renderer.render(scene, camera);
  }

  function frame(now) {
    if (!visible || document.hidden) {
      running = false;
      return;
    }
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (glide) stepGlide(now);
    else if (controls) controls.update(dt);
    else if (!reduceMotion) pivot.rotation.y += dt * 0.35;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  // Smoothly move the camera back to its starting view. It travels around the model (spherical
  // interpolation, shortest way round) rather than through it, with ease-in-out timing.
  function returnHome(resumeSpin) {
    clearTimeout(idleTimer);
    if (!controls || !home) return;
    if (reduceMotion) {
      camera.position.copy(home.position);
      controls.target.copy(home.target);
      controls.update();
      renderer.render(scene, camera);
      return;
    }
    const from = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
    const to = new THREE.Spherical().setFromVector3(home.position.clone().sub(home.target));
    const turn = to.theta - from.theta;
    glide = {
      from, to,
      dTheta: Math.atan2(Math.sin(turn), Math.cos(turn)),
      fromTarget: controls.target.clone(),
      start: performance.now(),
      resumeSpin
    };
    start();
  }

  function stepGlide(now) {
    const t = Math.min((now - glide.start) / RETURN_TIME, 1);
    const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // ease in-out
    const lerp = THREE.MathUtils.lerp;
    controls.target.lerpVectors(glide.fromTarget, home.target, e);
    camera.position.setFromSpherical(new THREE.Spherical(
      lerp(glide.from.radius, glide.to.radius, e),
      lerp(glide.from.phi, glide.to.phi, e),
      glide.from.theta + glide.dTheta * e
    )).add(controls.target);
    camera.lookAt(controls.target);
    if (t >= 1) {
      controls.autoRotate = glide.resumeSpin && !reduceMotion;
      glide = null;
      controls.update();
    }
  }

  function start() {
    if (running || reduceMotion && !controls) {
      renderer.render(scene, camera);
      return;
    }
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }

  loadModel(stage.dataset.model).then((model) => {
    resize();
    // Centre the model and frame it.
    const box = new THREE.Box3().setFromObject(model);
    const centre = box.getCenter(new THREE.Vector3());
    model.position.sub(centre);
    pivot.add(model);
    // Fit the box in view from any turning angle: width is the box's horizontal diagonal.
    const size = box.getSize(new THREE.Vector3());
    const radius = size.length() / 2 || 1;
    const vHalf = THREE.MathUtils.degToRad(camera.fov / 2);
    const hHalf = Math.atan(Math.tan(vHalf) * camera.aspect);
    const width = Math.hypot(size.x, size.z);
    const fit = Math.max(size.y / 2 / Math.tan(vHalf), width / 2 / Math.tan(hHalf)) + width / 2;
    const distance = fit * (interactive ? 1.08 : 0.98);
    camera.position.set(1, 0.45, 1.15).normalize().multiplyScalar(distance);
    camera.near = distance / 100;
    camera.far = distance * 10;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    if (interactive) {
      controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.autoRotate = !reduceMotion;
      controls.autoRotateSpeed = mode === "rotate" ? 0.8 : 1.2; // ~75 s / ~50 s per turn
      controls.minDistance = radius * 0.6;
      controls.maxDistance = distance * 3;
      controls.addEventListener("start", () => {
        controls.autoRotate = false;
        glide = null; // grabbing the model cancels a glide in progress
        clearTimeout(idleTimer);
      });
      if (mode === "rotate") {
        // Let go -> wait a moment -> glide back to the start view -> keep turning slowly.
        controls.addEventListener("end", () => {
          clearTimeout(idleTimer);
          idleTimer = setTimeout(() => returnHome(true), RETURN_DELAY);
        });
      }
      if (mode === "rotate") {
        controls.enableZoom = false;
        controls.enablePan = false;
        canvas.style.touchAction = "pan-y"; // vertical swipes still scroll the page on phones
      }
      home = { position: camera.position.clone(), target: controls.target.clone() };
      canvas.addEventListener("dblclick", () => returnHome(mode === "rotate"));
      canvas.tabIndex = 0;
    }

    stage.prepend(canvas);
    resize();
    stage.classList.remove("is-loading");
    stage.classList.add("is-ready");
    stage.setAttribute("aria-label", stage.dataset.label);
    start();
  }).catch((err) => {
    stage.classList.remove("is-loading");
    console.warn("3D model could not be loaded; showing the image instead.", stage.dataset.model, err);
    renderer.dispose();
  });

  new ResizeObserver(resize).observe(stage);
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible && stage.classList.contains("is-ready")) start();
  }).observe(stage);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && visible && stage.classList.contains("is-ready")) start();
  });
}

const stages = document.querySelectorAll(".model-stage[data-model]");
if (webglAvailable()) {
  // Only start loading a model when its box comes near the viewport.
  const lazy = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      mount(entry.target);
    });
  }, { rootMargin: "300px" });
  stages.forEach((stage) => lazy.observe(stage));
} else {
  document.documentElement.classList.add("no-3d");
}
