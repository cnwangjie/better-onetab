import { debounce } from 'lodash'
import options from 'src/common/options'
import storage from 'src/common/storage'
import { composeListeners } from 'src/common/util/composeListener'
import { createIpcListener, registerIpcHandlerDeeply } from 'src/common/util/ipc'
import browser, { Tabs } from 'webextension-polyfill'
import { registerBrowserActionListener } from './browserAction'
import commandHandler from './commandHandler'
import { dynamicDisableMenu, registerContextMenusClickedHandler } from './contextMenus'
import messageHandler from './messageHandler'

const tabsChangedHandler = (activeInfo: Tabs.OnActivatedActiveInfoType) => {
  if (window.opts.disableDynamicMenu) return
  window.coverBrowserAction(activeInfo)
  dynamicDisableMenu()
}

const registerRuntimeMessageListener = async () => {
  const ipcListener = await createIpcListener()
  const listener = composeListeners(
    ipcListener,
    messageHandler,
  )
  await browser.runtime.onMessage.addListener(listener)
}

const init = async () => {
  registerIpcHandlerDeeply({ storage })
  registerIpcHandlerDeeply(options)

  const opts = window.opts = await options.getOptions()
  console.log(opts)
  await Promise.all([
    registerBrowserActionListener(opts.browserAction),
    browser.commands.onCommand.addListener(commandHandler),
    browser.runtime.onMessageExternal.addListener(commandHandler),
    registerRuntimeMessageListener(),
    browser.runtime.onUpdateAvailable.addListener(detail => { window.update = detail.version }),
    registerContextMenusClickedHandler(opts),
    browser.tabs.onActivated.addListener(debounce(tabsChangedHandler, 200)),
  ])
}

export default init
