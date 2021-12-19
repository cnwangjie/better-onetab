import browser from 'webextension-polyfill'
import { memoize } from 'lodash'

export const __ = memoize((key: string) => {
  const result = browser.i18n.getMessage(key)
  if (result) return result
  console.warn('Missing translation:', key)
  return key
})

export default __
