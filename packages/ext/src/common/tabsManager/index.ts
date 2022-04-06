import browser, { Tabs } from 'webextension-polyfill'
import { IllegalUrlPrefixes } from '../constants'
import options from '../options'
import storage from '../storage'
import { Tab } from '../storage/tabs'

type BrowserTab = Tabs.Tab
type BrowserTabs = BrowserTab[]

export const getAllInWindow = (windowId: number) =>
  browser.tabs.query({ windowId })

export const getSelectedTabs = () =>
  browser.tabs.query({ highlighted: true, currentWindow: true })

export const getAllTabsInCurrentWindow = async () => {
  const currentWindow = await browser.windows.getCurrent()
  if (currentWindow.id) return getAllInWindow(currentWindow.id)
  console.error('getAllTabsInCurrentWindow: current window without id')
}

export const groupTabsInCurrentWindow = async () => {
  const tabs = await getAllTabsInCurrentWindow()
  if (!tabs) return

  let awayHighlighted = false

  const left: BrowserTabs = []
  const right: BrowserTabs = []
  const inner: BrowserTabs = []

  for (const tab of tabs) {
    const list = tab.highlighted ? inner : awayHighlighted ? right : left

    if (tab.highlighted) awayHighlighted = true

    list.push(tab)
  }

  const twoSides = [...left, ...right]

  return {
    left,
    right,
    inner,
    twoSides,
    all: tabs,
  }
}

const isLegalURL = (url: string) =>
  IllegalUrlPrefixes.every(prefix => !url.startsWith(prefix))

const AppUrl = browser.runtime.getURL('')

const addTabsToHistory = async (tabs: BrowserTabs) => {
  for (let i = 0; i < tabs.length; i += 1) {
    const tab = tabs[i]

    // maybe occur Error: "An unexpected error occurred" when trying to add about:* to history
    try {
      await browser.history.addUrl({
        url: tab.url!,
        // dont use title to avoid [Error in invocation of history.addUrl(history.UrlDetails details, optional function callback): Error at parameter 'details': Unexpected property: 'title'.]
        // title: tab.title,
        // visitTime: tab.lastAccessed,
      })
    } catch (e) {
      console.debug(`${tab.url} cannot be added to history with error ${e}`)
    }
  }
}

const storeTabs = async (tabs: BrowserTabs, listId?: string) => {
  const opts = await options.getOptions()

  const validTabs = tabs.filter(tab => {
    if (!tab.url) return false
    // It's useless to store tab that are app self.
    if (tab.url.startsWith(AppUrl)) return false
    // Normally, we don't want to store tab that are not legal except user need it.
    if (opts.excludeIllegalURL && !isLegalURL(tab.url)) return false

    if (opts.ignorePinned && tab.pinned) return false

    return true
  })

  if (tabs.length === 0) return

  if (listId) {
    const list = await storage.lists.getListById(listId)

    if (!list) return

    await storage.tabs.createTabs(validTabs, listId)
  } else {
    const list = await storage.lists.createList()

    if (opts.pinNewList && !listId) {
      await storage.lists.updateList(list.id, { pinned: true })
    }

    await storage.tabs.createTabs(validTabs, list.id)
  }

  if (opts.addHistory) addTabsToHistory(validTabs)

  await browser.tabs.remove(tabs.map(tab => tab.id).filter(i => i) as number[])
}

const createStoreMethodForGroupedTabs = (
  side: 'left' | 'right' | 'twoSides',
) => {
  return async (listId?: string) => {
    const groups = await groupTabsInCurrentWindow()
    if (!groups) return
    await storeTabs(groups[side], listId)
  }
}

const storeLeftTabs = createStoreMethodForGroupedTabs('left')
const storeRightTabs = createStoreMethodForGroupedTabs('right')
const storeTwoSidesTabs = createStoreMethodForGroupedTabs('twoSides')

const storeSelectedTabs = async (listId?: string) => {
  const [tabs, allTabs] = await Promise.all([
    getSelectedTabs(),
    getAllTabsInCurrentWindow(),
  ])

  if (tabs.length === allTabs?.length) {
    openTabList()
  }

  await storeTabs(tabs, listId)
}

const storeAllTabs = async (listId?: string) => {
  const tabs = await getAllTabsInCurrentWindow()
  if (!tabs) return console.error('unexpected empty result of get tabs in current window')
  const opts = await options.getOptions()
  if (opts.openTabListNoTab) {
    openTabList()
  }
  return storeTabs(tabs, listId)
}

const storeAllTabsInAllWindows = async () => {
  const windows = await browser.windows.getAll()
  const tasks = windows.map(async window => {
    if (!window.id) return
    const tabs = await getAllInWindow(window.id)
    if (!tabs) return
    return storeTabs(tabs)
  })
  return Promise.all(tasks)
}

const restoreTabs = async (tabs: Tab[], windowId?: number) => {
  const opts = await options.getOptions()
  let indexOffset = 0
  if (opts.openEnd) {
    const allTabs = await getAllTabsInCurrentWindow()
    if (!allTabs) return
    indexOffset = allTabs.length
  }
  for (const tab of tabs) {
    await browser.tabs.create({
      url: tab.url,
      index: indexOffset,
      pinned: tab.pinned,
      windowId,
    })
  }
}

const restoreList = async (listId: string, windowId?: number) => {
  const tabs = await storage.tabs.getSortedTabsByList(listId)
  await restoreTabs(tabs, windowId)
}

const restoreListInNewWindow = async (listId: string) => {
  const tabs = await storage.tabs.getSortedTabsByList(listId)
  await browser.windows.create({ url: tabs.map(i => i.url) })
}

const restoreLatestList = async () => {
  const list = await storage.lists.getLatestList()
  if (!list) return
  await restoreList(list.id)
}

const openTabList = async () => {
  const window = await browser.runtime.getBackgroundPage()
  const appTabIds = (window.appTabIds = window.appTabIds || {})
  const currentWindow = await browser.windows.getCurrent()
  const windowId = currentWindow.id
  const tabListsUrl = browser.runtime.getURL('index.html#/app/')
  if (!windowId) return
  const existAppTabId = appTabIds[windowId]
  if (existAppTabId) {
    const tabs = await getAllInWindow(windowId)
    const tab = tabs.find(tab => tab.id === existAppTabId)
    if (tab) {
      if (tab.url?.startsWith(tabListsUrl)) {
        return browser.tabs.update(tab.id, { active: true })
      }
      delete window.appTabIds[windowId]
    }
  }
  const createdTab = await browser.tabs.create({ url: tabListsUrl })
  if (!createdTab.id) return
  window.appTabIds[windowId] = createdTab.id
}

export const tabsManager = {
  getSelectedTabs,
  groupTabsInCurrentWindow,
  storeLeftTabs,
  storeRightTabs,
  storeTwoSidesTabs,
  storeSelectedTabs,
  storeAllTabs,
  storeAllTabsInAllWindows,
  restoreTabs,
  restoreList,
  restoreListInNewWindow,
  restoreLatestList,
  openTabList,
}
