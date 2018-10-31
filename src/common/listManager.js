import _ from 'lodash'
import browser from 'webextension-polyfill'

const cache = { lists: null, ops: null }
const getStorage = async () => {
  if (cache.lists && cache.ops) return cache
  const {lists, ops} = await browser.storage.local.get(['lists', 'ops'])
  cache.lists = lists
  cache.ops = ops
  return cache
}
const saveStorage = _.debounce(async () => {
  await browser.storage.local.set(cache)
  cache.lists = cache.ops = null
}, 5000)
const manager = {}
manager.modifier = {
  addList(lists, [list]) {
    lists.unshift(list)
  },
  updateListById(lists, [listId, newList]) {
    for (const list of lists) {
      if (list._id !== listId) continue
      for (const [k, v] of Object.entries(newList)) {
        list[k] = v
      }
      return
    }
  },
  removeListById(lists, [listId]) {
    const index = lists.findIndex(list => list._id === listId)
    lists.splice(index, 1)
  },
  changeListOrderRelatively(lists, [listId, diff]) {
    const index = lists.findIndex(list => list._id === listId)
    const [list] = lists.splice(index, 1)
    lists.splice(index + diff, 0, list)
  },
}
const addEventListener = () => browser.runtime.onMessage.addListener(({listModifed}) => {
  if (!listModifed) return
  const {method, args} = listModifed
  manager[method](args)
})
const genMethods = isBackground => {
  for (const [name, func] of Object.entries(manager.methods)) {
    manager[name] = isBackground ? async (...args) => {
      const {lists, ops} = await getStorage()
      ops.push({method: name, args, time: Date.now()})
      func(lists, args)
      saveStorage()
    } : async (...args) => {
      await browser.runtime.sendMessage({listModifed: {method: name, args}})
    }
  }
}
manager.init = async () => {
  if (manager.inited) return
  const background = await browser.runtime.getBackgroundPage()
  const isBackground = window === background
  if (isBackground) await addEventListener()
  genMethods(isBackground)
  manager.inited = true
}
export default manager
