import _ from 'lodash'
import moment from 'moment'
import download from 'downloadjs'
import list from './list'
import storage from './storage'

const importFromText = (compatible, data) => new Promise((resolve, reject) => {
  const exchanger = new Worker('exchanger.js')
  exchanger.addEventListener('message', e => {
    if (!e.data || e.data.length == null) return
    exchanger.terminate()
    const lists = e.data.map(list.createNewTabList)
    resolve(lists)
  })
  exchanger.addEventListener('error', reject)
  exchanger.postMessage({compatible, data})
})

const exportToText = async compatible => {
  const lists = await storage.getLists()
  if (compatible) return lists.map(list => list.tabs.map(tab => tab.url + ' | ' + tab.title).join('\n')).join('\n\n')
  return JSON.stringify(lists.map(i => _.pick(i, ['tabs', 'title', 'time'])), null, 4)
}

const exportToFile = (text, {type, suffix}) => {
  const name = 'BetterOnetab_backup_' + moment().format('L') + suffix
  const blob = new Blob(['\ufeff' + text], {type})
  download(blob, name, type)
}

const types = {
  JSON: { type: 'application/json; charset=utf-8', suffix: '.json' },
  TEXT: { type: 'plain/text; charset=utf-8', suffix: '.txt' },
}

export default {
  importFromText,
  exportToText,
  exportToFile,
  types,
}
