import _ from 'lodash'
import {
  TOKEN_KEY,
  AUTH_HEADER,
} from '../constants'
import browser from 'webextension-polyfill'

const apiUrl = 'https://boss.cnwangjie.com'

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
const getOpts = () => fetchData('/api/opts')
const setOpts = opts => fetchData('/api/v2/opts', 'PUT', {opts})
const changeListBulk = changes => fetchData('/api/v2/lists/bulk', 'POST', {changes})

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
  const {listsUpdatedAt} = browser.storage.local.set(lists)
  return Date.parse(listsUpdatedAt)
}

const uploadOpts = async () => {
  const {opts} = await browser.storage.local.get('opts')
  const optsUpdatedAt = await setOpts(opts)
  const result = await browser.storage.local.set(optsUpdatedAt)
  result.optsUpdatedAt = Date.parse(result.optsUpdatedAt)
  return result
}

const applyRemoteOpts = async () => {
  const opts = await getOpts()
  return browser.storage.local.set(opts)
}

const refresh = async () => {
  const remoteInfo = await getInfo()
  const localInfo = await browser.storage.local.get(['listsUpdatedAt', 'optsUpdatedAt'])
  localInfo.listsUpdatedAt = localInfo.listsUpdatedAt || 0
  localInfo.optsUpdatedAt = localInfo.optsUpdatedAt || 0

  // normal lists sync logic: apply local operations firstly
  const {ops} = await browser.storage.local.get('ops')
  if (ops && ops.length) {
    const {listsUpdatedAt} = await uploadOperations()
    await browser.storage.local.set({listsUpdatedAt})
  }
  // apply remote lists if remote lists update time later than local
  if (remoteInfo.listsUpdatedAt > localInfo.listsUpdatedAt) {
    const listsUpdatedAt = await applyRemoteLists()
    await browser.storage.local.set({listsUpdatedAt})
  }

  if (localInfo.optsUpdatedAt > remoteInfo.optsUpdatedAt) {
    const {optsUpdatedAt} = await uploadOpts()
    await browser.storage.local.set({optsUpdatedAt})
  } else if (localInfo.optsUpdatedAt < remoteInfo.optsUpdatedAt) {
    await applyRemoteOpts()
    await browser.storage.local.set({optsUpdatedAt: remoteInfo.optsUpdatedAt})
  }
}

export default {
  hasToken,
  refresh,
}
