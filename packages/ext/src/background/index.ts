import { tabsManager } from 'src/common/tabsManager'
import browser from 'webextension-polyfill'
import init from './init'

if (DEBUG) {
  import(
    /* webpackChunkName: "autoReload", webpackMode: "lazy" */
    './autoReload'
  ).then(autoReload => autoReload.default())

  window.tabsManager = tabsManager
  window.browser = browser
  browser.browserAction.setBadgeText({text: 'dev'})
}

init()
