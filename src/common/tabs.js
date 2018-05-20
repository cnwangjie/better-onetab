import storage from './storage'
import list from './list'
import _ from 'lodash'
import cp from 'chrome-promise'

const pickedTabAttrs = ['url', 'title', 'favIconUrl', 'pinned']

const pickTabs = tabs => tabs.map(tab => {
  const pickedTab = _.pick(tab, pickedTabAttrs)
  pickedTab.muted = tab.mutedInfo && tab.mutedInfo.muted
  return pickedTab
})

const openTabLists = async () => {
  // open only one in a window
  const window = await cp.runtime.getBackgroundPage()
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

const getSelectedTabs = () => cp.tabs.query({highlighted: true})

const getAllTabsInCurrentWindow = async () => {
  const currentWindow = await cp.windows.getCurrent()
  return cp.tabs.getAllInWindow(currentWindow.id)
}

const storeTabs = async tabs => {
  chrome.tabs.remove(tabs.map(i => i.id))
  const lists = await storage.getLists()
  lists.unshift(list.createNewTabList({tabs: pickTabs(tabs)}))
  await storage.setLists(lists)
  const opts = await storage.getOptions()
  if (opts.addHistory) {
    for (let i = 0; i < tabs.length; i += 1) {
      await cp.history.addUrl({url: tabs[i].url})
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

const restoreList = async (list, windowId) => {
  for (let i = 0; i < list.tabs.length; i += 1) {
    const tab = list.tabs[i]
    const createdTab = await cp.tabs.create({
      url: tab.url,
      pinned: tab.pinned,
      index: i,
      windowId,
    })
    if (tab.muted) chrome.tabs.update(createdTab.id, {muted: true})
  }
}

const restoreListInNewWindow = async list => {
  const createdWindow = await cp.windows.create({})
  const newTab = await cp.tabs.getAllInWindow(createdWindow.id).then(i => i.shift())
  await restoreList(list, createdWindow.id)
  chrome.tabs.remove([newTab.id])
}

const openTab = async tab => cp.tabs.create({ url: tab.url })

export default {
  getSelectedTabs,
  storeSelectedTabs,
  storeAllTabs,
  restoreList,
  restoreListInNewWindow,
  openTab,
  openTabLists,
}