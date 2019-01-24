import _ from 'lodash'
import __ from './common/i18n'
import tabs from './common/tabs'
import logger from './common/logger'
import storage from './common/storage'
import options from './common/options'
import migrate from './common/migrate'
import boss from './common/service/boss'
import listManager from './common/listManager'
import browser from 'webextension-polyfill'

/* eslint-disable-next-line */
if (DEBUG && !MOZ) import(
  /* webpackChunkName: "autoreload", webpackMode: "lazy" */
  './common/autoreload'
).then(({autoreload}) => autoreload())

/* eslint-disable-next-line */
if (PRODUCTION) import(
  /* webpackChunkName: "tracker", webpackMode: "lazy" */
  '@/common/tracker'
).then(({tracker}) => tracker())

if (DEBUG) {
  window.tabs = tabs
  window.browser = browser
  window.listManager = listManager
  window.boss = boss
  browser.browserAction.setBadgeText({text: 'dev'})
}

const getBrowserActionHandler = action => {
  if (action === 'store-selected') return () => tabs.storeSelectedTabs()
  if (action === 'show-list') return () => tabs.openTabLists()
  if (action === 'store-all') return () => tabs.storeAllTabs()
  if (action === 'store-all-in-all-windows') return () => tabs.storeAllTabInAllWindows()
  /* eslint-disable-next-line */
  return () => {}
}

const updateBrowserAction = (action, tmp = false) => {
  if (!tmp) window.currentBrowserAction = action
  /* eslint-disable-next-line */
  if (!window.coverBrowserAction) window.coverBrowserAction = () => {}
  const {items} = _.find(options.optionsList, {name: 'browserAction'})
  const {label} = _.find(items, {value: action})
  console.log('action is: ', action, 'set title as: ', label)
  browser.browserAction.setTitle({title: label})
  /* eslint-disable-next-line */
  window.coverBrowserAction = () => {}
  if (action === 'popup') {
    browser.browserAction.setPopup({popup: 'index.html#/popup'})
  } else {
    browser.browserAction.setPopup({popup: ''})
    window.browswerActionClickedHandler = getBrowserActionHandler(action)
    if (!window.opts.openTabListWhenNewTab) return
    window.coverBrowserAction = async activeInfo => {
      const tab = await browser.tabs.get(activeInfo.tabId)
      if (['about:home', 'about:newtab', 'chrome://newtab/'].includes(tab.url)) {
        updateBrowserAction('show-list', true)
      } else {
        updateBrowserAction(window.currentBrowserAction)
      }
    }
  }
}

const dynamicDisableMenu = async () => {
  const groupedTabs = await tabs.groupTabsInCurrentWindow()
  const windows = await browser.windows.getAll()
  browser.contextMenus.update('STORE.STORE_LEFT_TABS', {
    enabled: groupedTabs.left.length !== 0,
    title: __('menu_STORE_LEFT_TABS') + ` (${groupedTabs.left.length})`,
  })
  browser.contextMenus.update('STORE.STORE_RIGHT_TABS', {
    enabled: groupedTabs.right.length !== 0,
    title: __('menu_STORE_RIGHT_TABS') + ` (${groupedTabs.right.length})`,
  })
  browser.contextMenus.update('STORE.STORE_TWOSIDE_TABS', {
    enabled: groupedTabs.twoSide.length !== 0,
    title: __('menu_STORE_TWOSIDE_TABS') + ` (${groupedTabs.twoSide.length})`,
  })
  browser.contextMenus.update('STORE.STORE_ALL_TABS_IN_ALL_WINDOWS', {
    enabled: windows.length > 1,
  })
  browser.contextMenus.update('STORE.STORE_ALL_TABS_IN_CURRENT_WINDOW', {
    title: __('menu_STORE_ALL_TABS_IN_CURRENT_WINDOW') + ` (${groupedTabs.all.length})`,
  })
  browser.contextMenus.update('STORE_SELECTED_TABS', {
    title: __('menu_STORE_SELECTED_TABS') + ` (${groupedTabs.inter.length})`,
  })
  const lists = await storage.getLists()
  for (let i = 0; i < lists.length; i += 1) {
    if (!lists[i].title) continue
    browser.contextMenus.update('STORE_TO_TITLED_LIST.STORE_LEFT_TABS|' + i, {
      enabled: groupedTabs.left.length !== 0,
      title: __('menu_STORE_LEFT_TABS') + ` (${groupedTabs.left.length})`,
    })
    browser.contextMenus.update('STORE_TO_TITLED_LIST.STORE_RIGHT_TABS|' + i, {
      enabled: groupedTabs.right.length !== 0,
      title: __('menu_STORE_RIGHT_TABS') + ` (${groupedTabs.right.length})`,
    })
    browser.contextMenus.update('STORE_TO_TITLED_LIST.STORE_TWOSIDE_TABS|' + i, {
      enabled: groupedTabs.twoSide.length !== 0,
      title: __('menu_STORE_TWOSIDE_TABS') + ` (${groupedTabs.twoSide.length})`,
    })
    browser.contextMenus.update('STORE_TO_TITLED_LIST.STORE_ALL_TABS_IN_CURRENT_WINDOW|' + i, {
      title: __('menu_STORE_ALL_TABS_IN_CURRENT_WINDOW') + ` (${groupedTabs.all.length})`,
    })
    browser.contextMenus.update('STORE_TO_TITLED_LIST.STORE_SELECTED_TABS|' + i, {
      title: __('menu_STORE_SELECTED_TABS') + ` (${groupedTabs.inter.length})`,
    })
  }
}

