/* eslint-env browser */
/* eslint no-console: off, strict: off*/
/* global THREE, Stats */

'use strict';

/* Stats Function */
const stats = new Stats();
(() => {
  document.body.appendChild(stats.domElement);
})();

/* Global Values */
let canvasElement;
let renderer;
let scene;
let camera;
let mesh;
const allCubes = [];

/* init Three.js */
function initThree() {
  canvasElement = document.querySelector('.main-canvas');
  renderer = new THREE.WebGLRenderer({
    antialiasing: true,
    canvas: canvasElement,
  });
  renderer.setSize(1200, 1200);
  renderer.setClearColor(0x000000);
  renderer.setPixelRatio(window.devicePixelRatio);
}

function initScene() {
  scene = new THREE.Scene();
}

function initCamera() {
  camera = new THREE.PerspectiveCamera(45, 1, 2, 50);
  camera.position.set(-6, 12, 20);
  camera.lookAt({ x: 3, y: 3, z: 3 });
  scene.add(camera);
}

function initLight() {
  const lights = [];
  lights[0] = new THREE.PointLight(0xffffff, 1, 0);
  lights[1] = new THREE.PointLight(0xffffff, 1, 0);
  lights[2] = new THREE.PointLight(0xffffff, 1, 0);

  lights[0].position.set(0, 200, 0);
  lights[1].position.set(100, 200, 100);
  lights[2].position.set(-100, -200, -100);

  scene.add(lights[0]);
  scene.add(lights[1]);
  scene.add(lights[2]);
}

function initObject() {
  mesh = new THREE.Object3D();
  const geometry = new THREE.CubeGeometry(2, 2, 2, 2, 2, 2);
  const material = new THREE.MeshPhongMaterial({
    color: 0x156289,
    emissive: 0x072534,
    wireframe: true,
  });

  const cube1 = new THREE.Mesh(geometry, material.clone());
  cube1.name = 'cube1';
  cube1.position.set(0, 0, 0);
  mesh.add(cube1);
  allCubes.push(cube1);

  const cube2 = new THREE.Mesh(geometry, material.clone());
  cube2.name = 'cube2';
  cube2.position.set(4, 0, 0);
  mesh.add(cube2);
  allCubes.push(cube2);

  scene.add(mesh);
}

function markUp(theObj) {
  const objInner = theObj;
  objInner.material.color = new THREE.Color(0xFFFFFF);
}

function detection() {
  const movingCube = allCubes[0];
  const originPoint = movingCube.position.clone();
  for (let i = 0; i < movingCube.geometry.vertices.length; i += 1) {
    const localVertex = movingCube.geometry.vertices[i].clone();
    const globalVertex = localVertex.applyMatrix4(movingCube.matrix);
    const directionVector = globalVertex.sub(movingCube.position);
    const ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
    const collisionResults = ray.intersectObjects(allCubes);
    if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
      console.log('crash');
      markUp(collisionResults[0].object);
      break;
    }
  }
}

function render() {
  stats.begin();
  requestAnimationFrame(render);
  detection();
  stats.end();

  renderer.render(scene, camera);
}

function startThree() {
  initThree();
  initScene();
  initCamera();
  initLight();
  initObject();
  renderer.clear();
  render();
}

startThree();

document.addEventListener('keydown', (event) => {
  const keyName = event.key;
  if (keyName === 'ArrowLeft') {
    event.preventDefault();
    allCubes[1].position.x -= 0.1;
  }
  if (keyName === 'ArrowRight') {
    event.preventDefault();
    allCubes[1].position.x += 0.1;
  }
}, false);
