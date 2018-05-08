import storage from './storage'
import list from './list'

const getSelectedTabs = () => new Promise((resolve, reject) => {
  chrome.tabs.query({highlighted: true, pinned: false}, resolve)
})

const storeSelectedTabs = () => getSelectedTabs()
  .then(tabs => {
    chrome.tabs.remove(tabs.map(i => i.id))
    return storage.getLists().then(lists => {
      lists.push(list.createNewTabList({tabs}))
      return lists
    })
  }).then(newlists => {
    storage.setLists(newlists)
    return newlists
  })

const restoreList = list => {
  list.tabs.map(tab => {
    chrome.tabs.create({
      url: tab.url,
      pinned: tab.pinned,
      index: tab.index,
    }, createdtab => {
      if (tab.muted) chrome.tabs.update(createdtab.id, {
        muted: true
      })
    })
  })
}

export default {getSelectedTabs, storeSelectedTabs, restoreList}