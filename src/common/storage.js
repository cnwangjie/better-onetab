import _ from 'lodash'
import browser from 'webextension-polyfill'

// let lastSync = 0
let quotaExceeded = false

const uploadDebounce = _.debounce(() => {
  browser.runtime.sendMessage({uploadImmediate: true})
}, 2000)

const get = async key => {
  // TODO: better sync alogrithmn
  return browser.storage.local.get(key)
}

const set = async obj => {
  uploadDebounce()
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

export default {
  getLists,
  setLists,
  getOptions,
  setOptions,
  isQuotaExceeded,
}
