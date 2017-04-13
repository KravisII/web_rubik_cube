/* eslint-env browser */
/* eslint no-console: off, strict: off, no-underscore-dangle: off*/
/* global THREE, TWEEN, Stats*/
// 使用数组记录旋转面

// GIVEUP: 对 requestAnimationFrame 的改进（魔方崩坏）
// GIVEUP: 添加 Z 轴和 X 轴的相机移动轨迹
// GIVEUP: 清除闪烁，可能由内侧不透明 texture 引起

// TODO: MVC 分离

'use strict';

/* Global Values */
const faceRatio = 0.25;

let canvasHeight = 0;
let canvasWidth = 0;

let canvasElement;
let renderer;
let scene;
let camera;
let controls;
let mesh;
let theCube;

let upArray = [];
let frontArray = [];
let rightArray = [];
let downArray = [];
let leftArray = [];
let backArray = [];

let upFacelet;
let frontFacelet;
let rightFacelet;
let downFacelet;
let leftFacelet;
let backFacelet;
let nullFacelet;

let rotationTaskList = [];
let rotationTaskCache = [];

const allCubes = [];
let loopID;

let isRotating = false;
// let autoRotate = false;

let duration = 2000;

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

function getRandomIntInclusive(min, max) {
  const _min = Math.ceil(min);
  const _max = Math.floor(max);
  return Math.floor(Math.random() * (_max - _min + 1)) + _min;
}

function randomCube(steps) {
  const commandFlags = ['U', 'F', 'R', 'D', 'L', 'B', "U'", "F'", "R'", "D'", "L'", "B'"];
  const commandArray = [];
  for (let i = 0; i < steps; i += 1) {
    const indexRandom = getRandomIntInclusive(0, commandFlags.length - 1);
    commandArray.push(commandFlags[indexRandom]);
  }
  return (commandArray.join(' '));
}

function orbit() {
  controls = new THREE.OrbitControls(camera, canvasElement);
  camera.lookAt({ x: 3, y: 3, z: 3 });
  controls.target.set(3, 3, 3);

  controls.autoRotate = false;
  controls.enableZoom = false;
  controls.enableDamping = true;
  controls.rotateSpeed = 0.1;
  controls.dampingFactor = 0.125;
  controls.enablePan = false;
  // controls.dispose();
}

function addKeydownEventsForOrbit() {
  document.addEventListener('keydown', (event) => {
    const keyName = event.key || event.keyIdentifier;
    switch (keyName) {
      case 'ArrowLeft':
      case 'Left':
      case 'UIKeyInputLeftArrow':
        event.preventDefault();
        controls.rotateLeft(Math.PI * (1 / 16));
        break;
      case 'ArrowRight':
      case 'Right':
      case 'UIKeyInputRightArrow':
        event.preventDefault();
        controls.rotateLeft(-Math.PI * (1 / 16));
        break;
      case 'ArrowUp':
      case 'Up':
      case 'UIKeyInputUpArrow':
        event.preventDefault();
        controls.rotateUp(Math.PI * (1 / 64));
        break;
      case 'ArrowDown':
      case 'Down':
      case 'UIKeyInputDownArrow':
        event.preventDefault();
        controls.rotateUp(-Math.PI * (1 / 64));
        break;
      default:
        break;
    }
  }, false);
}

function disableScroll() {
  document.querySelector('body').classList.toggle('disable-scroll');
  document.ontouchmove = (e) => {
    e.preventDefault();
  };
}

function enableScroll() {
  document.querySelector('body').removeAttribute('class');
  document.ontouchmove = null;
}

/* Stats Function */
// const stats = new Stats();
// (() => {
//   document.body.appendChild(stats.domElement);
// })();

/* Cube Operation */
function changePivot(x, y, z, obj) {
  const wrapper = new THREE.Object3D();
  wrapper.position.set(x, y, z);
  wrapper.add(obj);
  obj.position.set(-x, -y, -z);
  return wrapper;
}

