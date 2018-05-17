import cp from 'chrome-promise'

const getLists = () => cp.storage.local.get('lists')
  .then(({lists}) => lists || [])

const setLists = async lists => {
  if (!Array.isArray(lists)) throw new TypeError(lists)
  const handledLists = lists.filter(i => Array.isArray(i.tabs))
  return cp.storage.local.set({lists: handledLists})
}

const getOptions = () => cp.storage.local.get('opts')
 .then(({opts}) => opts)

const setOptions = opts => cp.storage.local.set({opts})

export default {getLists, setLists, getOptions, setOptions}