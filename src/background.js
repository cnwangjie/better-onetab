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

if (DEBUG) window.tabs = tabs

const getBrowserActionHandler = action => {
  if (action === 'store-selected') return () => tabs.storeSelectedTabs()
  if (action === 'show-list') return () => tabs.openTabLists()
  if (action === 'store-all') return () => tabs.storeAllTabs()
  if (action === 'store-all-in-all-windows') return () => tabs.storeAllTabInAllWindows()
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

const setupContextMenus = async pageContext => {
  await browser.contextMenus.removeAll()
  const contexts = ['browser_action']
  if (pageContext) contexts.push('page')
  const menus = {
    STORE_SELECTED_TABS: tabs.storeSelectedTabs,
    STORE_ALL_TABS_IN_CURRENT_WINDOW: tabs.storeAllTabs,
    SHOW_TAB_LIST: tabs.openTabLists,
    STORE_ALL_TABS_IN_ALL_WINDOWS: tabs.storeAllTabInAllWindows,
  }
  for (const key of Object.keys(menus)) {
    await browser.contextMenus.create({
      id: key,
      title: __('menu_' + key),
      contexts,
    })
  }
  window.contextMenusClickedHandler = info => menus[info.menuItemId]()
}

const init = async () => {
  const opts = await storage.getOptions() || {}
  _.defaults(opts, options.getDefaultOptions())
  await storage.setOptions(opts)
  updateBrowserAction(opts.browserAction)
  setupContextMenus(opts.pageContext)
  browser.runtime.onMessage.addListener(async msg => {
    console.log(msg)
    if (msg.optionsChanged) {
      const changes = msg.optionsChanged
      console.log(changes)
      if (changes.browserAction) updateBrowserAction(changes.browserAction)
      if ('pageContext' in changes) await setupContextMenus(changes.pageContext)
      await browser.runtime.sendMessage({optionsChangeHandledStatus: 'success'})
      if (PRODUCTION) Object.keys(changes).map(key => ga('send', 'event', 'Options', key, changes[key]))
    }
    if (msg.restoreList) {
      const restoreList = msg.restoreList
      const listIndex = restoreList.index
      const lists = await storage.getLists()
      if (restoreList.newWindow) {
        tabs.restoreListInNewWindow(lists[listIndex])
      } else {
        tabs.restoreList(lists[listIndex])
      }
      if (!lists[listIndex].pinned) {
        lists.splice(listIndex, 1)
        storage.setLists(lists)
      }
    }
  })
  browser.runtime.onUpdateAvailable.addListener(detail => {
    window.update = detail.version
  })
  browser.runtime.onInstalled.addListener(detail => {
    if (detail.reason === chrome.runtime.OnInstalledReason.UPDATE) {
      tabs.openAboutPage()
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
      const lastest = lists[0]
      await tabs.restoreList(lastest)
      if (lastest.pinned) return true
      lists.shift()
      return storage.setLists(lists)
    } else if (command === 'open-lists') tabs.openTabLists()
    else return true
    if (PRODUCTION) ga('send', 'event', 'Command', 'used', command)
  })
}

init()
