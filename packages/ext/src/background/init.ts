import { debounce } from 'lodash'
import { getOptions } from 'src/common/options'
import storage from 'src/common/storage'
import { registerIpcHandlerDeeply, registerIpcListener } from 'src/common/util/ipc'
import { browser, Tabs } from 'webextension-polyfill-ts'
import { updateBrowserAction } from './browserAction'
import commandHandler from './commandHandler'
import { dynamicDisableMenu, setupContextMenus } from './contextMenus'
import messageHandler from './messageHandler'

const tabsChangedHandler = (activeInfo: Tabs.OnActivatedActiveInfoType) => {
  if (window.opts.disableDynamicMenu) return
  window.coverBrowserAction(activeInfo)
  dynamicDisableMenu()
}

const init = async () => {
  registerIpcHandlerDeeply(storage)
  registerIpcListener()

  const opts = window.opts = await getOptions()
  console.log(opts)
  await updateBrowserAction(opts.browserAction)
  await setupContextMenus(opts)
  await Promise.all([
    browser.commands.onCommand.addListener(commandHandler),
    browser.runtime.onMessageExternal.addListener(commandHandler),
    browser.runtime.onMessage.addListener(messageHandler),
    browser.runtime.onUpdateAvailable.addListener(detail => { window.update = detail.version }),
    browser.contextMenus.onClicked.addListener(info => window.contextMenusClickedHandler(info)),
    browser.tabs.onActivated.addListener(debounce(tabsChangedHandler, 200)),
  ])
}

export default init
