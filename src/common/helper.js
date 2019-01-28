import browser from 'webextension-polyfill'

export const clearStorage = () => browser.storage.local.get()
  .then(Object.keys).then(browser.storage.local.remove)