const setupContextMenus = _.debounce(async ({pageContext, allContext}) => {
  await browser.contextMenus.removeAll()
  const contexts = [browser.contextMenus.ContextType.BROWSER_ACTION]
  if (pageContext) {
    contexts.push(browser.contextMenus.ContextType.PAGE)
    if (allContext) contexts.push(browser.contextMenus.ContextType.ALL)
  }
  const menus = {
    SHOW_TAB_LIST: tabs.openTabLists,
    STORE_SELECTED_TABS: tabs.storeSelectedTabs,
    STORE: {
      STORE_ALL_TABS_IN_CURRENT_WINDOW: tabs.storeAllTabs,
      STORE_ALL_TABS_IN_ALL_WINDOWS: tabs.storeAllTabInAllWindows,
      STORE_LEFT_TABS: tabs.storeLeftTabs,
      STORE_RIGHT_TABS: tabs.storeRightTabs,
      STORE_TWOSIDE_TABS: tabs.storeTwoSideTabs,
    },
    STORE_TO_TITLED_LIST: {
      STORE_SELECTED_TABS: tabs.storeSelectedTabs,
      STORE_ALL_TABS_IN_CURRENT_WINDOW: tabs.storeAllTabs,
      STORE_LEFT_TABS: tabs.storeLeftTabs,
      STORE_RIGHT_TABS: tabs.storeRightTabs,
      STORE_TWOSIDE_TABS: tabs.storeTwoSideTabs,
    }
  }
  const lists = await storage.getLists()
  const createMenus = async (obj, parent) => {
    if (obj === menus.STORE_TO_TITLED_LIST) {
      for (let listIndex = 0; listIndex < lists.length; listIndex += 1) {
        if (!lists[listIndex].title) continue
        const prop = {
          id: 'STORE_TO_TITLED_LIST|' + listIndex,
          title: lists[listIndex].title,
          contexts,
          parentId: 'STORE_TO_TITLED_LIST',
        }
        const id = await browser.contextMenus.create(prop)
        console.log('context menu created: ' + id)
        for (const key in obj) {
          const prop = {
            id: 'STORE_TO_TITLED_LIST.' + key + '|' + listIndex,
            title: __('menu_' + key),
            contexts,
            parentId: id,
          }
          const childId = await browser.contextMenus.create(prop)
          console.log('context menu created: ' + childId)
        }
      }
    } else {
      for (const key of Object.keys(obj)) {
        const prop = {
          id: key,
          title: __('menu_' + key),
          contexts,
        }
        if (parent) {
          prop.id = parent + '.' + key
          prop.parentId = parent
        }
        const id = await browser.contextMenus.create(prop)
        console.log('context menu created: ' + id)
        if (_.isObject(obj[key])) await createMenus(obj[key], key)
      }
    }
  }
  window.contextMenusClickedHandler = info => {
    console.log('context menu clicked', info.menuItemId)
    if (info.menuItemId.startsWith('STORE_TO_TITLED_LIST')) {
      const [key, listIndex] = info.menuItemId.split('|')
      _.get(menus, key)(+listIndex)
      if (PRODUCTION) ga('send', 'event', 'Menu clicked', key)
    } else {
      _.get(menus, info.menuItemId)()
      if (PRODUCTION) ga('send', 'event', 'Menu clicked', info.menuItemId)
    }
  }
  console.groupCollapsed('create context menu', contexts)
  await createMenus(menus)
  console.groupEnd('create context menu')
  dynamicDisableMenu()
}, 250)