function resizeCanvas() {
  const wrapper = document.querySelector('.canvas-wrapper');
  canvasHeight = wrapper.clientHeight;
  canvasWidth = wrapper.clientWidth;
  if (canvasHeight !== canvasWidth) {
    const min = Math.min(canvasWidth, canvasHeight, 600);
    canvasHeight = min;
    canvasWidth = min;
  }
  renderer.setSize(canvasWidth, canvasHeight);

  if (camera) {
    camera.aspect = canvasWidth / canvasHeight;
    camera.updateProjectionMatrix();
  }

  // ----------------------
  // Show log in wrapper
  let log = document.querySelector('.log');
  if (log) {
    log.innerText = `${canvasWidth}, ${canvasHeight}`;
  } else {
    log = document.createElement('div');
    log.classList.add('log');
    log.style.position = 'fixed';
    log.style.bottom = '0';
    log.style.right = '0';
    log.innerText = `${canvasWidth}, ${canvasHeight}`;
    wrapper.appendChild(log);
  }
  // ----------------------
}

window.addEventListener('resize', resizeCanvas, false);

/* init Three.js */
function initThree() {
  canvasElement = document.querySelector('.main-canvas');
  renderer = new THREE.WebGLRenderer({
    antialiasing: true,
    canvas: canvasElement,
    alpha: true,
  });
  renderer.setClearColor(0xFF0000, 0);
  renderer.setPixelRatio(window.devicePixelRatio * 2);
  resizeCanvas();
}

function initScene() {
  scene = new THREE.Scene();
}

function initCamera() {
  // https://github.com/mrdoob/three.js/issues/69
  camera = new THREE.PerspectiveCamera(45, 1, 1, 50);
  camera.position.set(-6, 12, 15);
  camera.lookAt({ x: 3, y: 3, z: 3 });
  scene.add(camera);
}

function createFaceTextureCanvas(faceCode) {
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
    default:
      break;
  }
  if (faceCode === 'N') {
    const canvas = document.createElement('canvas');
    canvas.width = 8;
    canvas.height = 8;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, 16, 16);
    return canvas;
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
  ctx.fillStyle = 'rgba(0,0,0,1)';
  ctx.font = `Italic ${200 * faceRatio}px Times New Roman`;
  ctx.fillText(faceCode, 160 * faceRatio, 364 * faceRatio);
  return canvas;
}

function createFaces() {
  upFacelet = createFaceTextureCanvas('U');
  frontFacelet = createFaceTextureCanvas('F');
  rightFacelet = createFaceTextureCanvas('R');
  downFacelet = createFaceTextureCanvas('D');
  leftFacelet = createFaceTextureCanvas('L');
  backFacelet = createFaceTextureCanvas('B');
  nullFacelet = createFaceTextureCanvas('N');
}

function formatName(str) {
  const codeArray = [];
  const codeObj = {
    R: 0,
    L: 1,
    U: 2,
    D: 3,
    F: 4,
    B: 5,
  };
  for (let i = 0; i < str.length; i += 1) {
    const code = str[i];
    const index = codeObj[code];
    codeArray[index] = code;
  }
  for (let i = 0; i < 6; i += 1) {
    if (codeArray[i] === undefined) {
      codeArray[i] = '#';
    }
  }
  return codeArray.join('');
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
          myFaces[2] = upFacelet;
          myFaces[3] = nullFacelet;
        }
        if (x === 1) {
          cubeName += 'L';
          myFaces[1] = leftFacelet;
          myFaces[0] = nullFacelet;
        }
        if (z === 5) {
          cubeName += 'F';
          myFaces[4] = frontFacelet;
          myFaces[3] = nullFacelet;
        }
        if (x === 5) {
          cubeName += 'R';
          myFaces[0] = rightFacelet;
          myFaces[1] = nullFacelet;
        }
        if (y === 1) {
          cubeName += 'D';
          myFaces[3] = downFacelet;
          myFaces[2] = nullFacelet;
        }
        if (z === 1) {
          cubeName += 'B';
          myFaces[5] = backFacelet;
          myFaces[4] = nullFacelet;
        }

        // Create MultiMaterial
        const materials = [];
        for (let i = 0; i < 6; i += 1) {
          const texture = (myFaces[i] === undefined) ?
            new THREE.Texture(nullFacelet) : new THREE.Texture(myFaces[i]);
          texture.needsUpdate = true;
          materials.push(new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
          }));
        }
        const cubemat = new THREE.MultiMaterial(materials);
        const cube = new THREE.Mesh(geometryCube, cubemat);
        cube.position.set(x, y, z);
        cube.name = formatName(cubeName);
        mesh.add(cube);
        allCubes.push(cube);
      }
    }
  }
}

