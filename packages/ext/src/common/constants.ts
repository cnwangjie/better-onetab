export const Colors = [
  '', 'red', 'pink', 'purple',
  'indigo', 'blue', 'cyan', 'teal',
  'green', 'yellow', 'orange', 'brown',
] as const

/**
 * Some prefixes of url that are browser internal pages or meaningless to store
 */
export const IllegalUrlPrefixes = [
  'about:',
  'chrome:',
  'file:',
  'ws:',
  'wss:',
]

export const BrowserAction = {
  Popup: 'popup',
  StoreSelected: 'store-selected',
  StoreAll: 'store-all',
  ShowList: 'show-list',
  None: 'none',
}

export const Commands = {
  StoreSelectedTabs: 'store-selected-tabs',
  StoreAllTabs: 'store-all-tabs',
  StoreAllInAllWindows: 'store-all-in-all-windows',
  RestoreLatestList: 'restore-latest-list',
  OpenList: 'open-list',
}

export const NewTabs = ['about:home', 'about:newtab', 'chrome://newtab/']

export const StoreToTitledList = 'STORE_TO_TITLED_LIST'
