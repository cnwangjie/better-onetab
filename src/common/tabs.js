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

const getSelectedTabs = () => cp.tabs.query({highlighted: true})

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
  return storeTabs(tabs)
}

const storeAllTabs = async () => {
  const currentWindow = await cp.windows.getCurrent()
  const tabs = await cp.tabs.getAllInWindow(currentWindow.id)
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
}