function createFaceletArrays() {
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
  // Create 7 facelet texture
  createFaces();
  // Create 27 cubes
  createCubes();
  // Create 6 facelets
  createFaceletArrays();

  theCube = changePivot(3, 3, 3, mesh);
  scene.add(theCube);
}

function getCubesName(array) {
  for (let i = 0; i < array.length; i += 1) {
    console.log(i, array[i].name);
  }
}

// 导出魔方状态
function exportCubeState() {
  // Singmaster:
  // UF UR UB UL
  // DF DR DB DL
  // FR FL BR BL
  // UFR URB UBL ULF
  // DRF DFL DLB DBR
  const array = [];
  array.push(`${upArray[1].name[2]}${upArray[1].name[4]} `);
  array.push(`${upArray[5].name[2]}${upArray[5].name[0]} `);
  array.push(`${upArray[7].name[2]}${upArray[7].name[5]} `);
  array.push(`${upArray[3].name[2]}${upArray[3].name[1]} `);

  array.push(`${downArray[7].name[3]}${downArray[7].name[4]} `);
  array.push(`${downArray[5].name[3]}${downArray[5].name[0]} `);
  array.push(`${downArray[1].name[3]}${downArray[1].name[5]} `);
  array.push(`${downArray[3].name[3]}${downArray[3].name[1]} `);

  array.push(`${frontArray[5].name[4]}${frontArray[5].name[0]} `);
  array.push(`${frontArray[3].name[4]}${frontArray[3].name[1]} `);
  array.push(`${backArray[3].name[5]}${backArray[3].name[0]} `);
  array.push(`${backArray[5].name[5]}${backArray[5].name[1]} `);

  array.push(`${upArray[2].name[2]}${upArray[2].name[4]}${upArray[2].name[0]} `);
  array.push(`${upArray[8].name[2]}${upArray[8].name[0]}${upArray[8].name[5]} `);
  array.push(`${upArray[6].name[2]}${upArray[6].name[5]}${upArray[6].name[1]} `);
  array.push(`${upArray[0].name[2]}${upArray[0].name[1]}${upArray[0].name[4]} `);

  array.push(`${downArray[8].name[3]}${downArray[8].name[0]}${downArray[8].name[4]} `);
  array.push(`${downArray[6].name[3]}${downArray[6].name[4]}${downArray[6].name[1]} `);
  array.push(`${downArray[0].name[3]}${downArray[0].name[1]}${downArray[0].name[5]} `);
  array.push(`${downArray[2].name[3]}${downArray[2].name[5]}${downArray[2].name[0]} `);
  return (array.join(''));
}

