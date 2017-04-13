/* global document */

const curtain = document.querySelector('.curtain');
const closeBotton = document.querySelector('.close.botton-icon');
const userBotton = document.querySelector('.user.gf-list-item');
const commandBotton = document.querySelector('.command.gf-list-item');
const settingBotton = document.querySelector('.setting.gf-list-item');

const controlWrapper = document.querySelector('.control-wrapper');

/**
 * 清除 .active 的 class
 * @return undefined
 */
function clearAvtiveElements() {
  const elements = document.querySelectorAll('.active');
  for (let element of elements) {
    element.classList.remove('active');
  }
}

/**
 * 关闭控制台
 * @return undefined
 */
function closeControl() {
  curtain.classList.add('disable');
  controlWrapper.classList.add('disable');
  clearAvtiveElements();
}

/**
 * 开启控制台
 * @param  {[HTMLElement]} element
 * @return undefined
 */
function openControl(element) {
  curtain.classList.remove('disable');
  controlWrapper.classList.remove('disable');
  clearAvtiveElements();
  element.classList.add('active');
  // TODO: 修改出现的 section
}

/**
 * curtain 元素点击（触摸）事件
 * @return undefined
 */
function curtainOnClick(event) {
  event.preventDefault();
  closeControl();
}

/**
 * closeBotton 按钮点击（触摸）事件
 * @return undefined
 */
function closeBottonClick(event) {
  if (event) {
    event.preventDefault();
  }
  closeControl();
  clearAvtiveElements();
}

function listBottonsClick(event) {
  event.preventDefault();
  if (this.classList.contains('active')) {
    closeBottonClick();
  } else {
    openControl(this);
  }
}

curtain.addEventListener('click', curtainOnClick, false);
curtain.addEventListener('touchend', curtainOnClick, false);

closeBotton.addEventListener('click', closeBottonClick, false);
closeBotton.addEventListener('touchend', closeBottonClick, false);

userBotton.addEventListener('click', listBottonsClick, false);
userBotton.addEventListener('touchend', listBottonsClick, false);

commandBotton.addEventListener('click', listBottonsClick, false);
commandBotton.addEventListener('touchend', listBottonsClick, false);

settingBotton.addEventListener('click', listBottonsClick, false);
settingBotton.addEventListener('touchend', listBottonsClick, false);
