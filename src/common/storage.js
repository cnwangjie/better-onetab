import _ from 'lodash'
import list from '@/common/list'
import browser from 'webextension-polyfill'

const get = key => browser.storage.local.get(key)

const set = obj => {
  return browser.storage.local.set(obj)
}

const getLists = () => get('lists')
  .then(({lists}) => lists || [])

const setLists = async lists => {
  if (!Array.isArray(lists)) throw new TypeError(lists)
  const handledLists = lists.filter(i => Array.isArray(i.tabs)).map(list.normalize)
  const {opts} = await get('opts')
  if (opts && opts.removeDuplicate) {
    handledLists.forEach(list => {
      list.tabs = _.unionBy(list.tabs, tab => tab.url)
    })
  }
  return set({lists: handledLists})
}

const getOptions = () => get('opts')
  .then(({opts}) => opts)

const setOptions = opts => set({opts, optsUpdatedAt: Date.now()})

export default {
  getLists,
  setLists,
  getOptions,
  setOptions,
}
