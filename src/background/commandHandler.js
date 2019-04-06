import tabs from '../common/tabs'

const commands = {
  'store-selected-tabs': tabs.storeSelectedTabs,
  'store-all-tabs': tabs.storeAllTabs,
  'store-all-in-all-windows': tabs.storeAllTabInAllWindows,
  'restore-lastest-list': tabs.restoreLastestList,
  'open-lists': tabs.openTabLists,
}

const commandHandler = command => {
  console.log('received command', command)
  const handler = commands[command]
  if (!handler) return
  handler()
  if (PRODUCTION) ga('send', 'event', 'Command used', command)
}

export default commandHandler
