import _ from 'lodash'
import {normalizeList} from './list'
import logger from './logger'
import {genObjectId, compareVersion} from './utils'
import listManager from './listManager'
import browser from 'webextension-polyfill'
listManager.init()

const migrations = {
  '1.4.0': async () => {
    // every list need an ID
    const {lists} = await browser.storage.local.get('lists')
    if (lists) {
      const {0: listsWithoutId, 1: listsWithId} = _.groupBy(lists.map(normalizeList), list => +!!list._id)
      if (listsWithId) await browser.storage.local.set({lists: listsWithId})

      for (const list of listsWithoutId.reverse()) {
        list._id = genObjectId()
        await listManager.addList(list)
      }
    }
    // remove deprecated storage keys
    await browser.storage.local.remove(['conflict'])
  }
}

const migrate = async () => {
  const {version: dataVersion} = await browser.storage.local.get('version')
  const {version: currentVersion} = browser.runtime.getManifest()
  if (dataVersion === currentVersion) return
  const sorted = Object.keys(migrations).sort(compareVersion)
  for (const v of sorted) {
    if (compareVersion(currentVersion, v) > 0) continue
    try {
      console.debug('[migrate] migrating:', v)
      await migrations[v]()
      await browser.storage.local.set({version: v})
      console.debug('[migrate] migrated to:', v)
    } catch (err) {
      logger.error('[migrate] migrate failed')
      logger.error(err)
      throw err
    }
  }
}

export default migrate