function facesChange(str, facelet, direction) {
  const resultArray = ['#', '#', '#', '#', '#', '#'];
  const originArray = Array.from(str);

  if ((facelet === 'L' && direction === 1) ||
    (facelet === 'R' && direction === -1)) {
    resultArray[0] = originArray[0];
    resultArray[1] = originArray[1];
    resultArray[4] = originArray[2];
    resultArray[3] = originArray[4];
    resultArray[5] = originArray[3];
    resultArray[2] = originArray[5];
  }
  if ((facelet === 'L' && direction === -1) ||
    (facelet === 'R' && direction === 1)) {
    resultArray[0] = originArray[0];
    resultArray[1] = originArray[1];
    resultArray[2] = originArray[4];
    resultArray[4] = originArray[3];
    resultArray[3] = originArray[5];
    resultArray[5] = originArray[2];
  }

  if ((facelet === 'U' && direction === 1) ||
    (facelet === 'D' && direction === -1)) {
    resultArray[2] = originArray[2];
    resultArray[3] = originArray[3];
    resultArray[0] = originArray[5];
    resultArray[4] = originArray[0];
    resultArray[1] = originArray[4];
    resultArray[5] = originArray[1];
  }
  if ((facelet === 'U' && direction === -1) ||
    (facelet === 'D' && direction === 1)) {
    resultArray[2] = originArray[2];
    resultArray[3] = originArray[3];
    resultArray[5] = originArray[0];
    resultArray[0] = originArray[4];
    resultArray[4] = originArray[1];
    resultArray[1] = originArray[5];
  }

  if ((facelet === 'F' && direction === 1) ||
    (facelet === 'B' && direction === -1)) {
    resultArray[4] = originArray[4];
    resultArray[5] = originArray[5];
    resultArray[0] = originArray[2];
    resultArray[3] = originArray[0];
    resultArray[1] = originArray[3];
    resultArray[2] = originArray[1];
  }
  if ((facelet === 'F' && direction === -1) ||
    (facelet === 'B' && direction === 1)) {
    resultArray[4] = originArray[4];
    resultArray[5] = originArray[5];
    resultArray[2] = originArray[0];
    resultArray[0] = originArray[3];
    resultArray[3] = originArray[1];
    resultArray[1] = originArray[2];
  }
  return resultArray.join('');
}

