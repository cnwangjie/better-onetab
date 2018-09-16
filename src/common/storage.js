import _ from 'lodash'
import browser from 'webextension-polyfill'
import boss from '@/common/service/boss'

const uploadDebounce = _.debounce(async () => {
  if (await boss.hasToken()) browser.runtime.sendMessage({uploadImmediate: true})
}, 5000)

const get = key => browser.storage.local.get(key)

const set = obj => {
  uploadDebounce()
  return browser.storage.local.set(obj)
}

const getLists = () => get('lists')
  .then(({lists}) => lists || [])

const setLists = lists => {
  if (!Array.isArray(lists)) throw new TypeError(lists)
  const handledLists = lists.filter(i => Array.isArray(i.tabs))
  return set({lists: handledLists})
}

const getOptions = () => get('opts')
  .then(({opts}) => opts)

const setOptions = opts => set({opts})

export default {
  getLists,
  setLists,
  getOptions,
  setOptions,
}
