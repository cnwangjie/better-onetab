import _ from 'lodash'
import browser from 'webextension-polyfill'

const apiUrl = 'https://boss.cnwangjie.com'
const tokenKey = 'boss_token'
const tokenHeader = 'auth'

const hasToken = async () => tokenKey in await browser.storage.local.get(tokenKey)

const getToken = async auth => {
  const {[tokenKey]: existedToken, sync_info} = await browser.storage.local.get([tokenKey, 'sync_info'])
  if (auth === 'google' && sync_info && sync_info.googleId && existedToken
    || auth === 'github' && sync_info && sync_info.githubId && existedToken
    || !auth && existedToken) return existedToken
  else if (!['google', 'github'].includes(auth)) throw new Error('[boss]: unsupported auth')
  console.log('[boss]: getting token')
  const lend = browser.identity.getRedirectURL()
  const authUrl = apiUrl + `/auth/${auth}`
  const uid = sync_info ? sync_info.uid : null
  const uidPart = uid ? `;uid:${uid}` : ''
  const url = authUrl + '?state=ext:' + encodeURIComponent(lend) + uidPart
  console.log('[boss]: url', url)
  const to = await new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow({
      url,
      interactive: true,
    }, to => {
      const err = chrome.runtime.lastError
      if (err) reject(err)
      resolve(to)
    })
  })
  const [, token] = /#(.*)#/.exec(to)
  console.log('[boss]: got token', token)
  await browser.storage.local.set({[tokenKey]: token})
  return token
}

const fetchData = async (uri = '', method = 'GET', data = {}) => {
  const headers = new Headers()
  const token = await getToken()
  if (token) headers.append(tokenHeader, token)

  const option = {
    headers,
    method,
    mode: 'cors',
  }

  const requestBody = Object.keys(data).map(key => {
    if (typeof data[key] === 'object') data[key] = JSON.stringify(data[key])
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
      if (res.headers.has(tokenHeader)) {
        console.debug('[boss]: got new token', res.headers.get(tokenHeader))
        await browser.storage.local.set({[tokenKey]: res.headers.get(tokenHeader)})
      }
      return res
    })
    .then(async res => {
      if (res.status === 200) {
        const json = await res.json()
        return json
      } else return res.text()
    })
    .catch(async err => {
      // remove expired token
      await browser.storage.local.remove(tokenKey)
      await browser.storage.local.remove('sync_info')
      console.error(err)
      throw new Error('Internal Server Error')
    })
}

const getInfo = () => fetchData('/api/info')
const getLists = () => fetchData('/api/lists')
const setLists = lists => fetchData('/api/lists', 'PUT', {lists})
const getOpts = () => fetchData('/api/opts')
const setOpts = opts => fetchData('/api/opts', 'PUT', {opts})

const forceDownloadRemoteImmediate = async () => {
  if (!await hasToken()) return
  const {conflict} = await browser.storage.local.get('conflict')
  if (conflict) return browser.runtime.sendMessage({downloaded: {conflict}})
  const localInfo = await browser.storage.local.get(['listsUpdatedAt', 'optsUpdatedAt'])
  const {listsUpdatedAt, optsUpdatedAt} = _.defaults(localInfo, {listsUpdatedAt: 0, optsUpdatedAt: 0})
  const info = await getInfo()
  const works = []
  if (Date.parse(info.listsUpdatedAt) > listsUpdatedAt) {
    works.push(async () => {
      const remoteLists = await getLists()
      await browser.storage.local.set({lists: remoteLists, listsUpdatedAt: Date.parse(info.listsUpdatedAt)})
    })
  }
  if (Date.parse(info.optsUpdatedAt) > optsUpdatedAt) {
    works.push(async () => {
      const remoteOpts = await getOpts()
      await browser.storage.local.set({opts: remoteOpts, optsUpdatedAt: Date.parse(info.optsUpdatedAt)})
    })
  }
  await Promise.all(works.map(i => i()))
  browser.storage.sendMessage({downloaded: 'success'})
}