const commandHandler = command => {
  console.log('received command', command)
  if (command === 'store-selected-tabs') tabs.storeSelectedTabs()
  else if (command === 'store-all-tabs') tabs.storeAllTabs()
  else if (command === 'store-all-in-all-windows') tabs.storeAllTabInAllWindows()
  else if (command === 'restore-lastest-list') tabs.restoreLastestList()
  else if (command === 'open-lists') tabs.openTabLists()
  else return true
  if (PRODUCTION) ga('send', 'event', 'Command used', command)
}

const init = async () => {
  logger.init()
  await listManager.init()
  const opts = window.opts = await storage.getOptions() || {}
  _.defaults(opts, options.getDefaultOptions())
  await storage.setOptions(opts)
  window.nightmode = opts.defaultNightMode
  updateBrowserAction(opts.browserAction)
  await setupContextMenus(opts)
  browser.runtime.onMessage.addListener(async msg => {
    console.debug('received', msg)
    if (msg.optionsChanged) {
      const changes = msg.optionsChanged
      console.debug('options changed', changes)
      Object.assign(window.opts, changes)
      if (changes.browserAction) updateBrowserAction(changes.browserAction)
      if (('pageContext' in changes) || ('allContext' in changes)) await setupContextMenus(changes)
      await browser.runtime.sendMessage({optionsChangeHandledStatus: 'success'})
      if (PRODUCTION) Object.keys(changes).map(key => ga('send', 'event', 'Options changed', key, changes[key]))
    }
    if (msg.restoreList) {
      const {restoreList} = msg
      const listIndex = restoreList.index
      const lists = await storage.getLists()
      const list = lists[listIndex]
      if (restoreList.newWindow) {
        tabs.restoreListInNewWindow(list)
      } else {
        tabs.restoreList(list)
      }
      if (!list.pinned) {
        listManager.removeListById(list._id)
      }
      if (PRODUCTION) ga('send', 'event', 'Popup item clicked')
    }
    if (msg.storeInto) {
      tabs.storeSelectedTabs(msg.storeInto.index)
    }
    if (msg.login) {
      boss.login(msg.login.token)
    }
    if (msg.refresh) {
      boss.refresh()
    }
    if (msg.import) {
      const {lists} = msg.import
      lists.forEach(list => listManager.addList(list))
    }
  })
  browser.runtime.onMessageExternal.addListener(commandHandler)
  browser.commands.onCommand.addListener(commandHandler)
  browser.runtime.onUpdateAvailable.addListener(detail => {
    window.update = detail.version
  })
  browser.runtime.onInstalled.addListener(detail => {
    if (DEBUG) return
    if (detail.reason === chrome.runtime.OnInstalledReason.UPDATE) {
      const updatedNotificationId = 'updated'
      browser.notifications.onClicked.addListener(id => {
        if (id === updatedNotificationId) {
          browser.tabs.create({ url: 'https://github.com/cnwangjie/better-onetab/blob/master/CHANGELOG.md' })
        }
      })
      browser.notifications.create(updatedNotificationId, {
        type: 'basic',
        iconUrl: 'assets/icons/icon_128.png',
        title: __('ui_updated_to_ver') + ' v' + browser.runtime.getManifest().version,
        message: __('ui_click_view_changelog'),
      })
      setTimeout(() => {
        browser.notifications.clear(updatedNotificationId)
      }, 5000)
    }
  })
  browser.browserAction.onClicked.addListener(action => window.browswerActionClickedHandler(action))
  browser.contextMenus.onClicked.addListener(info => window.contextMenusClickedHandler(info))
  browser.tabs.onActivated.addListener(_.debounce(activeInfo => {
    window.coverBrowserAction(activeInfo)
    dynamicDisableMenu(activeInfo)
  }, 200))
  browser.storage.onChanged.addListener(async changes => {
    console.log(changes)
    if (changes.boss_token) {
      window.boss_token = changes.boss_token
    }
    if (changes.lists) {
      setupContextMenus(await storage.getOptions())
    }
  })
  await migrate()
  await boss.init()
}

init()
