import browser from 'webextension-polyfill'

export const __ = (key: string) => browser.i18n.getMessage(key)

export default __
