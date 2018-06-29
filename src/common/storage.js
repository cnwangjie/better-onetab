import browser from 'webextension-polyfill'

let lastSync = 0
let quotaExceeded = false

const sync = async () => {
  const {opts} = await browser.storage.local.get('opts')
  const syncOptions = opts.syncOptions
  const syncList = opts.syncList
  const syncItems = []
  if (syncOptions) syncItems.push('opts')
  if (syncList) syncItems.push('lists')
  if (syncItems.length === 0) return true
  const syncTime = await browser.storage.sync.get('time') || 0
  const localTime = await browser.storage.local.get('time') || 0
  if (syncTime === localTime) return true
  const bytesInUse = await browser.storage.local.getBytesInUse()
  if (bytesInUse > browser.storage.sync.QUOTA_BYTES) return false
  for (let i = 0; i < syncItems.length; i += 1) {
    const [src, dst] = syncTime > localTime ? ['sync', 'local'] : ['local', 'sync']
    const tmp = await browser.storage[src].get(syncItems[i])
    await browser.storage[dst].set(tmp)
  }
  const time = Date.now()
  await browser.storage.sync.set({time})
  await browser.storage.local.set({time})
  console.log('synchronized')
  return true
}

const get = async key => {
  if (!quotaExceeded && (Date.now() - lastSync > 5000)) {
    lastSync = Date.now()
    try {
      await sync()
    } catch (e) {
      if (e.message.indexOf('quota exceeded') !== 0) quotaExceeded = true
      console.error('sync error:', e.message)
    }
  }
  return browser.storage.local.get(key)
}

const set = async obj => {
  Object.assign(obj, {time: Date.now()})
  return browser.storage.local.set(obj)
}

const getLists = () => get('lists')
  .then(({lists}) => lists || [])

const setLists = async lists => {
  if (!Array.isArray(lists)) throw new TypeError(lists)
  const handledLists = lists.filter(i => Array.isArray(i.tabs))
  return set({lists: handledLists})
}

const getOptions = () => get('opts')
  .then(({opts}) => opts)

const setOptions = opts => set({opts})

const isQuotaExceeded = () => quotaExceeded

export default {getLists, setLists, getOptions, setOptions, isQuotaExceeded}