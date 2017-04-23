/* eslint-disable no-restricted-syntax,max-len */
/* global document TipControl randomCube executeCommands reverseCommands */
/* eslint no-console: off, strict: off, no-underscore-dangle: off*/

'use strict';

/* Global value */
const tipControl = new TipControl();
// let colors = ['#3498db', '#2ecc71', '#d35400', '#e74c3c', '#f39c12', '#9b59b6', '#34495e'];
const colors = ['#ff3b30', '#ff9500', '#ffcc00', '#4cd964',
  '#5ac8fa', '#007AFF', '#5856D6', '#FF2C55'
];

/* --------------- List item buttons --------------- */
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
 * 添加触屏事件
 * @param {HTMLElement} element 待添加的元素
 * @param {function} func 待绑定的函数名
 */
function addTapEventFor(element, func) {
  if (element.classList.contains('curtain')) {
    element.addEventListener('mousedown', func, false);
    element.addEventListener('touchstart', func, true);
  } else {
    element.addEventListener('mouseup', func, false);
    element.addEventListener('touchend', func, false);
  }
}

/**
 * 清除 .active 的 class
 */
function clearAvtiveElements() {
  const elements = document.querySelectorAll('.active');
  for (const element of elements) {
    element.classList.remove('active');
  }
}

/**
 * 关闭控制台
 */
function closeControl() {
  curtain.classList.add('disable');
  controlWrapper.classList.add('disable');
  clearAvtiveElements();
}

/**
 * 开启控制台
 * @param  {HTMLElement} element
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
 */
function curtainOnClick(event) {
  event.preventDefault();
  closeControl();
}

/**
 * closeButton 按钮点击（触摸）事件
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
 */
function tabButtonsClick(event) {
  event.preventDefault();
  if (this.classList.contains('active')) {
    closeButtonClick();
  } else {
    openControl(this);
  }
}

/* --------------- User section --------------- */
const signOutButton = document.querySelector('#sign-out-button');
const signInButton = document.querySelector('#sign-in-button');
const signUpButton = document.querySelector('#sign-up-button');
const signUpLink = document.querySelector('#sign-up-link');
const signInLink = document.querySelector('#sign-in-link');
const userInfoPage = document.querySelector('.us-user-info');
const signInPage = document.querySelector('.us-sign-in');
const signUpPage = document.querySelector('.us-sign-up');

/**
 * 关闭 User section 的指定 page
 * @param  {HTMLElement} page 需要关闭的页面
 */
function closePage(page) {
  page.classList.remove('show');
}

/**
 * 打开 User section 的指定 page
 * @param  {HTMLElement} page 需要打开的页面
 */
function openPage(page) {
  page.classList.add('show');
}

/**
 * 关闭 User section 的所有 page
 */
function closeAllPages() {
  closePage(userInfoPage);
  closePage(signInPage);
  closePage(signUpPage);
}

/**
 * 退出登录
 */
function onSignOutButtonClick() {
  closeAllPages();
  openPage(signInPage);
}

/**
 * 登录
 */
function onSignInButtonClick() {
  closeAllPages();
  openPage(userInfoPage);
}

/**
 * 注册
 */
function onSignUpButtonClick() {
  closeAllPages();
  openPage(userInfoPage);
}

/**
 * 打开注册页面
 */
function onSignUpLinkClick(event) {
  event.preventDefault();
  closeAllPages();
  openPage(signUpPage);
}

/**
 * 打开登陆页面
 */
function onSignInLinkClick(event) {
  event.preventDefault();
  closeAllPages();
  openPage(signInPage);
}

/*

<section class="user-section">
  <div class="us-user-info show">
    <div class="usui-name">Nick Name</div>
    <div class="usui-email">youremail@example.com</div>
    <div class="section-button sign-out" id="sign-out-button">Sign out</div>
  </div>
  <div class="us-sign-in">
    <form>
      <div class="us-sign-in-inner">
        <label for="sign-in-email">Email address</label>
        <input type="text" name="email" id="sign-in-email" class="inpu-area">
        <label for="sign-in-password">Password</label>
        <input type="password" name="password" id="sign-in-password" class="inpu-area">
        <div class="section-button sign-in" id="sign-in-button">Sign in</div>
      </div>
    </form>
    <p class="us-sign-in-tip">
      <a href="#" id="create-account-link">Create an account</a> to save history and setting.
    </p>
  </div>
  <div class="us-sign-up">
    <form>
      <div class="us-sign-up-inner">
        <label for="sign-up-email">Email address</label>
        <input type="text" name="email" id="sign-up-email" class="inpu-area">
        <label for="sign-up-nickname">Nick name</label>
        <input type="text" name="email" id="sign-up-nickname" class="inpu-area">
        <label for="sign-up-password">Password</label>
        <input type="password" name="password" id="sign-up-password" class="inpu-area">
        <div class="section-button sign-up">Sign up</div>
      </div>
    </form>
    <p class="us-sign-up-tip">
      Already have an account? <a href="#" id="sign-in-link">Sign in.</a>
    </p>
  </div>
</section>
 */

