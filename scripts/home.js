/* eslint-env browser */
/* eslint no-console: off, strict: off */
/* global THREE, TWEEN, Stats*/
// 使用数组记录旋转面
// TODO: 添加面小块标记
// TODO: 检测是否还原
// TODO: 添加照相机移动轨迹

'use strict';

/* Global Values */
const faceRatio = 0.5;

let canvasElement;
let renderer;
let scene;
let dummy;
let camera;
let mesh;
let theCube;
let group;

let upArray = [];
let frontArray = [];
let rightArray = [];
let downArray = [];
let leftArray = [];
let backArray = [];

let queue = [];

const allCubes = [];
let loopID;

let isRotating = false;
// let autoRotate = true;
let autoRotate = false;

let duration = 40;

// const colors = [0xff3b30, 0xff9500, 0xffcc00, 0x4cd964, 0x5ac8fa, 0x007AFF, 0x5856D6, 0xFF2C55];

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

function cameraTest() {
  let time = 0;
  // document.addEventListener('keydown', (event) => {
    // 轨迹方程（设 y = 3 为中心轴）
    // var origin = camera.position.clone();
    // var alpha = Math.atan((origin.z - 3) / (origin.x - 3));
    // var x = (Math.cos(alpha + (Math.PI / 2)) * 15) + 3;
    // var z = (Math.sin(alpha + (Math.PI / 2)) * 15) + 3;


    // const keyName = event.key || event.keyIdentifier;
    // switch (keyName) {
    //   case 'o':
        // let alpha = Math.atan((origin.z - 3) / (origin.x - 3));
        let dummy = new THREE.Group;

        dummy.add(camera);
        scene.add(dummy);

        camera.position.set(0, 0, 0);
        camera.rotation.set(-Math.PI, 0, -Math.PI);

        dummy.position.set(-6, 12, 15);
        dummy.lookAt({ x: 3, y: 3, z: 3 });

        const tween = new TWEEN.Tween(dummy.position);
        tween.to({
          // x: 15,
          // y: 12,
          // z: 12,
        }, 1000);
        tween.onUpdate((e) => {
          time += 1;
          dummy.lookAt({ x: 3, y: 3, z: 3 });
          dummy.position.x = (Math.cos(time / 100) * 15) + 3;
          dummy.position.z = (Math.sin(time / 100) * 15) + 3;

          // console.log(e * 2000);
        });
        tween.onComplete(() => {
          // dummy.position.set(15, 12, 12);
        });
        tween.repeat(Infinity);
        tween.start();


        // camera.position.set(x, 12, z);
        // const tween = new TWEEN.Tween(camera.position);
        // tween.to({
        //   x: x,
        //   y: 12,
        //   z: z,
        // }, 1000);
        // tween.easing(TWEEN.Easing.Quartic.Out);
        // tween.onUpdate((e) => {
        //   camera.lookAt({ x: 3, y: 3, z: 3 });
        // });
        // tween.onComplete(() => {
        //   camera.position.set(x, 12, z);
        // });
        // tween.start();

    //     break;
    //   case 'p':
    //     camera.position.set(x, 12, z);
    //     break;
    //   default:
    //     break;
    // }
  // });
}

