import _ from 'lodash'
import tabs from '../common/tabs'
import options from '../common/options'
import browser from 'webextension-polyfill'

const actions = {
  'store-selected': tabs.storeSelectedTabs,
  'show-list': tabs.openTabLists,
  'store-all': tabs.storeAllTabs,
  'store-all-in-all-windows': tabs.storeAllTabInAllWindows,
}

const getBrowserActionHandler = action => {
  return actions[action] || new Function()
}

export const updateBrowserAction = async (action, tmp = false) => {
  if (!tmp) window.currentBrowserAction = action
  /* eslint-disable-next-line */
  if (!window.coverBrowserAction) window.coverBrowserAction = () => {}
  const {items} = _.find(options.optionsList, {name: 'browserAction'})
  const {label} = _.find(items, {value: action})
  console.log('action is: ', action, 'set title as: ', label)
  await browser.browserAction.setTitle({title: label})
  /* eslint-disable-next-line */
  window.coverBrowserAction = () => {}
  if (action === 'popup') {
    await browser.browserAction.setPopup({popup: 'index.html#/popup'})
  } else {
    await browser.browserAction.setPopup({popup: ''})
    window.browswerActionClickedHandler = getBrowserActionHandler(action)
    if (!window.opts.openTabListWhenNewTab) return
    window.coverBrowserAction = async activeInfo => {
      const tab = await browser.tabs.get(activeInfo.tabId)
      if (['about:home', 'about:newtab', 'chrome://newtab/'].includes(tab.url)) {
        return updateBrowserAction('show-list', true)
      } else {
        return updateBrowserAction(window.currentBrowserAction)
      }
    }
  }
}