/* --------------- Setting section --------------- */
// 由于其他 section 需要获取 setting section 的数据，因此需要将其放在此处
const switchArray = document.querySelectorAll('.toolkit-switch');
const themeSwitch = document.querySelector('#theme-switch');
const durationSlider = document.querySelector('#duration-slider');
const delaySlider = document.querySelector('#delay-slider');
const durationValueSpan = document.querySelector('#duration-value');
const delayValueSpan = document.querySelector('#delay-value');

function toggleSwitch(event) {
  event.preventDefault();
  const newValue = this.getAttribute('value') === 'on' ? 'off' : 'on';
  this.setAttribute('value', newValue);
}

durationValueSpan.innerText = durationSlider.value;
delayValueSpan.innerText = delaySlider.value;

/* --------------- Command section --------------- */
const textArea = document.querySelector('.cs-inner .inpu-area');

const randomButton = document.querySelector('.section-button.random');
const exectueButton = document.querySelector('.section-button.execute');
const reverseButton = document.querySelector('.section-button.reverse');

/**
 * 检测命令的合法性
 * @param str 命令
 * @returns {boolean}
 */
function isCommandLegal(str) {
  let result = true;
  const array = str.split(' ');
  for (const cmd of array) {
    if (cmd.length === 1) {
      if ((/[UFRDLB]/).test(cmd) === false) {
        tipControl.showTip(`${cmd} is illegal command.`, 5000, 'error');
        result = false;
        break;
      }
    } else if (cmd.length === 2) {
      if ((/[UFRDLB]'/).test(cmd) === false) {
        tipControl.showTip(`${cmd} is illegal command.`, 5000, 'error');
        result = false;
        break;
      }
    } else {
      tipControl.showTip(`Wrong length of ${cmd} command.`, 5000, 'error');
      result = false;
      break;
    }
  }
  return result;
}

/**
 * 「加入倒计时」并「调用执行正转和逆转的函数」
 * @param type
 */
function onExecuteButtonClick(type) {
  const _command = textArea.value;
  if (isCommandLegal(_command)) {
    const _delay = delaySlider.value;
    tipControl.showCountdown(_delay);
    setTimeout(() => {
      if (type === 'execute') {
        executeCommands(_command);
      } else if (type === 'reverse') {
        reverseCommands(_command);
      }
    }, _delay * 1000);
    closeControl();
  }
}

/* --------------- All events --------------- */
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

  addTapEventFor(randomButton, () => {
    textArea.value = randomCube(20);
  });
  addTapEventFor(exectueButton, () => {
    onExecuteButtonClick('execute');
  });

  addTapEventFor(reverseButton, () => {
    onExecuteButtonClick('reverse');
  });

  for (const switchKit of switchArray) {
    addTapEventFor(switchKit, toggleSwitch);
  }
  addTapEventFor(themeSwitch, () => {
    const themeValue = themeSwitch.getAttribute('value');
    if (themeValue === 'on') {
      document.querySelector('body').classList.add('dark');
    } else {
      document.querySelector('body').classList.remove('dark');
    }
  });

  durationSlider.addEventListener('input', function func() {
    durationValueSpan.innerText = this.value;
  }, false);

  delaySlider.addEventListener('input', function func() {
    delayValueSpan.innerText = this.value;
  }, false);

  addTapEventFor(signOutButton, onSignOutButtonClick);
  addTapEventFor(signInButton, onSignInButtonClick);
  addTapEventFor(signUpButton, onSignUpButtonClick);
  addTapEventFor(signUpLink, onSignUpLinkClick);
  addTapEventFor(signInLink, onSignInLinkClick);
}

addViewEvents();
