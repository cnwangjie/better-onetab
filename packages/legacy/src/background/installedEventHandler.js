import __ from '../common/i18n'
import browser from 'webextension-polyfill'

const installedEventHandler = detail => {
  if (DEBUG) return
  if (detail.reason === chrome.runtime.OnInstalledReason.UPDATE) {
    const updatedNotificationId = 'updated'
    browser.notifications.onClicked.addListener(id => {
      if (id === updatedNotificationId) {
        browser.tabs.create({ url: 'https://github.com/cnwangjie/better-onetab/blob/master/CHANGELOG.md' })
      }
    })
    browser.notifications.create(updatedNotificationId, {
      type: 'basic',
      iconUrl: 'assets/icons/icon_128.png',
      title: __('ui_updated_to_ver') + ' v' + browser.runtime.getManifest().version,
      message: __('ui_click_view_changelog'),
    })
    setTimeout(() => {
      browser.notifications.clear(updatedNotificationId)
    }, 5000)
  }
}

export default installedEventHandler
