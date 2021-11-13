import { isObject } from 'lodash'
import { StoreToTitledList } from 'src/common/constants'
import { Options } from 'src/common/options/types'
import storage from 'src/common/storage'
import { tabsManager } from 'src/common/tabsManager'
import { __ } from 'src/common/util/i18n'
import browser, { Menus } from 'webextension-polyfill'

const SHOW_TAB_LIST = 'SHOW_TAB_LIST'
const STORE_SELECTED_TABS = 'STORE_SELECTED_TABS'
const STORE = 'STORE'
const STORE_ALL_TABS_IN_CURRENT_WINDOW = 'STORE_ALL_TABS_IN_CURRENT_WINDOW'
const STORE_ALL_TABS_IN_ALL_WINDOWS = 'STORE_ALL_TABS_IN_ALL_WINDOWS'
const STORE_LEFT_TABS = 'STORE_LEFT_TABS'
const STORE_RIGHT_TABS = 'STORE_RIGHT_TABS'
const STORE_TWO_SIDES_TABS = 'STORE_TWO_SIDES_TABS'
const STORE_TO_TITLED_LIST = 'STORE_TO_TITLED_LIST'

const menus = {
  [SHOW_TAB_LIST]: tabsManager.openTabList,
  [STORE_SELECTED_TABS]: tabsManager.storeSelectedTabs,
  [STORE]: {
    [STORE_ALL_TABS_IN_CURRENT_WINDOW]: tabsManager.storeAllTabs,
    [STORE_ALL_TABS_IN_ALL_WINDOWS]: tabsManager.storeAllTabsInAllWindows,
    [STORE_LEFT_TABS]: tabsManager.storeLeftTabs,
    [STORE_RIGHT_TABS]: tabsManager.storeRightTabs,
    [STORE_TWO_SIDES_TABS]: tabsManager.storeTwoSidesTabs,
  },
  [STORE_TO_TITLED_LIST]: {
    [STORE_SELECTED_TABS]: tabsManager.storeSelectedTabs,
    [STORE_ALL_TABS_IN_CURRENT_WINDOW]: tabsManager.storeAllTabs,
    [STORE_LEFT_TABS]: tabsManager.storeLeftTabs,
    [STORE_RIGHT_TABS]: tabsManager.storeRightTabs,
    [STORE_TWO_SIDES_TABS]: tabsManager.storeTwoSidesTabs,
  },
} as const

const getMenuLabel = (key: string) => __(`menu_${key}`)

const getHandler = (key: any) => (menus as any)[key + '']

