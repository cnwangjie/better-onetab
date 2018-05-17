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

const storeSelectedTabs = async () => {
  const tabs = await getSelectedTabs()
  chrome.tabs.remove(tabs.map(i => i.id))
  const lists = await storage.getLists()
  lists.push(list.createNewTabList({tabs: pickTabs(tabs)}))
  storage.setLists(lists)
}

const restoreList = async (list, windowId) => {
  for (let i = 0; i < list.tabs.length; i += 1) {
    const createdTab = await cp.tabs.create({
      url: tab.url,
      pinned: tab.pinned,
      index,
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

export default {
  getSelectedTabs,
  storeSelectedTabs,
  restoreList,
  restoreListInNewWindow,
}