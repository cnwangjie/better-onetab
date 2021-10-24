import { browser } from 'webextension-polyfill-ts'

export const __ = (key: string) => browser.i18n.getMessage(key)
