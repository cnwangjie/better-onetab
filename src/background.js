import tabs from './common/tabs'
import storage from './common/storage'
import autoreload from './common/autoreload'
import options from './common/options'
import _ from 'lodash'
import cp from 'chrome-promise'
if (DEBUG) autoreload()

const openTabLists = async () => {
  // open only one in a window
  if (!_.isObject(window.appTabId)) window.appTabId = {}
  const currentWindow = await cp.windows.getCurrent()
  const windowId = currentWindow.id

  if (windowId in window.appTabId) {
    const tabs = await cp.tabs.getAllInWindow(windowId)
    const tabIndex = tabs.findIndex(tab => tab.id === window.appTabId[windowId])
    if (tabIndex !== -1)
      return cp.tabs.highlight({ windowId, tabs: tabIndex })
  }
  const createdTab = await cp.tabs.create({url: chrome.runtime.getURL('index.html#/app/')})
  window.appTabId[windowId] = createdTab.id
}

const getBrowserActionHandler = action => {
  if (action === 'store-selected') return () => tabs.storeSelectedTabs()
  if (action === 'store-all') return () => tabs.storeAllTabs()
  if (action === 'show-list') return () => openTabLists()
  return () => {}
}

const updateBrowserAction = action => {
  const items = _.find(options.optionsList, {name: 'browserAction'}).items
  const label = _.find(items, {value: action}).label
  console.log('action is: ', action, 'set title as: ', label)
  chrome.browserAction.setTitle({title: label})
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

const setupContextMenus = () => {
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
  chrome.contextMenus.create({
    id: 'SHOW_TAB_LIST',
    title: 'show tab list',
    contexts: ['browser_action'],
  })

  const oldHandler = window.contextMenusClickedHandler
  if (!chrome.contextMenus.onClicked.hasListener(oldHandler)) {
    const newHandler = info => {
      if (info.menuItemId === 'STORE_SELECTED_TABS') return tabs.storeSelectedTabs()
      if (info.menuItemId === 'STORE_ALL_TABS_IN_CURRENT_WINDOW') return tabs.storeAllTabs()
      if (info.menuItemId === 'SHOW_TAB_LIST') return openTabLists()
    }
    chrome.contextMenus.onClicked.addListener(newHandler)
    window.contextMenusClickedHandler = newHandler
  }
}

const init = async () => {
  const opts = await storage.getOptions() || {}
  _.defaults(opts, options.getDefaultOptions())
  await storage.setOptions(opts)
  updateBrowserAction(opts.browserAction)
  setupContextMenus()
  chrome.runtime.onMessage.addListener(msg => {
    if (msg.optionsChanged) {
      const changes = msg.optionsChanged
      console.log(changes)
      if (changes.browserAction) updateBrowserAction(changes.browserAction)
      chrome.runtime.sendMessage({optionsChangeHandledStatus: 'success'})
    }
  })
  chrome.commands.onCommand.addListener(async command => {
    if (command === 'store-selected-tabs') return tabs.storeSelectedTabs()
    else if (command === 'store-all-tabs') return tabs.storeAllTabs()
    else if (command === 'restore-lastest-list') {
      const lists = await storage.getLists()
      if (lists.length === 0) return
      const lastest = lists.sort((a, b) => a.time < b.time)[0]
      await restoreList(lastest)
      if (lastest.pinned) return
      lists.shift()
      return await storage.setLists(lists)
    } else if (command === 'open-lists') return openTabLists()
  });
}

init()