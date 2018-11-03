import {
  TOKEN_KEY,
  AUTH_HEADER,
} from '../constants'
import {isBackground} from '../utils'
import browser from 'webextension-polyfill'

const apiUrl = 'http://127.0.0.1:3000' // TODO: use online address

const hasToken = async () => TOKEN_KEY in await browser.storage.local.get(TOKEN_KEY)

const getToken = async () => {
  const {token: localToken} = await browser.storage.local.get(TOKEN_KEY)
  if (localToken) return localToken
  const {token: remoteToken} = await browser.storage.sync.get(TOKEN_KEY)
  if (remoteToken) return remoteToken
}

const setToken = async token => {
  await browser.storage.local.set({[TOKEN_KEY]: token})
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

  return fetch(apiUrl + uri, option)
    .then(async res => {
      // use new token
      if (res.headers.has(AUTH_HEADER)) {
        const newToken = res.headers.get(AUTH_HEADER)
        console.debug('[boss]: got new token', newToken)
        await setToken(newToken)
      }
      return res
    })
    .then(res => res.json())
    .then(res => {
      if (res.status === 'error') throw new Error(res.message)
      return res
    })
    .catch(async err => {
      // remove expired token
      if (err.status === 401) {
        await removeToken()
      } else {
        console.error(err)
        throw new Error('Internal Server Error')
      }
    })
}

const getInfo = () => fetchData('/api/info').then(info => {
  info.optsUpdatedAt = Date.parse(info.optsUpdatedAt) || 0
  info.listsUpdatedAt = Date.parse(info.listsUpdatedAt) || 0
  return info
})
const getLists = () => fetchData('/api/lists')
const setLists = lists => fetchData('/api/lists', 'PUT', {lists})
const getOpts = () => fetchData('/api/opts')
const setOpts = opts => fetchData('/api/v2/opts', 'PUT', {opts})
const changeListBulk = changes => fetchData('/api/v2/lists/bulk', 'POST', {changes})

const uploadWholeLists = async () => {
  const {lists} = await browser.storage.local.get('lists')
  if (!lists) return
  const result = await setLists(lists)
  result.listsUpdatedAt = Date.parse(result.listsUpdatedAt)
  return result
}

const uploadOperations = async () => {
  const {ops} = await browser.storage.local.get('ops')
  if (!ops) return
  const time = Date.now()
  const changes = ops.sort((a, b) => a.time - b.time).map(op => ([op.method, ...op.args]))
  const result = await changeListBulk(changes)
  if (result.status === 'success') {
    const {ops} = await browser.storage.local.get('ops')
    await browser.storage.local.set({ops: ops.filter(op => op.time > time)})
  }
  result.listsUpdatedAt = Date.parse(result.listsUpdatedAt)
  return result
}

const applyRemoteLists = async () => {
  const lists = await getLists()
  await browser.storage.local.set({lists})
  return getInfo()
}

const uploadOpts = async () => {
  const {opts} = await browser.storage.local.get('opts')
  const result = await setOpts(opts)
  result.optsUpdatedAt = Date.parse(result.optsUpdatedAt)
  return result
}

const applyRemoteOpts = async () => {
  const opts = await getOpts()
  return browser.storage.local.set({opts})
}

const refresh = async () => {
  if (!(await hasToken())) return
  const remoteInfo = await getInfo()
  const localInfo = await browser.storage.local.get(['listsUpdatedAt', 'optsUpdatedAt'])
  localInfo.listsUpdatedAt = localInfo.listsUpdatedAt || 0
  localInfo.optsUpdatedAt = localInfo.optsUpdatedAt || 0

  const {ops} = await browser.storage.local.get('ops')
  if (remoteInfo.listsUpdatedAt === 0) {
    const {listsUpdatedAt} = await uploadWholeLists()
    await browser.storage.local.set({listsUpdatedAt})
  } else if (ops && ops.length) {
    // normal lists sync logic: apply local operations firstly
    const {listsUpdatedAt} = await uploadOperations()
    await browser.storage.local.set({listsUpdatedAt})
  }
  // apply remote lists if remote lists update time later than local
  if (remoteInfo.listsUpdatedAt > localInfo.listsUpdatedAt) {
    const {listsUpdatedAt} = await applyRemoteLists()
    await browser.storage.local.set({listsUpdatedAt})
  }

  if (localInfo.optsUpdatedAt > remoteInfo.optsUpdatedAt) {
    const {optsUpdatedAt} = await uploadOpts()
    await browser.storage.local.set({optsUpdatedAt})
  } else if (localInfo.optsUpdatedAt < remoteInfo.optsUpdatedAt) {
    await applyRemoteOpts()
    await browser.storage.local.set({optsUpdatedAt: remoteInfo.optsUpdatedAt})
  }
  await browser.runtime.sendMessage({refreshed: true})
}

const login = async token => {
  if (await hasToken()) return
  await setToken(token)
  await getInfo()
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
  if (window._timerInited || !await isBackground()) return
  window._timerInited = true
  window.setInterval(() => {
    if (!navigator.onLine) return
    refresh()
  }, 60000)
}

export default {
  hasToken,
  refresh,
  login,
  initTimer,
}
