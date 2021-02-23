import {
  TOKEN_KEY,
  AUTH_HEADER,
  SYNC_SERVICE_URL,
  SYNC_MAX_INTERVAL,
  SYNC_MIN_INTERVAL,
} from '../constants'
import _ from 'lodash'
import storage from '../storage'
import listManager from '../listManager'
import {isBackground, timeout, sendMessage} from '../utils'
import browser from 'webextension-polyfill'
import io from 'socket.io-client'
import logger from '../logger'

const hasToken = async () => TOKEN_KEY in await browser.storage.local.get(TOKEN_KEY)

const getToken = async () => {
  const {token: localToken} = await browser.storage.local.get(TOKEN_KEY)
  if (localToken) return localToken
  const {token: remoteToken} = await browser.storage.sync.get(TOKEN_KEY)
  if (remoteToken) return remoteToken
}

const setToken = async token => {
  await browser.storage.local.set({[TOKEN_KEY]: token, tokenIssued: Date.now()})
  await browser.storage.sync.set({[TOKEN_KEY]: token})
}

const removeToken = async () => {
  await browser.storage.local.remove(TOKEN_KEY)
  await browser.storage.sync.remove(TOKEN_KEY)
}

const fetchData = async (uri = '', method = 'GET', data = {}) => {
  const headers = new Headers()
  const token = await getToken()
  if (token) headers.append(AUTH_HEADER, token)
  const option = {
    headers,
    method,
    mode: 'cors',
  }

  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    headers.append('Content-Type', 'application/json')
    option.body = JSON.stringify(data)
  } else {
    uri += '?' + Object.keys(data).map(key => {
      if (typeof data[key] === 'object') data[key] = JSON.stringify(data[key])
      return key + '=' + encodeURIComponent(data[key])
    }).filter(i => i).join('&')
  }

  const res = await fetch(SYNC_SERVICE_URL + uri, option)
  if (res.headers.has(AUTH_HEADER)) {
    const newToken = res.headers.get(AUTH_HEADER)
    console.debug('[boss]: got new token', newToken)
    await setToken(newToken)
  }
  if (res.ok) return res.json()
  if (res.status === 401) await removeToken()
  const err = await res.json()
  throw new Error(err.message)
}

const getInfo = () => fetchData('/api/info').then(info => {
  info.optsUpdatedAt = Date.parse(info.optsUpdatedAt) || 0
  info.listsUpdatedAt = Date.parse(info.listsUpdatedAt) || 0
  return info
})

const setWSToken = token => {
  if (!window._socket) return
  window._socket.io.opts.query = {
    [AUTH_HEADER]: token,
  }
}

const _socketEmitTimeout = (socket, event, arg) => timeout(new Promise((resolve, reject) => {
  const cb = result => result && result.err ? reject(result.err) : resolve(result)
  if (arg) socket.emit(event, arg, cb)
  else socket.emit(event, cb)
}), 5000)

const uploadOpsViaWS = async () => {
  const socket = window._socket
  if (!socket || !socket.connected) throw new Error('socket not connected')
  const {ops} = await browser.storage.local.get('ops')
  if (ops) {
    const changes = ops.sort((a, b) => a.time - b.time)
    while (changes && changes.length) {
      const change = changes.shift()
      await _socketEmitTimeout(socket, 'list.update', change)
    }
  }
  await browser.storage.local.remove('ops')
}

const downloadRemoteLists = async () => {
  const socket = window._socket
  if (!socket || !socket.connected) throw new Error('socket not connected')
  const remoteTime = await _socketEmitTimeout(socket, 'list.time')
  const {listsUpdatedAt: localTime} = await browser.storage.local.get('listsUpdatedAt')
  if (remoteTime === localTime) return
  const remoteLists = await _socketEmitTimeout(socket, 'list.all')
  const localLists = _.keyBy(await storage.getLists(), list => list._id)
  const finallyLists = []
  const fetching = {}
  remoteLists.forEach(list => {
    if (!(list._id in localLists) || localLists.updatedAt < list.updatedAt) {
      fetching[list._id] = _socketEmitTimeout(socket, 'list.get', list._id)
      finallyLists.push(list._id)
    } else {
      finallyLists.push(localLists[list._id])
    }
  })
  console.log(finallyLists)
  await Promise.all(Object.values(fetching))
  for (let i = 0; i < finallyLists.length; i += 1) {
    if (typeof finallyLists[i] === 'string') {
      finallyLists[i] = await fetching[finallyLists[i]] // eslint-disable-line
    }
  }
  console.log(finallyLists)
  await storage.setLists(finallyLists)
  await browser.storage.local.set({listsUpdatedAt: remoteTime})
}

