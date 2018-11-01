import _ from 'lodash'
import {normalizeList} from './list'
import options from './options'
import {genObjectId} from './utils'
import listManager from './listManager'
import browser from 'webextension-polyfill'
listManager.init()
const migrate = async () => {
  const {version} = await browser.storage.local.get('version')
  const {version: currentVersion} = browser.runtime.getManifest()
  if (version !== currentVersion) await browser.storage.local.set({version: currentVersion})
  if (version >= '1.4.0') return
  // every list need an ID
  const {lists} = await browser.storage.local.get('lists')
  const {0: listsWithoutId, 1: listsWithId} = _.groupBy(lists.map(normalizeList), list => +!!list._id)
  await browser.storage.local.set({lists: listsWithId})

  for (const list of listsWithoutId.reverse()) {
    list._id = genObjectId()
    await listManager.addList(list)
  }
  // remove depracated options
  const {opts} = await browser.storage.local.get('opts')
  if (opts) {
    await browser.storage.local.set({opts: _.pick(opts, _.keys(options.getDefaultOptions()))})
  }
}

export default migrate
