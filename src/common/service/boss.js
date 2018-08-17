import browser from 'webextension-polyfill'
import { getSyncItems } from '@/common/storage'

const apiUrl = 'https://boss.cnwangjie.com'
const tokenKey = 'boss_token'
const tokenHeader = 'auth'

const getToken = async () => {
  const {[tokenKey]: existedToken} = await browser.storage.local.get(tokenKey)
  if (existedToken) return existedToken
  console.log('[boss]: getting token')
  const lend = browser.identity.getRedirectURL()
  const authUrl = apiUrl + '/auth/google'
  const to = await new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow({
      url: authUrl + '?state=ext:' + encodeURIComponent(lend),
      interactive: true,
    }, to => {
      const err = chrome.runtime.lastError
      if (err) reject(err)
      resolve(to)
    })
  })
  const token = /#(.*)#/.exec(to)[1]
  console.log('[boss]: got token', token)
  await browser.storage.local.set({[tokenKey]: token})
  return token
}

const fetchData = async (uri = '', method = 'GET', data = {}) => {
  const headers = new Headers
  const token = await getToken().catch(async err => {
    console.error(err)
    await new Promise(resolve => setTimeout(resolve), 5000)
    return getToken()
  })
  if (token) headers.append(tokenHeader, token)

  const option = {
    headers,
    method,
    mode: 'cors',
  }

  let requestBody = Object.keys(data).map(key => {
    return key + '=' + encodeURIComponent(data[key])
  }).filter(i => i).join('&')

  if (['POST', 'PUT'].includes(method)) {
    headers.append('Content-Type', 'application/x-www-form-urlencoded')
    option.body = requestBody
  } else {
    uri += '?' + requestBody
  }

  return fetch(apiUrl + uri, option)
    .then(async res => {
      // use new token
      if (res.headers.get(tokenHeader)) {
        await browser.storage.local.set({[tokenKey]: res.headers.get(tokenHeader)})
      }
      return res
    })
    .then(res => {
      if (res.status === 200) return res.json()
      else return res.text()
    })
    .catch(err => {
      // remove expired token
      browser.storage.local.remove(tokenKey)
      console.error(err)
      return {
        status: 'error',
        error: 'response_error',
        msg: 'Internal Server Error',
      }
    })
}

let uid = ''
let updatedAt = 0 // remote updatedAt

const getInfo = () => fetchData('/api/info').then(data => {
  uid = data.uid
  updatedAt = new Date(data.updatedAt).getTime()
  return data
})
const getLists = () => fetchData('/api/lists')
const setLists = lists => fetchData('/api/lists', 'PUT', {lists})
const getOpts = () => fetchData('/api/opts')
const setOpts = opts => fetchData('/api/opts', 'PUT', {opts})

export const syncWithBoss = async () => {
  console.log('[boss]: ready to sync with boss')
  const syncItems = await getSyncItems()
  if (syncItems.length === 0) return
  try {
    await getInfo()
  } catch (e) { // if not auth
    await getInfo()
  }
  const syncTime = updatedAt
  const {time: localTime} = await browser.storage.local.get('time') || 0
  console.log('[boss]: sync', syncTime, 'local', localTime,
    syncTime === localTime ? ''
    : syncTime > localTime ? 'sync -> local'
    : 'local -> sync')
  if (syncTime === localTime) return true
  chrome.runtime.sendMessage({syncStart: true})
  if (syncItems.includes('opts')) {
    if (syncTime > localTime) {
      const lists = await getLists()
      await browser.storage.local.set({lists})
    } else {
      const {lists} = await browser.storage.local.get('lists')
      await setLists(JSON.stringify(lists))
    }
  }
  if (syncItems.includes('lists')) {
    if (syncTime > localTime) {
      const opts = await getOpts()
      await browser.storage.local.set({opts})
    } else {
      const {opts} = await browser.storage.local.get('opts')
      await setOpts(JSON.stringify(opts))
    }
  }
  await getInfo()
  browser.storage.local.set({time: updatedAt})
  chrome.runtime.sendMessage({syncEnd: updatedAt})
  console.log('[boss]: synchronized')
  return true
}

export default {
  getInfo,
  sync: syncWithBoss,
  uid,
  updatedAt,
}

if (DEBUG) window.syncWithBoss = syncWithBoss