function addKeydownEventsFor(_obj) {
  const innerObj = _obj;
  document.addEventListener('keydown', (event) => {
    const keyName = event.key || event.keyIdentifier;
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

function markUpCube(_obj) {
  const objInner = _obj;
  for (let i = 0; i < objInner.material.materials.length; i += 1) {
    objInner.material.materials[i].opacity = 0.2;
    objInner.material.materials[i].transparent = true;
  }
}

function remarkUpCube(_obj) {
  const objInner = _obj;
  for (let i = 0; i < objInner.material.materials.length; i += 1) {
    objInner.material.materials[i].transparent = false;
  }
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
  renderer.setClearColor(0xffffff);
  renderer.setPixelRatio(window.devicePixelRatio);
}

function initScene() {
  scene = new THREE.Scene();
}

function initCamera() {
  camera = new THREE.PerspectiveCamera(45, 8 / 7, 1, 50);
  camera.position.set(-6, 12, 15);
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

function getFace(faceCode) {
  let color = 'rgb(0, 0, 0)';
  switch (faceCode) {
    case 'U':
      color = 'rgb(255, 255, 255)';
      break;
    case 'F':
      color = 'rgb(2, 189, 86)';
      break;
    case 'R':
      color = 'rgb(255, 0, 22)';
      break;
    case 'D':
      color = 'rgb(253, 204, 9)';
      break;
    case 'L':
      color = 'rgb(255, 108, 0)';
      break;
    case 'B':
      color = 'rgb(0, 122, 255)';
      break;
    case 'N':
      color = 'rgba(0, 0, 0, 0)';
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
  ctx.font = `Italic ${200 * faceRatio}px Times New Roman`;
  ctx.fillText(faceCode, 160 * faceRatio, 364 * faceRatio);
  return canvas;
}

function createCubes() {
  const geometryCube = new THREE.CubeGeometry(2, 2, 2);
  for (let x = 1; x <= 5; x += 2) {
    for (let y = 1; y <= 5; y += 2) {
      for (let z = 1; z <= 5; z += 2) {
        let cubeName = '';
        const myFaces = [];
        if (y === 5) {
          cubeName += 'U';
          myFaces[2] = getFace('U');
          myFaces[5] = getFace('N');
        }
        if (x === 1) {
          cubeName += 'L';
          myFaces[1] = getFace('L');
          myFaces[0] = getFace('N');
        }
        if (z === 5) {
          cubeName += 'F';
          myFaces[4] = getFace('F');
          myFaces[3] = getFace('N');
        }
        if (x === 5) {
          cubeName += 'R';
          myFaces[0] = getFace('R');
          myFaces[1] = getFace('N');
        }
        if (y === 1) {
          cubeName += 'D';
          myFaces[3] = getFace('D');
          myFaces[2] = getFace('N');
        }
        if (z === 1) {
          cubeName += 'B';
          myFaces[5] = getFace('B');
          myFaces[4] = getFace('N');
        }

        // Create MultiMaterial
        const materials = [];
        for (let i = 0; i < 6; i += 1) {
          const texture = (myFaces[i] === undefined) ?
            new THREE.Texture(getFace('N')) : new THREE.Texture(myFaces[i]);
          texture.needsUpdate = true;
          // TODO: THREE.MultiMaterial has been removed. Use an Array instead.
          materials.push(new THREE.MeshBasicMaterial({
            map: texture,
            name: i,
          }));
        }
        const cubemat = new THREE.MultiMaterial(materials);
        const cube = new THREE.Mesh(geometryCube, cubemat);
        cube.position.set(x, y, z);
        cube.name = cubeName;
        mesh.add(cube);
        allCubes.push(cube);
      }
    }
  }
}

function createFacelets() {
  for (let i = 0; i <= 8; i += 1) {
    leftArray.push(allCubes[i]);
  }

  for (let i = 8; i >= 6; i -= 1) {
    for (let j = 0; j <= 18; j += 9) {
      upArray.push(allCubes[i + j]);
    }
  }

  for (let i = 2; i <= 8; i += 3) {
    for (let j = 0; j <= 18; j += 9) {
      frontArray.push(allCubes[i + j]);
    }
  }

  for (let i = 18; i <= 24; i += 3) {
    for (let j = 0; j >= -18; j -= 9) {
      backArray.push(allCubes[i + j]);
    }
  }

  for (let i = 0; i <= 2; i += 1) {
    for (let j = 0; j <= 18; j += 9) {
      downArray.push(allCubes[i + j]);
    }
  }

  for (let i = 20; i <= 26; i += 3) {
    for (let j = 0; j >= -2; j -= 1) {
      rightArray.push(allCubes[i + j]);
    }
  }
}

function initObject() {
  mesh = new THREE.Object3D();
  // Create 27 cubes
  createCubes();
  // Create 6 facelets
  createFacelets();

  theCube = changePivot(3, 3, 3, mesh);
  scene.add(theCube);
}

function rotateFaceObj(direction, clockDirection) {
  const array = direction.concat();
  const cd = clockDirection ? 1 : -1;
  group = new THREE.Group();
  for (let i = 0; i < array.length; i += 1) {
    group.add(array[i]);
  }

  switch (direction) {
    case leftArray:
      group = changePivot(0, 3, 3, group);
      break;
    case rightArray:
      group = changePivot(5, 3, 3, group);
      break;
    case upArray:
      group = changePivot(3, 5, 3, group);
      break;
    case downArray:
      group = changePivot(3, 1, 3, group);
      break;
    case frontArray:
      group = changePivot(3, 3, 5, group);
      break;
    case backArray:
      group = changePivot(3, 3, 1, group);
      break;
    default:
      break;
  }

  scene.add(group);

  const tween = new TWEEN.Tween(group.rotation);
  switch (direction) {
    case leftArray:
      tween.to({
        x: +(cd * (Math.PI * 0.5)),
      }, duration);
      break;
    case rightArray:
      tween.to({
        x: -(cd * (Math.PI * 0.5)),
      }, duration);
      break;
    case upArray:
      tween.to({
        y: -(cd * (Math.PI * 0.5)),
      }, duration);
      break;
    case downArray:
      tween.to({
        y: +(cd * (Math.PI * 0.5)),
      }, duration);
      break;
    case frontArray:
      tween.to({
        z: -(cd * (Math.PI * 0.5)),
      }, duration);
      break;
    case backArray:
      tween.to({
        z: +(cd * (Math.PI * 0.5)),
      }, duration);
      break;
    default:
      break;
  }
  tween.easing(TWEEN.Easing.Quartic.Out);

  tween.onUpdate(() => { isRotating = true; });

  tween.onComplete(() => {
    isRotating = false;
    switch (direction) {
      case leftArray:
        group.rotation.x = +(cd * (Math.PI * 0.5));
        break;
      case rightArray:
        group.rotation.x = -(cd * (Math.PI * 0.5));
        break;
      case upArray:
        group.rotation.y = -(cd * (Math.PI * 0.5));
        break;
      case downArray:
        group.rotation.y = +(cd * (Math.PI * 0.5));
        break;
      case frontArray:
        group.rotation.z = -(cd * (Math.PI * 0.5));
        break;
      case backArray:
        group.rotation.z = +(cd * (Math.PI * 0.5));
        break;
      default:
        break;
    }
    // group.updateMatrixWorld();
    for (let i = 0; i < 9; i += 1) {
      const cube = array.pop();
      cube.position.set(
        cube.getWorldPosition().x,
        cube.getWorldPosition().y,
        cube.getWorldPosition().z);
      cube.setRotationFromEuler(cube.getWorldRotation());
      mesh.add(cube);
    }
    scene.remove(group);
    doQueue();
  });
  tween.start();
}

// 使用数组记录不同面
function rotateFace(directionArray, clockDirection) {
  // clockDirection:
  // false: 逆时针
  // true: 顺时针
  let neighbors = [];
  // 0: top, 1: right, 2: down, 3: left
  switch (directionArray) {
    case leftArray:
      neighbors.push(upArray);
      neighbors.push(frontArray);
      neighbors.push(downArray);
      neighbors.push(backArray);
      break;
    case upArray:
      neighbors.push(backArray);
      neighbors.push(rightArray);
      neighbors.push(frontArray);
      neighbors.push(leftArray);
      break;
    case frontArray:
      neighbors.push(upArray);
      neighbors.push(rightArray);
      neighbors.push(downArray);
      neighbors.push(leftArray);
      break;
    case rightArray:
      neighbors.push(upArray);
      neighbors.push(backArray);
      neighbors.push(downArray);
      neighbors.push(frontArray);
      break;
    case downArray:
      neighbors.push(frontArray);
      neighbors.push(rightArray);
      neighbors.push(backArray);
      neighbors.push(leftArray);
      break;
    case backArray:
      neighbors.push(upArray);
      neighbors.push(leftArray);
      neighbors.push(downArray);
      neighbors.push(rightArray);
      break;
    default:
      throw new TypeError(`${directionArray} is not a direction array.`);
  }

  let tempArray;
  if (clockDirection) {
    // true: 顺时针
    tempArray = [directionArray[2], directionArray[5], directionArray[8],
      directionArray[1], directionArray[4], directionArray[7],
      directionArray[0], directionArray[3], directionArray[6]
    ];
  } else {
    // false: 逆时针
    tempArray = [directionArray[6], directionArray[3], directionArray[0],
      directionArray[7], directionArray[4], directionArray[1],
      directionArray[8], directionArray[5], directionArray[2]
    ];
  }

  for (let i = 0; i < 4; i += 1) {
    const neighbor = neighbors[i].concat();
    for (let j = 0; j < 9; j += 1) {
      const index = neighbor.indexOf(directionArray[j]);
      if (index >= 0) {
        neighbors[i][index] = tempArray[j];
      }
    }
  }

  switch (directionArray) {
    case leftArray:
      leftArray = tempArray.concat();
      rotateFaceObj(leftArray, clockDirection);
      break;
    case rightArray:
      rightArray = tempArray.concat();
      rotateFaceObj(rightArray, clockDirection);
      break;
    case upArray:
      upArray = tempArray.concat();
      rotateFaceObj(upArray, clockDirection);
      break;
    case downArray:
      downArray = tempArray.concat();
      rotateFaceObj(downArray, clockDirection);
      break;
    case frontArray:
      frontArray = tempArray.concat();
      rotateFaceObj(frontArray, clockDirection);
      break;
    case backArray:
      backArray = tempArray.concat();
      rotateFaceObj(backArray, clockDirection);
      break;
    default:
      break;
  }
}

function getCubesName(array) {
  for (let i = 0; i < array.length; i += 1) {
    console.log(i, array[i].name);
  }
}

function command(str) {
  let facelet = '';
  let clockDirection = true;

  // 解析单个命令，形如「R」、「R'」，分别表示
  // 右侧顺时针转动 和 右侧逆时针转动
  if (str.length === 2) {
    facelet = str[0];
    clockDirection = str[1] === "'" ? !clockDirection : true;
  } else {
    facelet = str[0];
  }

  let currentArray;
  switch (facelet) {
    case 'U':
      currentArray = upArray;
      break;
    case 'F':
      currentArray = frontArray;
      break;
    case 'R':
      currentArray = rightArray;
      break;
    case 'D':
      currentArray = downArray;
      break;
    case 'L':
      currentArray = leftArray;
      break;
    case 'B':
      currentArray = backArray;
      break;
    default:
      currentArray = [];
      throw (new TypeError('输入的命令不合法。'));
  }
  rotateFace(currentArray, clockDirection);
}

function doQueue() {
  if (isRotating) {
    return;
  }
  const singleCommand = queue.shift();
  if (singleCommand !== undefined) {
    command(singleCommand);
  } else {
    console.log('Command queue is empty now.');
  }
}

function commands(str) {
  // 解析多个命令，形如「R L U2」。
  const tempQueue = str.split(' ');

  for (let i = 0; i < tempQueue.length; i += 1) {
    if (tempQueue[i].length === 2 && tempQueue[i][1] === '2') {
      tempQueue.splice(i, 1, tempQueue[i][0], tempQueue[i][0]);
    }
  }

  queue = queue.concat(tempQueue);
  doQueue();
}

function loop() {
  stats.begin();

  loopID = requestAnimationFrame(loop);
  TWEEN.update();
  renderer.render(scene, camera);
  // renderer.render(scene, dummy.children[0]);

  (() => {
    if (autoRotate) {
      theCube.rotation.x -= Math.PI * 0.001;
      theCube.rotation.y -= Math.PI * 0.001;
      theCube.rotation.z -= Math.PI * 0.001;
    }
  })();
  stats.end();
}

function cancelLoop() {
  cancelAnimationFrame(loopID);
}

function startThree() {
  initThree();
  initScene();
  initCamera();
  /* initLight(); */
  initObject();
  renderer.clear();
  loop();
}

startThree();
// addKeydownEventsFor(allCubes[7]);
// addKeydownEventsFor(theCube);
cameraTest();


function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomCube(steps) {
  const commandArray = ['U', 'F', 'R', 'D', 'L', 'B', "U'", "F'", "R'", "D'", "L'", "B'"];
  let commandStr = '';
  for (let i = 0; i < steps; i += 1) {
    const indexRandom = getRandomIntInclusive(0, commandArray.length - 1);
    commandStr += commandArray[indexRandom] + ' ';
  }
  return (commandStr);
}

commands(randomCube(10000));

