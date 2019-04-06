import tabs from '../common/tabs'
import storage from '../common/storage'
import boss from '../common/service/boss'
import {sendMessage} from '../common/utils'
import listManager from '../common/listManager'
import {setupContextMenus} from './contextMenus'
import {updateBrowserAction} from './browserAction'

const messageHandler = async msg => {
  console.debug('received', msg)
  if (msg.optionsChanged) {
    const changes = msg.optionsChanged
    console.debug('options changed', changes)
    Object.assign(window.opts, changes)
    if (changes.browserAction) updateBrowserAction(changes.browserAction)
    if (['pageContext', 'allContext', 'disableDynamicMenu'].some(k => k in changes)) await setupContextMenus(changes)
    await sendMessage({optionsChangeHandledStatus: 'success'})
    if (PRODUCTION) Object.keys(changes).map(key => ga('send', 'event', 'Options changed', key, changes[key]))
  }
  if (msg.restoreList) {
    const {restoreList} = msg
    const listIndex = restoreList.index
    const lists = await storage.getLists()
    const list = lists[listIndex]
    if (restoreList.newWindow) {
      tabs.restoreListInNewWindow(list)
    } else {
      tabs.restoreList(list)
    }
    if (!list.pinned) {
      listManager.removeListById(list._id)
    }
    if (PRODUCTION) ga('send', 'event', 'Popup item clicked')
  }
  if (msg.storeInto) {
    tabs.storeSelectedTabs(msg.storeInto.index)
  }
  if (msg.login) {
    boss.login(msg.login.token)
  }
  if (msg.refresh) {
    boss.refresh()
  }
  if (msg.import) {
    const {lists} = msg.import
    lists.forEach(list => listManager.addList(list))
  }
}

export default messageHandler
