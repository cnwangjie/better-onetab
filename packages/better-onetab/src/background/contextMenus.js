import _ from 'lodash'
import __ from '../common/i18n'
import tabs from '../common/tabs'
import storage from '../common/storage'
import browser from 'webextension-polyfill'

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

export const dynamicDisableMenu = async lists => {
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
  lists = lists || await storage.getLists()
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

const createMenus = async (obj, parent, contexts, lists) => {
  if (obj === menus.STORE_TO_TITLED_LIST) {
    if (window.opts.disableDynamicMenu) return
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
      if (_.isObject(obj[key])) await createMenus(obj[key], key, contexts, lists)
    }
  }
}

export const setupContextMenus = async ({pageContext, allContext}) => {
  await browser.contextMenus.removeAll()
  const contexts = [browser.contextMenus.ContextType.BROWSER_ACTION]
  if (pageContext) {
    contexts.push(browser.contextMenus.ContextType.PAGE)
    if (allContext) contexts.push(browser.contextMenus.ContextType.ALL)
  }
  const lists = await storage.getLists()
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
  await createMenus(menus, null, contexts, lists)
  console.groupEnd('create context menu')
  dynamicDisableMenu(lists)
}
