import tabs from './common/tabs'
import storage from './common/storage'
import autoreload from './common/autoreload'
import options from './common/options'
import _ from 'lodash'
if (DEBUG) autoreload()

const getBrowserActionHandler = action => {
  if (action === 'store-selected')
    return () => tabs.storeSelectedTabs()
  if (action === 'store-all')
    return () => tabs.storeAllTabs()
  if (action === 'show-list')
    return () => {
      // TODO: open only one in a window
      if (_.isInteger(window.appTabId)) {
        try {
          chrome.tabs.highlight({tabs: window.appTabId})
          return
        } catch (e) {

        }
      }
      chrome.tabs.create({url: chrome.runtime.getURL('index.html#/app/')}, createdTab => {
        window.appTabId = createdTab.id
      })
    }
  return () => {}
}

const updateBrowserAction = action => {
  if (action === 'popup') {
    chrome.browserAction.setPopup({popup: 'index.html#/popup'})
  } else {
    chrome.browserAction.setPopup({popup: ''})
    const oldHandler = window.browswerActionClickedHandler
    if (chrome.browserAction.onClicked.hasListener(oldHandler))
      chrome.browserAction.onClicked.removeListener(oldHandler)
    const newHandler = getBrowserActionHandler(action)
    chrome.browserAction.onClicked.addListener(newHandler)
    window.browswerActionClickedHandler = newHandler
  }
}

const updateContextMenus = () => {
  chrome.contextMenus.removeAll()
  chrome.contextMenus.create({
    id: 'STORE_SELECTED_TABS',
    title: 'store selected tabs',
    contexts: ['browser_action'],
  })
  const oldHandler = window.contextMenusClickedHandler
  if (!chrome.contextMenus.onClicked.hasListener(oldHandler)) {
    const newHandler = info => {
      if (info.menuItemId === 'STORE_SELECTED_TABS') tabs.storeSelectedTabs()
    }
    chrome.contextMenus.onClicked.addListener(newHandler)
    window.contextMenusClickedHandler = newHandler
  }
}

const handleOptions = opts => {
  updateBrowserAction(opts.browserAction)
  updateContextMenus()
  chrome.runtime.sendMessage({optionsChangeHandledStatus: 'success'})
}

const init = async () => {
  const opts = await storage.getOptions() || {}
  _.defaults(opts, options.getDefaultOptions())
  await storage.setOptions(opts)
  handleOptions(opts)
  chrome.storage.onChanged.addListener(async changes => {
    if (changes.opts) {
      handleOptions(await storage.getOptions())
    }
  })
}

init()