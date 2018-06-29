import tabs from './common/tabs'
import storage from './common/storage'
import options from './common/options'
import _ from 'lodash'
import __ from './common/i18n'
import browser from 'webextension-polyfill'

if (DEBUG) import(
  /* webpackChunkName: "autoreload", webpackMode: "lazy" */
  './common/autoreload'
).then(({autoreload}) => autoreload())

if (PRODUCTION) import(
  /* webpackChunkName: "tracker", webpackMode: "lazy" */
  '@/common/tracker'
).then(({tracker}) => tracker())

const getBrowserActionHandler = action => {
  if (action === 'store-selected') return () => tabs.storeSelectedTabs()
  if (action === 'store-all') return () => tabs.storeAllTabs()
  if (action === 'show-list') return () => tabs.openTabLists()
  return () => {}
}

const updateBrowserAction = action => {
  const items = _.find(options.optionsList, {name: 'browserAction'}).items
  const label = _.find(items, {value: action}).label
  console.log('action is: ', action, 'set title as: ', label)
  browser.browserAction.setTitle({title: label})
  if (action === 'popup') {
    browser.browserAction.setPopup({popup: 'index.html#/popup'})
  } else {
    browser.browserAction.setPopup({popup: ''})
    window.browswerActionClickedHandler = getBrowserActionHandler(action)
  }
}

const setupContextMenus = () => {
  browser.contextMenus.removeAll()
  browser.contextMenus.create({
    id: 'STORE_SELECTED_TABS',
    title: __('menu_STORE_SELECTED_TABS'),
    contexts: ['browser_action'],
  })
  browser.contextMenus.create({
    id: 'STORE_ALL_TABS_IN_CURRENT_WINDOW',
    title: __('menu_STORE_ALL_TABS_IN_CURRENT_WINDOW'),
    contexts: ['browser_action'],
  })
  browser.contextMenus.create({
    id: 'SHOW_TAB_LIST',
    title: __('menu_SHOW_TAB_LIST'),
    contexts: ['browser_action'],
  })

  window.contextMenusClickedHandler = info => {
    if (info.menuItemId === 'STORE_SELECTED_TABS') tabs.storeSelectedTabs()
    else if (info.menuItemId === 'STORE_ALL_TABS_IN_CURRENT_WINDOW') tabs.storeAllTabs()
    else if (info.menuItemId === 'SHOW_TAB_LIST') tabs.openTabLists()
  }
}

const init = async () => {
  const opts = await storage.getOptions().catch(i => {}) || {}
  _.defaults(opts, options.getDefaultOptions())
  await storage.setOptions(opts)
  updateBrowserAction(opts.browserAction)
  setupContextMenus()
  browser.runtime.onMessage.addListener(msg => {
    console.log(msg)
    if (msg.optionsChanged) {
      const changes = msg.optionsChanged
      console.log(changes)
      if (changes.browserAction) updateBrowserAction(changes.browserAction)
      browser.runtime.sendMessage({optionsChangeHandledStatus: 'success'})
      if (PRODUCTION) Object.keys(changes).map(key => ga('send', 'event', 'Options', key, changes[key]))
    }
  })
  browser.browserAction.onClicked.addListener(action => window.browswerActionClickedHandler(action))
  browser.contextMenus.onClicked.addListener(info => window.contextMenusClickedHandler(info))
  browser.commands.onCommand.addListener(async command => {
    if (command === 'store-selected-tabs') tabs.storeSelectedTabs()
    else if (command === 'store-all-tabs') tabs.storeAllTabs()
    else if (command === 'restore-lastest-list') {
      const lists = await storage.getLists()
      if (lists.length === 0) return true
      const lastest = lists.sort((a, b) => a.time < b.time)[0]
      await restoreList(lastest)
      if (lastest.pinned) return true
      lists.shift()
      return storage.setLists(lists)
    } else if (command === 'open-lists') tabs.openTabLists()
    else return true
    if (PRODUCTION) ga('send', 'event', 'Command', 'used', command)
  })
}

init()