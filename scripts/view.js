/* global document */
/* eslint no-console: off, strict: off, no-underscore-dangle: off*/

'use strict';

const curtain = document.querySelector('.curtain');
const closeButton = document.querySelector('.close.button-icon');
const userButton = document.querySelector('.user.gf-list-item');
const commandButton = document.querySelector('.command.gf-list-item');
const historyButton = document.querySelector('.history.gf-list-item');
const settingButton = document.querySelector('.setting.gf-list-item');

const controlWrapper = document.querySelector('.control-wrapper');
const sections = document.querySelectorAll('.cw-sections > section');
const userSection = document.querySelector('.cw-sections > .user-section');
const commandSection = document.querySelector('.cw-sections > .command-section');
const historySection = document.querySelector('.cw-sections > .history-section');
const settingSection = document.querySelector('.cw-sections > .setting-section');

/**
 * 添加点击事件
 * @param {HTMLElement} element 待添加的元素
 * @param {function} func 待绑定的函数名
 */
function addTapEventFor(element, func) {
  element.addEventListener('click', func, false);
  element.addEventListener('touchstart', func, false);
}

/**
 * 清除 .active 的 class
 * @return undefined
 */
function clearAvtiveElements() {
  const elements = document.querySelectorAll('.active');
  for (const element of elements) {
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
  for (const section of sections) {
    section.classList.remove('active');
  }

  /* 显示特定的 section */
  if (element.classList.contains('user')) {
    userSection.classList.add('active');
  } else if (element.classList.contains('command')) {
    commandSection.classList.add('active');
  } else if (element.classList.contains('history')) {
    historySection.classList.add('active');
  } else if (element.classList.contains('setting')) {
    settingSection.classList.add('active');
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

/**
 * tab 按钮的点击（触摸）事件
 * @return undefined
 */
function tabButtonsClick(event) {
  event.preventDefault();
  if (this.classList.contains('active')) {
    closeButtonClick();
  } else {
    openControl(this);
  }
}

/**
 * 添加所有页面事件
 */
function addViewEvents() {
  addTapEventFor(curtain, curtainOnClick);
  addTapEventFor(closeButton, closeButtonClick);
  const buttons = [userButton, commandButton, historyButton, settingButton];
  for (const button of buttons) {
    addTapEventFor(button, tabButtonsClick);
  }
}

addViewEvents();
