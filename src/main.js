import './style.css'
import heroImg from './assets/hero.png'
import javascriptLogo from './assets/javascript.svg'
import viteLogo from './assets/vite.svg'

import * as THREE from 'three';

const canvas = document.getElementById('stage');
const statusLabel = document.getElementById('status');

// 1. Renderer Setup (Additive display: black clear color = transparent)
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(600, 600);
renderer.setPixelRatio(1);
renderer.setClearColor(0x000000, 0);

// 2. Scene & Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
camera.position.set(0, 0, 4.5);

// 3. Multi-Colored Cube (Distinct face colors to clearly see rotation)
const colorPalettes = [
  [0x00FF88, 0x00E5FF, 0xFF007F, 0xFFE600, 0xFF6600, 0x9D00FF], // Neon Cyber
  [0x00FF00, 0x33FF33, 0x66FF66, 0x99FF99, 0xCCFFCC, 0xFFFFFF], // Monochromatic Green
  [0xFF3333, 0xFF9933, 0xFFFF33, 0x33FF33, 0x3399FF, 0xCC33FF], // Spectrum
];
let currentPaletteIdx = 0;

function createMaterials(palette) {
  return palette.map(color => new THREE.MeshBasicMaterial({ 
    color, 
    wireframe: false, 
    transparent: true, 
    opacity: 0.85 
  }));
}

const geometry = new THREE.BoxGeometry(1.4, 1.4, 1.4);
const cubeMesh = new THREE.Mesh(geometry, createMaterials(colorPalettes[0]));
scene.add(cubeMesh);

// Add bright wireframe edges for waveguide legibility
const edges = new THREE.EdgesGeometry(geometry);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF, linewidth: 2 });
const wireframe = new THREE.LineSegments(edges, lineMaterial);
cubeMesh.add(wireframe);

// 4. Target Rotation State (Smooth interpolation)
const targetRotation = { x: 0, y: 0, z: 0 };
let tapTimer = null;

function setStatus(text) {
  statusLabel.textContent = text;
}

// 5. Gesture Input Handling via Key Events
window.addEventListener('keydown', (e) => {
  e.preventDefault(); // Prevent default browser scrolling

  switch (e.key) {
    case 'ArrowLeft': // Swipe Left
      targetRotation.y -= Math.PI / 2; // Rotate 90° Left
      setStatus('SWIPE LEFT: ROTATE Y -90°');
      break;

    case 'ArrowRight': // Swipe Right
      targetRotation.y += Math.PI / 2; // Rotate 90° Right
      setStatus('SWIPE RIGHT: ROTATE Y +90°');
      break;

    case 'ArrowUp': // Swipe Up / Turn
      targetRotation.z += Math.PI / 4; // Turn 45° around Z
      setStatus('SWIPE UP: TURN Z +45°');
      break;

    case 'ArrowDown': // Swipe Down / Turn
      targetRotation.z -= Math.PI / 4; // Turn 45° around Z
      setStatus('SWIPE DOWN: TURN Z -45°');
      break;

    case 'Enter': // Neural Band Pinch / Temple Tap
      if (tapTimer !== null) {
        // Double Tap Detected (< 320ms)
        clearTimeout(tapTimer);
        tapTimer = null;
        currentPaletteIdx = (currentPaletteIdx + 1) % colorPalettes.length;
        cubeMesh.material = createMaterials(colorPalettes[currentPaletteIdx]);
        setStatus(`DOUBLE TAP: PALETTE ${currentPaletteIdx + 1}`);
      } else {
        // First Tap -> Start debounce timer
        tapTimer = setTimeout(() => {
          tapTimer = null;
          // Single Tap Action: Reset orientation to (0, 0, 0)
          targetRotation.x = 0;
          targetRotation.y = 0;
          targetRotation.z = 0;
          setStatus('TAP: RESET TO (0, 0, 0)');
        }, 320);
      }
      break;
  }
});

// 6. 30 Hz Render Loop (Optimized for thermal & battery budget)
let lastFrameTime = 0;
const interval = 1000 / 30; // 33.3ms clamp

function animate(currentTime) {
  requestAnimationFrame(animate);
  const delta = currentTime - lastFrameTime;

  if (delta >= interval) {
    lastFrameTime = currentTime - (delta % interval);

    // Smoothly damp toward target orientation
    cubeMesh.rotation.x += (targetRotation.x - cubeMesh.rotation.x) * 0.15;
    cubeMesh.rotation.y += (targetRotation.y - cubeMesh.rotation.y) * 0.15;
    cubeMesh.rotation.z += (targetRotation.z - cubeMesh.rotation.z) * 0.15;

    renderer.render(scene, camera);
  }
}
requestAnimationFrame(animate);