const getLists = () => new Promise((resolve, reject) => {
  chrome.storage.local.get('lists', i => resolve(i.lists || []))
})

const setLists = lists => new Promise((resolve, reject) => {
  if (!Array.isArray(lists)) return reject(new TypeError(lists))
  const handledLists = lists.filter(i => Array.isArray(i.tabs))
  chrome.storage.local.set({lists: handledLists}, resolve)
})

export default {getLists, setLists}