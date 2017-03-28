/* eslint-env browser */
/* eslint no-console: off, strict: off */
/* global THREE, Stats*/
// 使用碰撞检测确定旋转面

'use strict';

/* Global Values */
const faceRatio = 1;

let canvasElement;
let renderer;
let scene;
let camera;
let mesh;

let topWall;
let frontWall;
let leftWall;
let backWall;
let rightWall;
let downWall;
let currentWall;

let hasWall = false;

let currentArray = [];
const allCubes = [];

const speed = 1;
const colors = [0xff3b30, 0xff9500, 0xffcc00, 0x4cd964, 0x5ac8fa, 0x007AFF, 0x5856D6, 0xFF2C55];

/* Tool Function */
function getCSSValue(element, property) {
  if (!(element instanceof HTMLElement)) {
    throw new TypeError(`${element} is not HTMLElement`);
  }
  if (typeof property !== 'string') {
    throw new TypeError(`${property} is not String`);
  }

  const valueStr = window.getComputedStyle(element, null)[property];
  return (parseInt(valueStr, 10));
}

function addKeydownEventsFor(_obj) {
  const innerObj = _obj;
  document.addEventListener('keydown', (event) => {
    const keyName = event.key || event.keyIdentifier;
    console.log(keyName);
    switch (keyName) {
      case 'ArrowLeft':
      case 'Left':
        event.preventDefault();
        innerObj.position.x -= 0.2;
        break;
      case 'ArrowRight':
      case 'Right':
        event.preventDefault();
        innerObj.position.x += 0.2;
        break;
      case 'ArrowUp':
      case 'Up':
        event.preventDefault();
        innerObj.position.y += 0.2;
        break;
      case 'ArrowDown':
      case 'Down':
        event.preventDefault();
        innerObj.position.y -= 0.2;
        break;
      case '[':
      case 'U+005B':
        innerObj.position.z -= 0.2;
        break;
      case ']':
      case 'U+005D':
        innerObj.position.z += 0.2;
        break;
      case 'x':
      case 'U+0058':
        innerObj.rotation.x += Math.PI * 0.1;
        break;
      case 'y':
      case 'U+0059':
        innerObj.rotation.y += Math.PI * 0.1;
        break;
      case 'z':
      case 'U+005A':
        innerObj.rotation.z += Math.PI * 0.1;
        break;
      default:
        break;
    }
  }, false);
}

function faces(faceCode) {
  let color = 'rgb(0, 0, 0)';
  switch (faceCode) {
    case 'U':
      color = 'rgb(255, 255, 255)';
      break;
    case 'F':
      color = 'rgb(0, 157, 84)';
      break;
    case 'R':
      color = 'rgb(220, 66, 47)';
      break;
    case 'D':
      color = 'rgb(253, 204, 9)';
      break;
    case 'L':
      color = 'rgb(255, 108, 0)';
      break;
    case 'B':
      color = 'rgb(61, 129, 246)';
      break;
    case 'N':
      color = 'rgb(0, 0, 0)';
      break;
    default:
      break;
  }
  const canvas = document.createElement('canvas');
  const outterWidth = 512;
  const innerWidth = 370;
  canvas.width = 512 * faceRatio;
  canvas.height = 512 * faceRatio;
  const ctx = canvas.getContext('2d');
  // Add texture background
  ctx.fillStyle = 'rgba(0,0,0,1)';
  ctx.fillRect(0, 0, outterWidth * faceRatio, outterWidth * faceRatio);
  ctx.rect(
    ((outterWidth - innerWidth) / 2) * faceRatio,
    ((outterWidth - innerWidth) / 2) * faceRatio,
    innerWidth * faceRatio, innerWidth * faceRatio);
  ctx.lineJoin = 'round';
  ctx.lineWidth = 100 * faceRatio;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.fill();
  // Add Text Label
  ctx.fillStyle = 'black';
  ctx.font = `Italic ${300 * faceRatio}px Times New Roman`;
  ctx.fillText(faceCode, 160 * faceRatio, 364 * faceRatio);
  return canvas;
}

