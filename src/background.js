import tabs from './common/tabs'
import storage from './common/storage'
import autoreload from './common/autoreload'
autoreload()
chrome.browserAction.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
})
chrome.contextMenus.removeAll()
chrome.contextMenus.create({
  id: 'STORE_SELECTED_TABS',
  title: 'store selected tabs',
  contexts: ['browser_action'],
})

chrome.contextMenus.onClicked.addListener(info => {
  if (info.menuItemId === 'STORE_SELECTED_TABS') tabs.storeSelectedTabs()
})