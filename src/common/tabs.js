import storage from './storage'
import {createNewTabList} from './list'
import _ from 'lodash'
import browser from 'webextension-polyfill'
import listManager from './listManager'
import {ILLEGAL_URLS} from './constants'
listManager.init()

const getAllInWindow = windowId => browser.tabs.query({windowId})

const openTabLists = async () => {
  // open only one in a window
  const window = await browser.runtime.getBackgroundPage()
  if (!_.isObject(window.appTabId)) window.appTabId = {}
  const currentWindow = await browser.windows.getCurrent()
  const windowId = currentWindow.id
  const tabListsUrl = browser.runtime.getURL('index.html#/app/')
  if (windowId in window.appTabId) {
    const tabs = await getAllInWindow(windowId)
    const tab = tabs.find(tab => tab.id === window.appTabId[windowId])
    if (tab) {
      if (tab.url.startsWith(tabListsUrl)) {
        return browser.tabs.update(tab.id, { active: true })
      }
      delete window.appTabId[windowId]
    }
  }
  const createdTab = await browser.tabs.create({url: tabListsUrl})
  window.appTabId[windowId] = createdTab.id
}

const openAboutPage = () => {
  window.open(browser.runtime.getURL('index.html#/app/about'))
}

const getSelectedTabs = () => browser.tabs.query({highlighted: true, currentWindow: true})

const getAllTabsInCurrentWindow = async () => {
  const currentWindow = await browser.windows.getCurrent()
  return getAllInWindow(currentWindow.id)
}

const groupTabsInCurrentWindow = async () => {
  const tabs = await getAllTabsInCurrentWindow()
  const result = { left: [], right: [], inter: [], all: tabs }
  let currentIsRight = false
  for (const tab of tabs) {
    if (tab.highlighted) {
      currentIsRight = true
      result.inter.push(tab)
    } else if (currentIsRight) result.right.push(tab)
    else result.left.push(tab)
  }
  result.twoSide = result.left.concat(result.right)
  return result
}

const isLegalURL = url => ILLEGAL_URLS.every(prefix => !url.startsWith(prefix))

const storeTabs = async (tabs, listIndex) => {
  const appUrl = browser.runtime.getURL('')
  tabs = tabs.filter(i => !i.url.startsWith(appUrl))
  const opts = await storage.getOptions()
  if (opts.ignorePinned) tabs = tabs.filter(i => !i.pinned)
  if (opts.excludeIllegalURL) tabs = tabs.filter(i => isLegalURL(i.url))
  if (tabs.length === 0) return
  browser.tabs.remove(tabs.map(i => i.id))
  const lists = await storage.getLists()
  if (listIndex == null) {
    const newList = createNewTabList({tabs})
    if (opts.pinNewList) newList.pinned = true
    lists.unshift(newList)
    await listManager.addList(newList)
  } else {
    const list = lists[listIndex]
    tabs.forEach(tab => list.tabs.push(tab))
    await listManager.updateListById(lists._id, _.pick(list, 'tabs'))
  }
  if (opts.addHistory) {
    for (let i = 0; i < tabs.length; i += 1) {
      // maybe occur Error: "An unexpected error occurred" when trying to add about:* to history
      try {
        await browser.history.addUrl({url: tabs[i].url})
      } catch (e) {
        console.debug(`${tabs[i].url} cannot be added to history`)
      }
    }
  }
}

const storeLeftTabs = async listIndex => storeTabs((await groupTabsInCurrentWindow()).left, listIndex)
const storeRightTabs = async listIndex => storeTabs((await groupTabsInCurrentWindow()).right, listIndex)
const storeTwoSideTabs = async listIndex => storeTabs((await groupTabsInCurrentWindow()).twoSide, listIndex)

const storeSelectedTabs = async listIndex => {
  const tabs = await getSelectedTabs()
  const allTabs = await getAllTabsInCurrentWindow()
  if (tabs.length === allTabs.length) await openTabLists()
  return storeTabs(tabs, listIndex)
}

const storeAllTabs = async listIndex => {
  const tabs = await getAllTabsInCurrentWindow()
  const opts = await storage.getOptions()
  if (opts.openTabListNoTab) await openTabLists()
  return storeTabs(tabs, listIndex)
}

const storeAllTabInAllWindows = async () => {
  const windows = await browser.windows.getAll()
  const opts = await storage.getOptions()
  if (opts.openTabListNoTab) await openTabLists()
  for (const window of windows) {
    const tabs = await getAllInWindow(window.id)
    await storeTabs(tabs)
  }
}

const restoreList = async (list, windowId) => {
  const opts = await storage.getOptions()
  let indexOffset = 0
  if (opts.openEnd) {
    const tabs = await getAllTabsInCurrentWindow()
    const {index} = tabs.pop()
    indexOffset = index + 1
  }
  for (let i = 0; i < list.tabs.length; i += 1) {
    const tab = list.tabs[i]
    const createdTab = await browser.tabs.create({
      url: tab.url,
      pinned: tab.pinned,
      index: i + indexOffset,
      windowId,
    })
    if (tab.muted) browser.tabs.update(createdTab.id, {muted: true})
  }
}

const restoreListInNewWindow = async list => {
  const createdWindow = await browser.windows.create({url: list.tabs.map(i => i.url)})
  list.tabs.forEach((tab, index) => {
    if (tab.muted) browser.tabs.update(createdWindow.tabs[index].id, {muted: true})
  })
}

const restoreLastestList = async () => {
  const lists = await storage.getLists()
  if (lists.length === 0) return true
  const [lastest] = lists
  await restoreList(lastest)
  if (lastest.pinned) return true
  return listManager.removeListById(lastest._id)
}

const openTab = tab => browser.tabs.create({ url: tab.url })

export default {
  getSelectedTabs,
  groupTabsInCurrentWindow,
  storeLeftTabs,
  storeRightTabs,
  storeSelectedTabs,
  storeTwoSideTabs,
  storeAllTabs,
  storeAllTabInAllWindows,
  restoreList,
  restoreListInNewWindow,
  restoreLastestList,
  openTab,
  openTabLists,
  openAboutPage,
}
