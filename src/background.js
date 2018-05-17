import tabs from './common/tabs'
import storage from './common/storage'
import autoreload from './common/autoreload'
import options from './common/options'
import _ from 'lodash'
import cp from 'chrome-promise'
if (DEBUG) autoreload()

const getBrowserActionHandler = action => {
  if (action === 'store-selected') return () => tabs.storeSelectedTabs()
  if (action === 'store-all') return () => tabs.storeAllTabs()
  if (action === 'show-list') return async () => {
    // open only one in a window
    if (!_.isObject(appTabId)) window.appTabId = {}
    const currentWindow = await cp.windows.getCurrent()
    const windowId = currentWindow.id

    if (windowId in window.appTabId) {
      const tabs = await cp.tabs.getAllInWindow(windowId)
      if (tabs.findIndex(tab => tab.id === window.appTabId[windowId]) !== -1)
        return cp.tabs.highlight({tabs: window.appTabId[windowId]})
    }
    const createdTab = await cp.tabs.create({url: chrome.runtime.getURL('index.html#/app/')})
    window.appTabId[windowId] = createdTab.id
  }
  return () => {}
}

const updateBrowserAction = action => {
  chrome.browserAction.setTitle({title: _.find(_.find(options.optionsList, {name: 'browserAction'}).items, {value: action}).label})
  if (action === 'popup') {
    chrome.browserAction.setPopup({popup: 'index.html#/popup'})
  } else {
    chrome.browserAction.setPopup({popup: ''})
    const oldHandler = window.browswerActionClickedHandler
    if (chrome.browserAction.onClicked.hasListener(oldHandler))
      chrome.browserAction.onClicked.removeListener(oldHandler)
    const newHandler = getBrowserActionHandler(action)
    chrome.browserAction.onClicked.addListener(newHandler)
    window.browswerActionClickedHandler = newHandler
  }
}

const updateContextMenus = () => {
  chrome.contextMenus.removeAll()
  chrome.contextMenus.create({
    id: 'STORE_SELECTED_TABS',
    title: 'store selected tabs',
    contexts: ['browser_action'],
  })
  chrome.contextMenus.create({
    id: 'STORE_ALL_TABS_IN_CURRENT_WINDOW',
    title: 'store all tabs in current window',
    contexts: ['browser_action'],
  })

  const oldHandler = window.contextMenusClickedHandler
  if (!chrome.contextMenus.onClicked.hasListener(oldHandler)) {
    const newHandler = info => {
      if (info.menuItemId === 'STORE_SELECTED_TABS') return tabs.storeSelectedTabs()
      if (info.menuItemId === 'STORE_ALL_TABS_IN_CURRENT_WINDOW') return tabs.storeAllTabs()
    }
    chrome.contextMenus.onClicked.addListener(newHandler)
    window.contextMenusClickedHandler = newHandler
  }
}

const handleOptions = opts => {
  updateBrowserAction(opts.browserAction)
  updateContextMenus()
  chrome.runtime.sendMessage({optionsChangeHandledStatus: 'success'})
}

const init = async () => {
  const opts = await storage.getOptions() || {}
  _.defaults(opts, options.getDefaultOptions())
  await storage.setOptions(opts)
  handleOptions(opts)
  chrome.storage.onChanged.addListener(async changes => {
    if (changes.opts) {
      handleOptions(await storage.getOptions())
    }
  })
}

init()