const syncLists = async () => {
  const unlock = await listManager.RWLock.lock()
  try {
    await uploadOpsViaWS()
    await downloadRemoteLists()
  } catch (error) {
    throw error
  } finally {
    await unlock()
  }
}

const getRemoteOptionsUpdatedTimeViaWS = () => _socketEmitTimeout(window._socket, 'opts.time')

const getRemoteOptions = () => _socketEmitTimeout(window._socket, 'opts.all')

const setRemoteOptions = (opts, time) => _socketEmitTimeout(window._socket, 'opts.set', { opts, time })

const syncOptions = async () => {
  const remoteTime = await getRemoteOptionsUpdatedTimeViaWS()
  const {optsUpdatedAt: localTime} = await browser.storage.local.get('optsUpdatedAt')
  if (remoteTime > localTime) {
    const opts = await getRemoteOptions()
    await browser.storage.local.set({opts, optsUpdatedAt: remoteTime})
  } else if (remoteTime < localTime) {
    const opts = await storage.getOptions()
    await setRemoteOptions(opts, localTime)
  }
}

/**
 * latest sync logic
 * date: 2019-01-21
 *
 * options:
 *  - record the time when options are changed
 *  - get remote options updated time
 *  - if local time is later than remote upload local options to remote and set remote time, else if local time is before than remote download the remote options and set local time
 *
 * lists:
 *  - record each time of list be updated (UPDATE_LIST_BY_ID)
 *  - upload local operations to remote (include the time and save in server storage)
 *  - compare the latest updated time of each list
 *  - if local time is before than remote download that remote list
 *
 */
let _refreshing = false
const refresh = async () => {
  if (_refreshing || !(await hasToken())) return

  _refreshing = true
  await sendMessage({refreshing: true})
  try {
    await timeout(Promise.all([syncOptions(), syncLists()]), 20000)
    await sendMessage({refreshed: {success: true}})
  } catch (err) {
    logger.error(err)
    await sendMessage({refreshed: {success: false}})
  } finally {
    _refreshing = false
  }
}

const login = async token => {
  if (await hasToken()) return
  await setToken(token)
  const {uid} = await getInfo()
  await sendMessage({logged: {uid}})
  const loginNotificationId = 'login'
  browser.notifications.create(loginNotificationId, {
    type: 'basic',
    iconUrl: 'assets/icons/icon_128.png',
    title: 'you have login to boss successfully',
    message: '',
  })
  setTimeout(() => {
    browser.notifications.clear(loginNotificationId)
  }, 5000)
  await refresh()
}

const initTimer = async () => {
  if (window._syncTimer || !(await isBackground())) return

  const _nextTimer = time => {
    window._syncTimer = setTimeout(async () => {
      if (await hasToken()) {
        getInfo() // for update token
        if (window._socket && window._socket.connected) {
          refresh()
          return _nextTimer(time)
        }
      }
      _nextTimer(Math.min(time * 2, SYNC_MAX_INTERVAL))
    }, time)
  }

  const _refreshTimer = time => {
    clearTimeout(window._syncTimer)
    _nextTimer(time)
  }

  window.addEventListener('offline', () => _refreshTimer(SYNC_MAX_INTERVAL))
  window.addEventListener('online', () => _refreshTimer(SYNC_MIN_INTERVAL))
  browser.runtime.onMessage.addListener(({login, refreshed}) => {
    if (login || refreshed && refreshed.success) window._nextSyncInterval = SYNC_MIN_INTERVAL
  })
  _nextTimer(SYNC_MIN_INTERVAL)
}

const init = async () => {
  if (window._socket || !await isBackground()) return
  const socket = window._socket = io(SYNC_SERVICE_URL, {path: '/ws', autoConnect: false})
  setWSToken(await getToken())
  await listManager.init()
  socket.on('list.update', ({method, args}) => {
    listManager[method](...args)
  })
  socket.on('opts.set', async ({changes, time}) => {
    const {opts} = await browser.storage.local.get('opts')
    for (const [k, v] of Object.entries(changes)) {
      opts[k] = v
    }
    await browser.storage.local.set({opts, optsUpdatedAt: time})
  })
  socket.on('connect', () => refresh())
  socket.open()
  initTimer()
}

export default {
  getInfo,
  removeToken,
  hasToken,
  login,
  init,
  refresh,
}
