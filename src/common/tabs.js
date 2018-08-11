import storage from './storage'
import list from './list'
import _ from 'lodash'
import browser from 'webextension-polyfill'

const pickedTabAttrs = ['url', 'title', 'favIconUrl', 'pinned']

const pickTabs = tabs => tabs.map(tab => {
  const pickedTab = _.pick(tab, pickedTabAttrs)
  pickedTab.muted = tab.mutedInfo && tab.mutedInfo.muted
  return pickedTab
})

const getAllInWindow = windowId => browser.tabs.query({windowId})

const openTabLists = async () => {
  // open only one in a window
  const window = await browser.runtime.getBackgroundPage()
  if (!_.isObject(window.appTabId)) window.appTabId = {}
  const currentWindow = await browser.windows.getCurrent()
  const windowId = currentWindow.id

  if (windowId in window.appTabId) {
    const tabs = await getAllInWindow(windowId)
    const tabIndex = tabs.findIndex(tab => tab.id === window.appTabId[windowId])
    if (tabIndex !== -1)
      return browser.tabs.highlight({ windowId, tabs: tabIndex })
  }
  const createdTab = await browser.tabs.create({url: browser.runtime.getURL('index.html#/app/')})
  window.appTabId[windowId] = createdTab.id
}

const openAboutPage = async () => {
  window.open(browser.runtime.getURL('index.html#/app/about'))
}

const getSelectedTabs = () => browser.tabs.query({highlighted: true, currentWindow: true})

const getAllTabsInCurrentWindow = async () => {
  const currentWindow = await browser.windows.getCurrent()
  return getAllInWindow(currentWindow.id)
}

const groupTabsInCurrentWindow = async () => {
  const tabs = await getAllTabsInCurrentWindow()
  const result = { left: [], right: [] }
  let currentIsRight = false
  for (const tab of tabs) {
    if (tab.highlighted) {
      currentIsRight = true
    } else if (currentIsRight) result.right.push(tab)
    else result.left.push(tab)
  }
  result.twoSide = result.left.concat(result.right)
  return result
}

const storeLeftTabs = async () => storeTabs((await groupTabsInCurrentWindow()).left)
const storeRightTabs = async () => storeTabs((await groupTabsInCurrentWindow()).right)
const storeTwoSideTabs = async () => storeTabs((await groupTabsInCurrentWindow()).twoSide)

const storeTabs = async tabs => {
  const appUrl = browser.runtime.getURL('')
  tabs = tabs.filter(i => !i.url.startsWith(appUrl))
  const opts = await storage.getOptions()
  if (opts.ignorePinned) tabs = tabs.filter(i => !i.pinned)
  if (tabs.length === 0) return
  browser.tabs.remove(tabs.map(i => i.id))
  const lists = await storage.getLists()
  const newList = list.createNewTabList({tabs: pickTabs(tabs)})
  if (opts.pinNewList) newList.pinned = true
  lists.unshift(newList)
  await storage.setLists(lists)
  if (opts.addHistory) {
    for (let i = 0; i < tabs.length; i += 1) {
      await browser.history.addUrl({url: tabs[i].url})
    }
  }
}

const storeSelectedTabs = async () => {
  const tabs = await getSelectedTabs()
  const allTabs = await getAllTabsInCurrentWindow()
  if (tabs.length === allTabs.length) await openTabLists()
  return storeTabs(tabs)
}

const storeAllTabs = async () => {
  const tabs = await getAllTabsInCurrentWindow()
  await openTabLists()
  return storeTabs(tabs)
}

const storeAllTabInAllWindows = async () => {
  const windows = await browser.windows.getAll()
  await openTabLists()
  for (const window of windows) {
    const tabs = await getAllInWindow(window.id)
    storeTabs(tabs)
  }
}

const restoreList = async (list, windowId) => {
  for (let i = 0; i < list.tabs.length; i += 1) {
    const tab = list.tabs[i]
    const createdTab = await browser.tabs.create({
      url: tab.url,
      pinned: tab.pinned,
      index: i,
      windowId,
    })
    if (tab.muted) browser.tabs.update(createdTab.id, {muted: true})
  }
}

const restoreListInNewWindow = async list => {
  const createdWindow = await browser.windows.create({url: list.tabs.map(i => i.url)})
  list.tabs.map((tab, index) => {
    if (tab.muted) browser.tabs.update(createdWindow.tabs[index].id, {muted: true})
  })
}

const openTab = async tab => browser.tabs.create({ url: tab.url })

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
  openTab,
  openTabLists,
  openAboutPage,
}