export const dynamicDisableMenu = async (lists?: any[]) => {
  const groupedTabs = await tabsManager.groupTabsInCurrentWindow()
  if (!groupedTabs) return
  const windows = await browser.windows.getAll()
  browser.contextMenus.update(`${STORE}.${STORE_LEFT_TABS}`, {
    enabled: groupedTabs.left.length !== 0,
    title: getMenuLabel(STORE_LEFT_TABS) + ` (${groupedTabs.left.length})`,
  })
  browser.contextMenus.update(`${STORE}.${STORE_RIGHT_TABS}`, {
    enabled: groupedTabs.right.length !== 0,
    title: getMenuLabel(STORE_RIGHT_TABS) + ` (${groupedTabs.right.length})`,
  })
  browser.contextMenus.update(`${STORE}.${STORE_TWO_SIDES_TABS}`, {
    enabled: groupedTabs.twoSides.length !== 0,
    title:
      getMenuLabel(STORE_TWO_SIDES_TABS) + ` (${groupedTabs.twoSides.length})`,
  })
  browser.contextMenus.update(`${STORE}.${STORE_ALL_TABS_IN_ALL_WINDOWS}`, {
    enabled: windows.length > 1,
  })
  browser.contextMenus.update(`${STORE}.${STORE_ALL_TABS_IN_CURRENT_WINDOW}`, {
    title:
      getMenuLabel(STORE_ALL_TABS_IN_CURRENT_WINDOW) +
      ` (${groupedTabs.all.length})`,
  })
  browser.contextMenus.update(STORE_SELECTED_TABS, {
    title: getMenuLabel(STORE_SELECTED_TABS) + ` (${groupedTabs.inner.length})`,
  })
  lists = lists || (await storage.lists.listList()).result
  for (const list of lists) {
    if (!list.title) continue
    const i = list.id
    browser.contextMenus.update(
      `${STORE_TO_TITLED_LIST}.${STORE_LEFT_TABS}|${i}`,
      {
        enabled: groupedTabs.left.length !== 0,
        title: getMenuLabel(STORE_LEFT_TABS) + ` (${groupedTabs.left.length})`,
      },
    )
    browser.contextMenus.update(
      `${STORE_TO_TITLED_LIST}.${STORE_RIGHT_TABS}|${i}`,
      {
        enabled: groupedTabs.right.length !== 0,
        title:
          getMenuLabel(STORE_RIGHT_TABS) + ` (${groupedTabs.right.length})`,
      },
    )
    browser.contextMenus.update(
      `${STORE_TO_TITLED_LIST}.${STORE_TWO_SIDES_TABS}|${i}`,
      {
        enabled: groupedTabs.twoSides.length !== 0,
        title:
          getMenuLabel(STORE_TWO_SIDES_TABS) +
          ` (${groupedTabs.twoSides.length})`,
      },
    )
    browser.contextMenus.update(
      `${STORE_TO_TITLED_LIST}.${STORE_ALL_TABS_IN_CURRENT_WINDOW}|${i}`,
      {
        title:
          getMenuLabel(STORE_ALL_TABS_IN_CURRENT_WINDOW) +
          ` (${groupedTabs.all.length})`,
      },
    )
    browser.contextMenus.update(
      `${STORE_TO_TITLED_LIST}.${STORE_SELECTED_TABS}|${i}`,
      {
        title:
          getMenuLabel(STORE_SELECTED_TABS) + ` (${groupedTabs.inner.length})`,
      },
    )
  }
}

const createMenus = async (
  obj: any,
  parent: any,
  contexts: Menus.ContextType[],
  lists: any[] = [],
) => {
  if (obj === menus.STORE_TO_TITLED_LIST) {
    if (window.opts.disableDynamicMenu) return
    for (const list of lists) {
      if (!list.title) continue
      const prop: Menus.CreateCreatePropertiesType = {
        id: `${StoreToTitledList}|${list.id}`,
        title: list.title,
        contexts,
        parentId: StoreToTitledList,
      }
      const id = await browser.contextMenus.create(prop)
      console.log('context menu created:', id)
      for (const key in obj) {
        const prop: Menus.CreateCreatePropertiesType = {
          id: `${StoreToTitledList}.${key}|${list.id}`,
          title: __('menu_' + key),
          contexts,
          parentId: id,
        }
        const childId = await browser.contextMenus.create(prop)
        console.log('context menu created:', childId)
      }
    }
  } else {
    for (const key of Object.keys(obj)) {
      const prop: Menus.CreateCreatePropertiesType = {
        id: key,
        title: __('menu_' + key),
        contexts,
      }
      if (parent) {
        prop.id = parent + '.' + key
        prop.parentId = parent
      }
      const id = await browser.contextMenus.create(prop)
      console.log('context menu created:', id)
      if (isObject(obj[key])) await createMenus(obj[key], key, contexts, lists)
    }
  }
}

export const setupContextMenus = async ({
  pageContext,
  allContext,
}: Options) => {
  await browser.contextMenus.removeAll()
  const contexts: Menus.ContextType[] = ['browser_action']
  if (pageContext) {
    contexts.push('page')
    if (allContext) contexts.push('all')
  }

  const lists = await storage.lists.listList()
  window.contextMenusClickedHandler = info => {
    console.log('context menu clicked', info.menuItemId)
    if (info.menuItemId.toString().startsWith(StoreToTitledList)) {
      const [key, listId] = info.menuItemId.toString().split('|')
      getHandler(key)?.(listId)

      // TODO: report
    } else {
      getHandler(info.menuItemId)?.()
    }
  }
  const CreateContextMenu = 'create context menu'
  console.groupCollapsed(CreateContextMenu, contexts)
  await createMenus(menus, null, contexts, lists.result)
  console.groupEnd()
  dynamicDisableMenu(lists.result)
}
