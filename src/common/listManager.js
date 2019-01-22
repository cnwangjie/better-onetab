import _ from 'lodash'
import browser from 'webextension-polyfill'
import {
  SYNCED_LIST_PROPS,
  END_FRONT,
  END_BACKGROUND,
  ADD_LIST,
  UPDATE_LIST_BY_ID,
  REMOVE_LIST_BY_ID,
  CHANGE_LIST_ORDER,
} from './constants'
import {isBackground} from './utils'

const cache = { lists: null, ops: null }
let _readingStorage = false
const getStorage = async () => {
  if (_readingStorage) {
    await new Promise(resolve => {
      const interval = setInterval(() => {
        if (_readingStorage) return
        clearInterval(interval)
        resolve()
      }, 100)
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
    if (op.args && op.args[0] && removed.includes(op.args[0]._id)
      || typeof op.args[0] === 'string' && removed.includes(op.args[0])) continue

    if (op.method === 'removeListById') {
      removed.push(op.args[0])
      finalOps.unshift(op)
    } else if (op.method === 'updateListById') {
      // keep the final result of every property if a list will be updated
      const [listId, newList, time] = op.args
      if (updated[listId]) {
        for (const key in newList) {
          if (key in updated[listId]) continue
          updated[listId][key] = newList[key]
        }
        continue
      } else {
        updated[listId] = Object.assign({}, newList)
        finalOps.unshift({method: 'updateListById', args: [listId, updated[listId], time]})
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
  [ADD_LIST](lists, [list]) {
    if (~lists.findIndex(i => i._id === list._id)) return
    lists.unshift(list)
    return [list]
  },
  [UPDATE_LIST_BY_ID](lists, [listId, newList, time = Date.now()]) {
    const normal = Object.keys(newList).some(k => SYNCED_LIST_PROPS.includes(k))
    for (let i = 0; i < lists.length; i += 1) {
      if (lists[i]._id !== listId) continue
      const list = lists[i]
      for (const [k, v] of Object.entries(newList)) {
        list[k] = v
      }
      if (normal) list.updatedAt = time
      return normal ? [listId, newList, time] : null
    }
  },
  [REMOVE_LIST_BY_ID](lists, [listId]) {
    const index = lists.findIndex(list => list._id === listId)
    lists.splice(index, 1)
    return [listId]
  },
  [CHANGE_LIST_ORDER](lists, [listId, diff]) {
    const index = lists.findIndex(list => list._id === listId)
    const [list] = lists.splice(index, 1)
    lists.splice(index + diff, 0, list)
    return [listId, diff]
  },
}

// avoid getting storage at the same time
const _modifyQueue = []
const _startModifyWork = (lists, ops) => {
  while (_modifyQueue.length !== 0) {
    const [method, args] = _modifyQueue.shift()
    const opArgs = manager.modifiers[method](lists, args)
    if (opArgs) ops.push({method, args: opArgs, time: Date.now()})
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
manager.mapMutations = () => {
  const mutations = {}
  Object.entries(manager.modifiers).forEach(([method, fn]) => {
    mutations[method] = (state, payload) => fn(state.lists, payload)
  })
  return mutations
}
manager.createVuexPlugin = () => store => {
  addEventListener(END_BACKGROUND, (method, args) => {
    store.commit(method, args)
  })
  store.subscribe(({type, payload}) => {
    if (type in manager.modifiers) {
      manager[type](...payload)
    }
  })
}
manager.idle = () => new Promise(resolve => {
  const interval = setInterval(() => {
    if (cache.lists) return
    clearInterval(interval)
    resolve()
  }, 100)
})
export default manager