const forceUpdate = async ({lists, opts}) => {
  const works = []
  const conflict = (await browser.storage.local.get('conflict')).conflict || {}
  if (lists) {
    delete conflict.lists
    works.push(async () => {
      const {listsUpdatedAt} = await setLists(lists)
      await browser.storage.local.set({listsUpdatedAt: Date.parse(listsUpdatedAt)})
    })
  }
  if (opts) {
    delete conflict.opts
    works.push(async () => {
      const {optsUpdatedAt} = setOpts(opts)
      await browser.storage.local.set({optsUpdatedAt: Date.parse(optsUpdatedAt)})
    })
  }
  await browser.storage.local.set({conflict})
  try {
    await Promise.all(works.map(i => i()))
    browser.runtime.sendMessage({uploaded: {conflict}})
  } catch (error) {
    browser.runtime.sendMessage({uploaded: {error}})
  }
}

const uploadImmediate = async () => {
  const localInfo = await browser.storage.local.get(['listsUpdatedAt', 'optsUpdatedAt'])
  const {listsUpdatedAt, optsUpdatedAt} = _.defaults(localInfo, {listsUpdatedAt: 0, optsUpdatedAt: 0})
  const info = await getInfo()
  const todo = {}
  const conflict = (await browser.storage.local.get('conflict')).conflict || {}
  if (Date.parse(info.listsUpdatedAt) === listsUpdatedAt) {
    const {lists} = await browser.storage.local.get('lists')
    todo.lists = lists
    delete conflict.lists
  } else {
    const lists = await getLists()
    conflict.lists = {
      local: {time: listsUpdatedAt},
      remote: {time: Date.parse(info.listsUpdatedAt), lists}
    }
  }
  if (Date.parse(info.optsUpdatedAt) === optsUpdatedAt) {
    const {opts} = await browser.storage.local.get('opts')
    todo.opts = opts
    delete conflict.opts
  } else {
    const opts = await getOpts()
    const {opts: localOpts} = await browser.storage.local.get('opts')
    if (Object.keys(localOpts).some(key => opts[key] !== localOpts[key])) {
      const diff = _.pickBy(opts, (v, k) => (k in localOpts) && v !== localOpts[k])
      if (_.isEmpty(diff)) {
        todo.opts = localOpts
        delete conflict.opts
      } else {
        conflict.opts = {
          local: {time: optsUpdatedAt},
          remote: {time: Date.parse(info.optsUpdatedAt), opts: diff}
        }
      }
    } else {
      todo.opts = opts
      delete conflict.opts
    }
  }
  console.group('upload')
  console.log('todo', todo)
  console.log('conflict', conflict)
  console.groupEnd('upload')
  await forceUpdate(todo)
  await browser.storage.local.set({conflict})
  return conflict
}
/**
 * 同步规则：2018年08月22日22:36:51
 *  - 每次操作上传 debounce
 *    - 期望服务器上次更新时间与本地相同
 *    - 不相同的话显示同步冲突由用户选择是否上传
 *  - 定时下载
 *    - 信任远程，直接覆盖
 */
const resolveConflict = async ({type, result}) => {
  const {conflict} = await browser.storage.local.get('conflict')
  if (type === 'lists') {
    const {lists: local} = await browser.storage.local.get('lists')
    const remote = conflict.lists.remote.lists
    if (result === 'local') await forceUpdate({lists: local})
    if (result === 'remote') {
      await browser.storage.local.set({lists: remote})
      await forceUpdate({lists: remote})
    }
    if (result === 'both') {
      const both = _.concat(local, remote)
      await browser.storage.local.set({lists: both})
      await forceUpdate({lists: both})
    }
    delete conflict.lists
  }
  if (type === 'opts') {
    const {opts: local} = await browser.storage.local.get('opts')
    const remote = conflict.opts.remote.opts
    if (result === 'local') await forceUpdate({opts: local})
    if (result === 'remote') {
      for (const key in local) {
        if (key in remote) {
          local[key] = remote[key]
        }
      }
      await browser.storage.local.set({opts: local})
      await forceUpdate({opts: local})
    }
    delete conflict.opts
  }
  return browser.storage.local.set({conflict})
}

export default {
  getToken,
  getInfo,
  hasToken,
  forceUpdate,
  uploadImmediate,
  forceDownloadRemoteImmediate,
  resolveConflict,
}
