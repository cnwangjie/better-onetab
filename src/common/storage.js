import _ from 'lodash'
import {normalizeList} from '@/common/list'
import browser from 'webextension-polyfill'
import options from './options'

const get = key => browser.storage.local.get(key)

const set = obj => browser.storage.local.set(obj)

const getLists = () => get('lists')
  .then(({lists}) => lists || [])

const setLists = async lists => {
  if (!Array.isArray(lists)) throw new TypeError(lists)
  const handledLists = lists.filter(i => Array.isArray(i.tabs)).map(normalizeList)
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

const setOptions = opts => set({
  opts: _.pick(opts, _.keys(options.getDefaultOptions())),
  optsUpdatedAt: Date.now(),
})

export default {
  getLists,
  setLists,
  getOptions,
  setOptions,
}