function executeRotation() {
  isRotating = true;
  const cmd = rotationTaskList.shift();
  const [facelet, direction] = [cmd.facelet, cmd.direction];
  let group;
  let activeArray;
  // 1. 准备动画 group
  group = new THREE.Group();
  let groupArray;
  switch (facelet) {
    case 'U':
      groupArray = upArray;
      break;
    case 'F':
      groupArray = frontArray;
      break;
    case 'R':
      groupArray = rightArray;
      break;
    case 'D':
      groupArray = downArray;
      break;
    case 'L':
      groupArray = leftArray;
      break;
    case 'B':
      groupArray = backArray;
      break;
    default:
      throw new TypeError(`${facelet} 不是合法的面标记`);
  }
  for (let i = 0; i < groupArray.length; i += 1) {
    THREE.SceneUtils.attach(groupArray[i], scene, group);
  }
  group.updateMatrixWorld();
  switch (facelet) {
    case 'U':
      group = changePivot(3, 5, 3, group);
      break;
    case 'F':
      group = changePivot(3, 3, 5, group);
      break;
    case 'R':
      group = changePivot(5, 3, 3, group);
      break;
    case 'D':
      group = changePivot(3, 1, 3, group);
      break;
    case 'L':
      group = changePivot(0, 3, 3, group);
      break;
    case 'B':
      group = changePivot(3, 3, 1, group);
      break;
    default:
      break;
  }
  scene.add(group);

  if (direction !== -1 && direction !== 1) {
    throw new TypeError(`${direction} 不是合法的时钟方向命令`);
  }
  const rotationTask = new TWEEN.Tween(group.rotation);
  rotationTask.name = `${facelet}, ${direction}`;
  rotationTask.easing(TWEEN.Easing.Quartic.Out);
  rotationTask.onStart(() => {
    // 2. 修改相邻面的数组
    const neighbors = [];
    let currentArray = [];
    switch (facelet) {
      case 'U':
        currentArray = upArray;
        neighbors.push(backArray);
        neighbors.push(rightArray);
        neighbors.push(frontArray);
        neighbors.push(leftArray);
        break;
      case 'F':
        currentArray = frontArray;
        neighbors.push(upArray);
        neighbors.push(rightArray);
        neighbors.push(downArray);
        neighbors.push(leftArray);
        break;
      case 'R':
        currentArray = rightArray;
        neighbors.push(upArray);
        neighbors.push(backArray);
        neighbors.push(downArray);
        neighbors.push(frontArray);
        break;
      case 'D':
        currentArray = downArray;
        neighbors.push(frontArray);
        neighbors.push(rightArray);
        neighbors.push(backArray);
        neighbors.push(leftArray);
        break;
      case 'L':
        currentArray = leftArray;
        neighbors.push(upArray);
        neighbors.push(frontArray);
        neighbors.push(downArray);
        neighbors.push(backArray);
        break;
      case 'B':
        currentArray = backArray;
        neighbors.push(upArray);
        neighbors.push(leftArray);
        neighbors.push(downArray);
        neighbors.push(rightArray);
        break;
      default:
        throw new TypeError(`${facelet} 不是合法的面标记`);
    }
    if (direction === 1) {
      // true: 顺时针
      activeArray = [currentArray[2], currentArray[5], currentArray[8],
        currentArray[1], currentArray[4], currentArray[7],
        currentArray[0], currentArray[3], currentArray[6],
      ];
    } else {
      // false: 逆时针
      activeArray = [currentArray[6], currentArray[3], currentArray[0],
        currentArray[7], currentArray[4], currentArray[1],
        currentArray[8], currentArray[5], currentArray[2],
      ];
    }
    for (let i = 0; i < 4; i += 1) {
      const neighbor = neighbors[i].concat();
      for (let j = 0; j < 9; j += 1) {
        const index = neighbor.indexOf(currentArray[j]);
        if (index >= 0) {
          neighbors[i][index] = activeArray[j];
        }
      }
    }

    // 更新每个块的名字
    for (let i = 0; i < activeArray.length; i += 1) {
      activeArray[i].name = facesChange(activeArray[i].name, facelet, direction);
    }

    switch (facelet) {
      case 'U':
        upArray = activeArray.concat();
        break;
      case 'F':
        frontArray = activeArray.concat();
        break;
      case 'R':
        rightArray = activeArray.concat();
        break;
      case 'D':
        downArray = activeArray.concat();
        break;
      case 'L':
        leftArray = activeArray.concat();
        break;
      case 'B':
        backArray = activeArray.concat();
        break;
      default:
        break;
    }
  });

  switch (facelet) {
    case 'U':
      rotationTask.to({ y: -(direction * (Math.PI * 0.5)) }, duration);
      break;
    case 'F':
      rotationTask.to({ z: -(direction * (Math.PI * 0.5)) }, duration);
      break;
    case 'R':
      rotationTask.to({ x: -(direction * (Math.PI * 0.5)) }, duration);
      break;
    case 'D':
      rotationTask.to({ y: +(direction * (Math.PI * 0.5)) }, duration);
      break;
    case 'L':
      rotationTask.to({ x: +(direction * (Math.PI * 0.5)) }, duration);
      break;
    case 'B':
      rotationTask.to({ z: +(direction * (Math.PI * 0.5)) }, duration);
      break;
    default:
      break;
  }

  rotationTask.onComplete(() => {
    for (let i = 0; i < activeArray.length; i += 1) {
      THREE.SceneUtils.detach(activeArray[i], group.children[0], scene);
    }
    scene.remove(group);
    isRotating = false;
    const state = exportCubeState();
    console.log(stepCount);
    stepCount += 1;
    if (state === 'UF UR UB UL DF DR DB DL FR FL BR BL UFR URB UBL ULF DRF DFL DLB DBR ') {
      console.log('还原完成。');
    }
  });
  rotationTask.start();
}

let stepCount = 1;

function command(token) {
  // 解析单个命令，形如 "R", "r", "R'"
  // 分别表示「右侧顺时针转动」、「右侧逆时针转动」、「右侧逆时针转动」
  let facelet = '';
  let clockDirection = 0;

  if (token.length === 2) {
    if (token[1] !== "'") {
      throw new TypeError(`${token} 不是合法的命令`);
    } else {
      facelet = token[0].toUpperCase();
      clockDirection = -1;
    }
  } else if (token.length === 1) {
    if (/[a-z]/.test(token)) {
      facelet = token.toUpperCase();
      clockDirection = -1;
    } else if (/[A-Z]/.test(token)) {
      facelet = token;
      clockDirection = 1;
    } else {
      throw new TypeError(`${token} 不是合法的命令`);
    }
  } else {
    throw new TypeError(`${token} 不是合法的命令`);
  }
  const obj = { facelet, direction: clockDirection };

  if (!isRotating) {
    rotationTaskList.push(obj);
  } else {
    rotationTaskCache.push(obj);
  }
}

