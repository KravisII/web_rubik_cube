/* global document randomCube executeCommands reverseCommands */
/* eslint no-console: off, strict: off, no-underscore-dangle: off*/
/* Global value */

'use strict';

class TipControl {
  constructor() {
    // DOM Elements
    this.globalTips = document.querySelector('.global-tips');
    this.gtInner = document.querySelector('.global-tips-inner');
    this.gtError = document.querySelector('.gt-error');
    this.gtCountdown = document.querySelector('.gt-countdown');
  }

  openTip(type) {
    this.globalTips.classList.remove('disable');
    switch (type) {
      case 'error':
        this.gtError.classList.remove('disable');
        break;
      case 'countdown':
        this.gtCountdown.classList.remove('disable');
        break;
      default:
        break;
    }
  }

  closeTip() {
    const inners = this.gtInner.querySelectorAll("[class|='gt']");
    console.log(inners);
    for (const element of inners) {
      element.classList.add('disable');
    }
    this.globalTips.classList.add('disable');
  }

  /**
   * 显示提示
   * @param content string 提示内容
   * @param duration number 提示的持续时间(ms)
   * @param type string 提示类型
   */
  showTip(content, duration, type) {
    if (typeof content !== 'string') {
      throw new TypeError(`${content} is not string`);
    }
    if (typeof duration !== 'number') {
      throw new TypeError(`${content} is not number`);
    }
    switch (type) {
      case 'error':
        this.gtError.innerText = content;
        break;
      default:
        break;
    }
    this.openTip(type);
    setTimeout(() => {
      this.closeTip();
    }, duration);
  }

  /**
   * 显示倒计时
   * @param time
   */
  showCountdown(time) {
    this.openTip('countdown');
    this.gtCountdown.innerText = time;
    for (let i = time; i > 0; i -= 1) {
      ((_i) => {
        setTimeout(() => {
          this.gtCountdown.innerText = time - _i;
        }, i * 1000);
      })(i);
    }
    setTimeout(() => {
      this.closeTip();
    }, time * 1000);
  }
}
