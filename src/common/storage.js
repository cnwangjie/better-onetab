const getLists = () => new Promise((resolve, reject) => {
  chrome.storage.local.get('lists', i => resolve(i.lists || []))
})

const setLists = lists => new Promise((resolve, reject) => {
  chrome.storage.local.set({lists}, resolve)
})

export default {getLists, setLists}