// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      2025-08-19
// @description  try to take over the world!
// @author       You
// @match        https://devops.vzan.com/index.html
// @icon         https://www.google.com/s2/favicons?sz=64&domain=vzan.com
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  let lastApplication = ''
  const BUILD_IS_SUCCESS = 1
  let submitDom = null
  let descDom = null
  let ctrBoxDom = null
  let autoBtnDom = null
  /**
   * @param {string} requestUrl 
   */
  function getLastApplication(requestUrl) {
    const reg = /(?<=devops.vzan.com\/deploy\/env\?application\=)[^\&]+/
    const matchRes = (requestUrl || '').match(reg)
    if (matchRes && matchRes[0]) {
      lastApplication = matchRes[0]
      renderDesc()
      !checkHasCtr() && injectCtr()
      checkTimer && clearTimeout(checkTimer)
      console.log('重置选中应用')
    }
  }
  function renderDesc(count) {
    if (descDom) {
      let desc = `当前构建应用为:${lastApplication};`
      if (count) {
        desc += `重试次数:${count}`
      }
      descDom.innerText = desc;
    }
  }
  function injectCtr() {
    submitDom = document.querySelector('.is-plain')
    ctrBoxDom = ctrBoxDom || document.createElement('div')
    const createEl = (name) => {
      const el = document.createElement(name)
      ctrBoxDom.appendChild(el)
      return el
    }
    descDom = descDom || createEl('p');
    renderDesc()
    autoBtnDom = autoBtnDom || createEl('button')
    autoBtnDom.innerText = '自动构建'
    autoBtnDom.addEventListener('click', () => {
      autoBuild()
    })
    document.querySelector('.is-plain').after(ctrBoxDom)
  }
  let checkTimer = 0
  async function autoBuild(count = 1) {
    const raw = await fetch(`https://devops.vzan.com/deploy/build?page_no=1&page_size=10&app=${lastApplication}`)
    const res = await raw.json()
    renderDesc(count)
    if (res?.detail?.[0].succeed === BUILD_IS_SUCCESS) {
      submitDom && submitDom.click()
    } else {
      checkTimer && clearTimeout(checkTimer)
      checkTimer = setTimeout(() => {
        autoBuild(count+=1)
      }, 30000);
    }
  }
  const open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function() {
    this.addEventListener('readystatechange', function() {
      if (this.readyState === 4) {
        getLastApplication(this.responseURL)
      }
    });
    open.apply(this, arguments);
  };
  function checkHasCtr() {
    return ctrBoxDom && document.querySelector('.is-plain').nextElementSibling
  }
})();