import _ from 'lodash'
import browser from 'webextension-polyfill'

const apiUrl = 'https://boss.cnwangjie.com'
const tokenKey = 'boss_token'
const tokenHeader = 'auth'

const hasToken = async () => {
  return tokenKey in await browser.storage.local.get(tokenKey)
}

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
      if (res.headers.get(tokenHeader)) {
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

const getInfo = () => fetchData('/api/info')
const getLists = () => fetchData('/api/lists')
const setLists = lists => fetchData('/api/lists', 'PUT', {lists})
const getOpts = () => fetchData('/api/opts')
const setOpts = opts => fetchData('/api/opts', 'PUT', {opts})

// const getLocalTimes = async () => {
//   const result = _.get(await browser.storage.local.get('times'), 'times', {})
//   return _.defaults(result, {opts: 0, lists: 0})
// }

const getRemoteInfo = () => {
  return getInfo().catch(err => {
    console.error('[boss]: first time to get info error:', err)
    return getInfo()
  })
}

// const LOCAL_TO_REMOTE = ['local', 'remote']
// const REMOTE_TO_LOCAL = ['remote', 'local']
// const items = ['opts', 'lists']

// const checkWorks = (localTimes, remoteTimes) => {
//   const works = {}
//   items.forEach(item => {
//     if (localTimes[item] === remoteTimes[item]) return
//     const work = localTimes[item] > remoteTimes[item] ? LOCAL_TO_REMOTE : REMOTE_TO_LOCAL
//     works[item] = work
//   })
//   return works
// }

// const handleWork = works => {
//   const todo = []
//   if ('lists' in works) {
//     if (works.lists === REMOTE_TO_LOCAL) {
//       todo.push(async () => {
//         const lists = await getLists()
//         await browser.storage.local.set({lists})
//       })
//     } else {
//       todo.push(async () => {
//         const {lists} = await browser.storage.local.get('lists')
//         await setLists(JSON.stringify(lists))
//       })
//     }
//   }
//   if ('opts' in works) {
//     if (works.opts === REMOTE_TO_LOCAL) {
//       todo.push(async () => {
//         const opts = await getOpts()
//         await browser.storage.local.set({opts})
//       })
//     } else {
//       todo.push(async () => {
//         const {opts} = await browser.storage.local.get('opts')
//         await setOpts(JSON.stringify(opts))
//       })
//     }
//   }
//   return todo
// }

// const execWork = todo => {
//   return Promise.all(todo.map(i => i()))
// }

// export const syncWithBoss = async () => {
//   console.log('[boss]: ready to sync with boss')
//   const {times: remoteTimes} = await getRemoteInfo()
//   const localTimes = await getLocalTimes()
//   const works = checkWorks(localTimes, remoteTimes)
//   console.log('[boss]: remote', remoteTimes, 'local', localTimes, 'works',
//     _.entries(works, ([key, value]) => {
//       return `{${key}: ${value[0]} -> ${value[1]}`
//     }).join('')
//   )
//   if (!_.isEmpty(works)) {
//     chrome.runtime.sendMessage({syncStart: true})
//     await execWork(handleWork(works))
//   }
//   const currentInfo = await getRemoteInfo()
//   chrome.runtime.sendMessage({syncEnd: currentInfo})
//   browser.storage.local.set({times: currentInfo.times})
//   console.log('[boss]: synchronized')
//   return currentInfo
// }
/**
 * 列表同步规则 deprecated
 * 1. 列表为空时同步 <- 如果本地无修改记录则直接应用
 * 2. 删除时同步 | 存储修改前状态以及操作队列；先下载并与之前的比较 如果一致则上传 否则下载并合并后上传
 * 3. 增加时同步 |
 * 4. 修改时同步 |
 * 5. 定时同步： 如果修改时间大于本地则应用，如果小于本地则上传
 *
 * 选项同步规则
 * 1. 如果本地无修改记录则直接下载并应用
 * 2. 修改时同步
 * 3. 定时同步： 如果修改时间大于本地则应用，如果小于本地则上传
 */

const forceDownloadRemoteImmediate = async () => {
  const localInfo = await browser.storage.local.get(['listsUpdatedAt', 'optsUpdatedAt'])
  const {listsUpdatedAt, optsUpdatedAt} = _.defaults(localInfo, {listsUpdatedAt: 0, optsUpdatedAt: 0})
  const info = await getRemoteInfo()
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
  return Promise.all(works.map(i => i()))
}

const forceUpdate = async ({lists, opts}) => {
  const works = []
  if (lists) works.push(async () => {
    const {listsUpdatedAt} = await setLists(lists)
    await browser.storage.local.set({listsUpdatedAt: Date.parse(listsUpdatedAt)})
  })
  if (opts) works.push(async () => {
    const {optsUpdatedAt} = setOpts(opts)
    await browser.storage.local.set({optsUpdatedAt: Date.parse(optsUpdatedAt)})
  })
  return Promise.all(works.map(i => i()))
}

const uploadImmediate = async () => {
  const localInfo = await browser.storage.local.get(['listsUpdatedAt', 'optsUpdatedAt'])
  const {listsUpdatedAt, optsUpdatedAt} = _.defaults(localInfo, {listsUpdatedAt: 0, optsUpdatedAt: 0})
  const info = await getRemoteInfo()
  const todo = {}
  const conflict = {}
  if (Date.parse(info.listsUpdatedAt) === listsUpdatedAt) {
    const {lists} = await browser.storage.local.get('lists')
    todo.lists = lists
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
  } else {
    const opts = await getOpts()
    conflict.opts = {
      local: {time: optsUpdatedAt},
      remote: {time: Date.parse(info.optsUpdatedAt), opts}
    }
  }
  console.log(todo)
  await forceUpdate(todo)
  await browser.storage.local.set({conflict})
  browser.runtime.sendMessage({uploaded: {
    conflict,
  }})
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

export default {
  getInfo,
  hasToken,
  forceUpdate,
  uploadImmediate,
  forceDownloadRemoteImmediate,
}