/* Stats Function */
const stats = new Stats();
(() => {
  document.body.appendChild(stats.domElement);
})();

/* Cube Operation */
function changePivot(x, y, z, obj) {
  const wrapper = new THREE.Object3D();
  wrapper.position.set(x, y, z);
  wrapper.add(obj);
  obj.position.set(-x, -y, -z);
  return wrapper;
}

/* init Three.js */
function initThree() {
  canvasElement = document.querySelector('.main-canvas');
  renderer = new THREE.WebGLRenderer({
    antialiasing: true,
    canvas: canvasElement,
  });
  renderer.setSize(800, 700);
  renderer.setClearColor(0xFFFFFF);
  // renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setPixelRatio(4);
}

function initScene() {
  scene = new THREE.Scene();
}

function initCamera() {
  camera = new THREE.PerspectiveCamera(45, 8 / 7, 1, 50);
  camera.position.set(-6, 12, 16);
  // camera.position.set(12, -12, 16);
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

function addWalls() {
  if (!hasWall) {
    const geometryWall = new THREE.CubeGeometry(6, 1, 6);
    const materialWall = new THREE.MeshPhongMaterial({
      color: colors[0],
      emissive: 0x072534,
      wireframe: true,
      side: THREE.DoubleSide,
      visible: false,
    });
    topWall = new THREE.Mesh(geometryWall, materialWall);
    topWall.position.set(3, 6, 3);
    topWall.rotation.x = Math.PI;
    topWall.name = 'topWall';

    frontWall = new THREE.Mesh(geometryWall, materialWall);
    frontWall.position.set(3, 3, 6);
    frontWall.rotation.x = Math.PI * 0.5;
    frontWall.name = 'frontWall';

    leftWall = new THREE.Mesh(geometryWall, materialWall);
    leftWall.position.set(0, 3, 3);
    leftWall.rotation.z = Math.PI * 0.5;
    leftWall.name = 'leftWall';

    backWall = new THREE.Mesh(geometryWall, materialWall);
    backWall.position.set(3, 3, 0);
    backWall.rotation.x = Math.PI * 0.5;
    backWall.name = 'backWall';

    rightWall = new THREE.Mesh(geometryWall, materialWall);
    rightWall.position.set(6, 3, 3);
    rightWall.rotation.z = Math.PI * 0.5;
    rightWall.name = 'rightWall';

    downWall = new THREE.Mesh(geometryWall, materialWall);
    downWall.position.set(3, 0, 3);
    downWall.rotation.x = Math.PI;
    downWall.name = 'downWall';

    // 需要将碰撞墙加在 scene 中，加入 mesh 会特别诡异
    scene.add(topWall);
    scene.add(frontWall);
    scene.add(leftWall);
    scene.add(backWall);
    scene.add(rightWall);
    scene.add(downWall);
    hasWall = true;
  }
}

function initObject() {
  mesh = new THREE.Object3D();
  const geometryCube = new THREE.CubeGeometry(2, 2, 2, 2, 2, 2);

  // Create 27 cubes
  for (let x = 1; x <= 5; x += 2) {
    for (let y = 1; y <= 5; y += 2) {
      for (let z = 1; z <= 5; z += 2) {
        let cubeName = '';
        const myFaces = [];
        if (y === 5) {
          cubeName += 'U';
          myFaces[2] = faces('U');
          myFaces[5] = faces('N');
        }
        if (x === 1) {
          cubeName += 'L';
          myFaces[1] = faces('L');
          myFaces[0] = faces('N');
        }
        if (z === 5) {
          cubeName += 'F';
          myFaces[4] = faces('F');
          myFaces[3] = faces('N');
        }
        if (x === 5) {
          cubeName += 'R';
          myFaces[0] = faces('R');
          myFaces[1] = faces('N');
        }
        if (y === 1) {
          cubeName += 'D';
          myFaces[3] = faces('D');
          myFaces[2] = faces('N');
        }
        if (z === 1) {
          cubeName += 'B';
          myFaces[5] = faces('B');
          myFaces[4] = faces('N');
        }

        // Create MultiMaterial
        const materials = [];
        for (let i = 0; i < 6; i += 1) {
          const texture = (myFaces[i] === undefined) ?
            new THREE.Texture(faces('N')) : new THREE.Texture(myFaces[i]);
          texture.needsUpdate = true;
          // TODO: THREE.MultiMaterial has been removed. Use an Array instead.
          materials.push(new THREE.MeshBasicMaterial({
            map: texture,
            name: i,
          }));
        }
        const cubemat = new THREE.MultiMaterial(materials);
        const cube = new THREE.Mesh(geometryCube, cubemat);
        // TODO: 考虑对角块加入圆角
        cube.position.set(x, y, z);
        cube.name = cubeName;
        mesh.add(cube);
        allCubes.push(cube);
      }
    }
  }

  addWalls();
  scene.add(mesh);
}

function markUp(_obj) {
  const objInner = _obj;
  // console.log(objInner.name);
  for (let i = 0; i < objInner.material.materials.length; i += 1) {
    objInner.material.materials[i].opacity = 0.2;
    objInner.material.materials[i].transparent = true;
  }
}

function remarkUp(_obj) {
  const objInner = _obj;
  console.log(objInner.name);
  for (let i = 0; i < objInner.material.materials.length; i += 1) {
    objInner.material.materials[i].opacity = 1;
    objInner.material.materials[i].transparent = false;
  }
}

function showCurrentArrayContent() {
  const length = currentArray.length;
  for (let i = 0; i < length; i += 1) {
    markUp(currentArray[i]);
  }
  return (length);
}

function detection(dectWall) {
  // 使用碰撞检测识别
  const originPoint = dectWall.position.clone();
  for (let i = 0; i < dectWall.geometry.vertices.length; i += 1) {
    const localVertex = dectWall.geometry.vertices[i].clone();
    const globalVertex = localVertex.applyMatrix4(dectWall.matrix);
    const directionVector = globalVertex.sub(dectWall.position);
    const ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
    const collisionResults = ray.intersectObjects(allCubes, false);
    const resultsLength = collisionResults.length;
    if (resultsLength > 0) {
      for (let j = 0; j < resultsLength; j += 1) {
        if (currentArray.indexOf(collisionResults[j].object) < 0) {
          currentArray.push(collisionResults[j].object);
          console.log(currentArray.length);
        }
      }
    }
  }
}

function rotateFace(array) {
  let group = new THREE.Group();
  for (let i = 0; i < array.length; i += 1) {
    group.add(array[i]);
  }
  group = changePivot(0, 3, 3, group);
  group.rotation.x = Math.PI * 0.5;
  scene.add(group);
  group.updateMatrixWorld();
  for (let i = 0; i < 9; i += 1) {
    const cube = array.pop();
    cube.position.set(
      cube.getWorldPosition().x,
      cube.getWorldPosition().y,
      cube.getWorldPosition().z);
    cube.setRotationFromEuler(cube.getWorldRotation());
    mesh.add(cube);
    remarkUp(cube);
  }
  scene.remove(group);
}

function command(str) {
  switch (str) {
    case 'U':
      currentWall = topWall;
      break;
    case 'F':
      currentWall = frontWall;
      break;
    case 'R':
      currentWall = rightWall;
      break;
    case 'D':
      currentWall = downWall;
      break;
    case 'L':
      currentWall = leftWall;
      break;
    case 'B':
      currentWall = backWall;
      break;
    default:
      currentWall = null;
      throw (new TypeError('输入的命令不合法。'));
  }
  detection(currentWall);
  console.log(showCurrentArrayContent());
  rotateFace(currentArray);
  // return showCurrentArrayContent();
}

function render() {
  stats.begin();
  requestAnimationFrame(render);
  stats.end();
  // mesh.rotation.x += Math.PI / 180 * speed;
  // mesh.rotation.y += Math.PI / 180 * speed;
  // mesh.rotation.z += Math.PI / 180 * speed;
  // TODO: Rotate camera instead of mesh.
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
command('L');

// addKeydownEventsFor(allCubes[1]);
// addKeydownEventsFor(mesh);
