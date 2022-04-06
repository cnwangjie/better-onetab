import browser from 'webextension-polyfill'
import { memoize } from 'lodash'

export const __ = memoize((key: string, substitutions?: any) => {
  const result = browser.i18n.getMessage(key, substitutions)
  if (result) return result
  console.warn('Missing translation:', key)
  return key
})

export default __