function isReverseToken(a, b) {
  if (/[a-z]/.test(a)) {
    return a.toUpperCase() === b;
  } else if (/[A-Z]/.test(a)) {
    return a.toLowerCase() === b;
  }
  return false;
}

function getReverseToken(a) {
  if (/[a-z]/.test(a)) {
    return a.toUpperCase();
  } else if (/[A-Z]/.test(a)) {
    return a.toLowerCase();
  }
  return '';
}

function commands(str) {
  // 1. 预处理字符串
  // 1.1 参数检测
  if (typeof str !== 'string' || str === '') {
    throw new TypeError('函数 commands 的参数必须是非空字符串');
  }
  // 1.2 去掉多余空格
  let tempStr = ` ${str} `;
  tempStr = tempStr.replace(/\s+/g, '#');
  tempStr = tempStr.slice(1, tempStr.length - 1);

  // 2. 分割字符串成数组
  // 2.1 把两步化成单步 ['F2'] -> ['F', 'F']
  // 2.2 把逆时针转动化为小写 ["F'"] -> ["f"]
  const tempList = tempStr.split('#');
  const resultList = [];
  for (let i = 0; i < tempList.length; i += 1) {
    const currentCommand = tempList[i];
    if (currentCommand.length === 2) {
      const reverse = currentCommand.match(/[UFRDLB]'/);
      const double = currentCommand.match(/[UFRDLB]2/);
      if (reverse) {
        resultList.push(currentCommand[0].toLowerCase());
      }
      if (double) {
        tempList.splice(i, 1, currentCommand[0], currentCommand[0]);
        i -= 1;
      }
    } else if (currentCommand.length === 1) {
      if (currentCommand.match(/[UFRDLB]/)) {
        resultList.push(currentCommand);
      } else {
        throw new TypeError(`${currentCommand} 不是合法的参数`);
      }
    } else {
      throw new TypeError(`${currentCommand} 不是合法的参数`);
    }
  }
  // console.log('2.2', resultList);

  // 2.3 合并命令 ["F", "F", "F"] -> ["F'"]
  for (let i = 0; i < resultList.length - 2; i += 1) {
    const cm = resultList[i];
    const nm = resultList[i + 1];
    const nnm = resultList[i + 2];
    if (cm === nm && nm === nnm) {
      resultList.splice(i, 3, getReverseToken(cm));
      i -= 2;
    }
  }
  // console.log('2.3', resultList);

  // 2.4 去除重复无效命令 ["F", "F'", "U"] -> ["U"]
  for (let i = 0; i < resultList.length - 1; i += 1) {
    const currentCommand = resultList[i];
    const nextCommand = resultList[i + 1];
    if (isReverseToken(currentCommand, nextCommand)) {
      resultList.splice(i, 2);
      i -= 1;
    }
  }
  // console.log('2.4', resultList);
  console.log('Real token count', resultList.length);
  return resultList;
}

function reverseCommands(str) {
  const resultList = commands(str);
  for (let i = resultList.length - 1; i >= 0; i -= 1) {
    command(getReverseToken(resultList[i]));
  }
}

function executeCommands(str) {
  const resultList = commands(str);
  for (const token of resultList) {
    command(token);
  }
}

function loop() {
  // stats.begin();
  loopID = requestAnimationFrame(loop);
  if (rotationTaskList.length > 0 && !isRotating) {
    executeRotation();
  }
  if (rotationTaskList.length === 0 && !isRotating) {
    rotationTaskList = rotationTaskList.concat(rotationTaskCache);
    rotationTaskCache = [];
  }
  TWEEN.update();
  controls.update();
  renderer.render(scene, camera);
  // stats.end();
}

function cancelLoop() {
  cancelAnimationFrame(loopID);
}

function startThree() {
  initThree();
  initScene();
  initCamera();
  initObject();
  renderer.clear();
  orbit();
  loop();
}

startThree();
addKeydownEventsForOrbit();
