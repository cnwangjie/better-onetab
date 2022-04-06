import type Browser, { Menus } from 'webextension-polyfill'
import type { Options } from './common/options/types'
import type { tabsManager } from './common/tabsManager'
import type storage from './common/storage'

export {}

declare global {
  const DEBUG: boolean
  const PRODUCTION: boolean

  interface Window {
    // background page store
    currentBrowserAction: string
    coverBrowserAction: (
      activeInfo: Browser.Tabs.OnActivatedActiveInfoType,
    ) => any
    browserActionClickedHandler?: () => any
    contextMenusClickedHandler?: (info: Menus.OnClickData) => any
    opts: Options
    update?: string
    tabsManager?: typeof tabsManager
    storage?: typeof storage
    browser?: typeof Browser
    appTabIds?: Record<number, number>
    getDB?: () => Promise<any>
    db?: any

    // app page store
    store: any
  }
}
