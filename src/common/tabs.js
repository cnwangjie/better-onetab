import storage from './storage'
import list from './list'
import _ from 'lodash'

const pickedTabAttrs = ['url', 'title', 'favIconUrl', 'pinned']

const pickTabs = tabs => tabs.map(tab => {
  const pickedTab = _.pick(tab, pickedTabAttrs)
  pickedTab.muted = tab.mutedInfo && tab.mutedInfo.muted
  return pickedTab
})

const getSelectedTabs = () => new Promise((resolve, reject) => {
  chrome.tabs.query({highlighted: true, pinned: false}, resolve)
})

const storeSelectedTabs = () => getSelectedTabs()
  .then(tabs => {
    chrome.tabs.remove(tabs.map(i => i.id))
    return storage.getLists().then(lists => {
      lists.push(list.createNewTabList({tabs: pickTabs(tabs)}))
      return lists
    })
  }).then(newlists => {
    storage.setLists(newlists)
    return newlists
  })

const restoreList = (list, windowId) => {
  list.tabs.map((tab, index) => {
    chrome.tabs.create({
      url: tab.url,
      pinned: tab.pinned,
      index,
      windowId,
    }, createdtab => {
      if (tab.muted) chrome.tabs.update(createdtab.id, {
        muted: true
      })
    })
  })
}

const restoreListInNewWindow = list => {
  chrome.windows.create({}, createdWindow => {
    restoreList(list, createdWindow.id)
  })
}

export default {
  getSelectedTabs,
  storeSelectedTabs,
  restoreList,
  restoreListInNewWindow,
}