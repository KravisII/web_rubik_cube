/* global document */

const curtain = document.querySelector('.curtain');
const closeButton = document.querySelector('.close.button-icon');
const userButton = document.querySelector('.user.gf-list-item');
const commandButton = document.querySelector('.command.gf-list-item');
const settingButton = document.querySelector('.setting.gf-list-item');

const controlWrapper = document.querySelector('.control-wrapper');
const sections = document.querySelectorAll('.cw-sections > div');

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

  /* 重置所有 section */
  for (let section of sections) {
    section.classList.remove('active');
  }

  /* 显示特定的 section */
  if (element.classList.contains('user')) {
    sections[0].classList.add('active');
  } else if (element.classList.contains('command')) {
    sections[1].classList.add('active');
  } else if (element.classList.contains('setting')) {
    sections[2].classList.add('active');
  } else {
    throw new TypeError('Wrong element');
  }
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
 * closeButton 按钮点击（触摸）事件
 * @return undefined
 */
function closeButtonClick(event) {
  if (event) {
    event.preventDefault();
  }
  closeControl();
  clearAvtiveElements();
}

function listButtonsClick(event) {
  event.preventDefault();
  if (this.classList.contains('active')) {
    closeButtonClick();
  } else {
    openControl(this);
  }
}

curtain.addEventListener('click', curtainOnClick, false);
curtain.addEventListener('touchend', curtainOnClick, false);

closeButton.addEventListener('click', closeButtonClick, false);
closeButton.addEventListener('touchend', closeButtonClick, false);

userButton.addEventListener('click', listButtonsClick, false);
userButton.addEventListener('touchend', listButtonsClick, false);

commandButton.addEventListener('click', listButtonsClick, false);
commandButton.addEventListener('touchend', listButtonsClick, false);

settingButton.addEventListener('click', listButtonsClick, false);
settingButton.addEventListener('touchend', listButtonsClick, false);
