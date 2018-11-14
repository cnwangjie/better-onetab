import _ from 'lodash'
import browser from 'webextension-polyfill'
import {
  SYNCED_LIST_PROPS,
  END_FRONT,
  END_BACKGROUND,
} from './constants'
import {isBackground} from './utils'

const cache = { lists: null, ops: null }
let _readingStorage = false
const getStorage = async () => {
  if (_readingStorage) {
    await new Promise(resolve => {
      const interval = setInterval(() => {
        console.log('await reading storage')
        if (_readingStorage) return
        clearInterval(interval)
        resolve()
      }, 20)
    })
  }
  if (cache.lists && cache.ops) return cache
  _readingStorage = true
  const {lists, ops} = await browser.storage.local.get(['lists', 'ops'])
  cache.lists = lists || []
  cache.ops = ops || []
  _readingStorage = false
  return cache
}
const compressOps = ops => {
  console.debug('[listManager] compress ops: (before)', ops)
  const removed = []
  const updated = {}
  const finalOps = []
  for (let i = ops.length - 1; i > -1; i -= 1) {
    const op = ops[i]
    // ignore all actions for the list if that list will be removed finally
    if (op.args && typeof op.args[0] === 'object' && removed.includes(op.args[0]._id)
      || typeof op.args[0] === 'string' && removed.includes(op.args[0])) continue

    if (op.method === 'removeListById') {
      removed.push(op.args[0])
      finalOps.unshift(op)
    } else if (op.method === 'updateListById') {
      // keep the final result of every property if a list will be updated
      if (updated[op.args[0]]) {
        for (const key in op.args[1]) {
          if (key in updated[op.args[0]]) continue
          updated[op.args[0]][key] = op.args[1][key]
        }
        continue
      } else {
        updated[op.args[0]] = Object.assign({}, op.args[1])
        finalOps.unshift({method: 'updateListById', args: [op.args[0], updated[op.args[0]]]})
      }
    } else if (op.method === 'changeListOrderRelatively') {
      // combine the value if a list is reordered continuously
      if (i > 0 && ops[i - 1].method === 'changeListOrderRelatively' && op.args[0] === ops[i - 1].args[0]) {
        ops[i - 1].args[1] += ops[i].args[1]
      } else finalOps.unshift(op)
    } else {
      // do nothing if add a list
      finalOps.unshift(op)
    }
  }
  console.debug('[listManager] compress ops: (after)', finalOps)
  return finalOps
}
const saveStorage = _.debounce(async () => {
  cache.ops = compressOps(cache.ops)
  await browser.storage.local.set(cache)
  cache.lists = cache.ops = null
  await browser.runtime.sendMessage({refresh: true})
}, 5000)
const manager = {}
// lists modifier (return true if need to add ops)
manager.modifiers = {
  addList(lists, [list]) {
    if (~lists.findIndex(i => i._id === list._id)) return
    lists.unshift(list)
    return true
  },
  updateListById(lists, [listId, newList]) {
    const normal = Object.keys(newList).some(k => SYNCED_LIST_PROPS.includes(k))
    console.log(normal)
    for (const list of lists) {
      if (list._id !== listId) continue
      for (const [k, v] of Object.entries(newList)) {
        list[k] = v
      }
      return normal
    }
  },
  removeListById(lists, [listId]) {
    const index = lists.findIndex(list => list._id === listId)
    lists.splice(index, 1)
    return true
  },
  changeListOrderRelatively(lists, [listId, diff]) {
    const index = lists.findIndex(list => list._id === listId)
    const [list] = lists.splice(index, 1)
    lists.splice(index + diff, 0, list)
    return true
  },
}

// avoid getting storage at the same time
const _modifyQueue = []
const _startModifyWork = (lists, ops) => {
  while (_modifyQueue.length !== 0) {
    const [method, args] = _modifyQueue.shift()
    if (manager.modifiers[method](lists, args)) ops.push({method, args, time: Date.now()})
  }
  saveStorage()
}
const applyChangesToStorage = async (method, args) => {
  _modifyQueue.push([method, args])
  if (_readingStorage) return
  const {lists, ops} = await getStorage()
  _startModifyWork(lists, ops)
}
const addEventListener = (receiveFrom, callback) => browser.runtime.onMessage.addListener(({listModifed, from}) => {
  if (receiveFrom !== from || !listModifed) return
  const {method, args} = listModifed
  return callback(method, args)
})
const genMethods = isBackground => {
  Object.keys(manager.modifiers).forEach(method => {
    manager[method] = isBackground ? async (...args) => { // for background
      console.debug('[list manager] modify list:', method, ...args)
      await applyChangesToStorage(method, args)
      await browser.runtime.sendMessage({listModifed: {method, args}, from: END_BACKGROUND})
    } : async (...args) => { // for front end
      console.debug('[list manager] call to modify list:', name, ...args)
      await browser.runtime.sendMessage({listModifed: {method, args}, from: END_FRONT})
    }
  })
}
manager.init = async () => {
  if (manager.inited) return
  manager.inited = true
  const _isBackground = await isBackground()
  if (_isBackground) await addEventListener(END_FRONT, applyChangesToStorage)
  genMethods(_isBackground)
}
const receiver = []
manager.receiveBackgroundModified = async lists => {
  if (receiver.includes(lists)) return
  receiver.push(lists)
  await addEventListener(END_BACKGROUND, (method, args) => manager.modifiers[method](lists, args))
}
export default manager
