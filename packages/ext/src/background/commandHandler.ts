import { Commands } from "src/common/constants"
import { tabsManager } from "src/common/tabsManager"

const commands = {
  [Commands.StoreSelectedTabs]: tabsManager.storeSelectedTabs,
  [Commands.StoreAllTabs]: tabsManager.storeAllTabs,
  [Commands.StoreAllInAllWindows]: tabsManager.storeAllTabsInAllWindows,
  [Commands.RestoreLatestList]: tabsManager.restoreLatestList,
  [Commands.OpenList]: tabsManager.openTabList,
}

const commandHandler = (command: string) => {
  console.log('received command', command)
  const handler = commands[command]
  if (!handler) return
  handler()

  // TODO: report
}

export default commandHandler
