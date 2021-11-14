import { noop } from 'lodash'
import { BrowserAction, NewTabs } from 'src/common/constants'
import { browserActionConfigItems, optionsList } from 'src/common/options/list'
import { tabsManager } from 'src/common/tabsManager'
import browser from 'webextension-polyfill'

const actions = {
  [BrowserAction.StoreSelected]: tabsManager.storeSelectedTabs,
  [BrowserAction.ShowList]: tabsManager.openTabList,
  [BrowserAction.StoreAll]: tabsManager.storeAllTabs,
}

const getBrowserActionHandler = (action: string) => {
  return actions[action] || noop
}

export const updateBrowserAction = async (action?: string, tmp = false) => {
  if (!action) return
  if (!tmp) window.currentBrowserAction = action
  window.coverBrowserAction = () => {}
  const { label } = browserActionConfigItems.find(({ value }) => value === action) || {}
  console.log('action is: ', action, 'set title as: ', label)
  if (!label) return
  await browser.browserAction.setTitle({ title: label })
  if (action === BrowserAction.Popup) {
    await browser.browserAction.setPopup({ popup: 'index.html#/popup' })
  } else {
    await browser.browserAction.setPopup({ popup: '' })
    window.browserActionClickedHandler = getBrowserActionHandler(action)
    if (!window.opts.openTabListWhenNewTab) return
    window.coverBrowserAction = async activeInfo => {
      const tab = await browser.tabs.get(activeInfo.tabId)
      const url = tab.url || ''
      if (NewTabs.includes(url)) {
        return updateBrowserAction(BrowserAction.ShowList, true)
      } else {
        return updateBrowserAction(window.currentBrowserAction)
      }
    }
  }
}

export const registerBrowserActionListener = async (initialAction?: string) => {
  return Promise.all([
    updateBrowserAction(initialAction),
    browser.browserAction.onClicked.addListener(() => window.browserActionClickedHandler?.()),
  ])
}
