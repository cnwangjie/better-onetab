import __ from './i18n'
import moment from 'moment'
import browser from 'webextension-polyfill'

moment.locale(__('@@ui_locale'))
export const formatTime = time => {
  if (Date.now() - time < 3600E3) return moment(time).fromNow()

  const withYear = !moment(time).isSame(new Date(), 'year')
  return moment(time).format(`ddd, MMMM Do ${withYear ? 'YYYY' : ''}, kk:mm:ss`)
}
export const one = fn => {
  let executing = false
  return async function onceAtSameTimeFunction(...args) {
    if (executing) return
    executing = true
    let re
    try {
      re = await fn.apply(this, args) // eslint-disable-line
    } catch (error) {
      throw error
    } finally {
      executing = false
    }
    return re
  }
}
export const checkPermission = async permission => {
  if (await browser.permissions.contains({permissions: [permission]})) return true
  return browser.permissions.request({permissions: [permission]})
}
export const readFile = file => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onloadend = event => resolve(event.target.result)
  reader.onerror = reject
  reader.readAsText(file)
})
export const genObjectId = () => {
  const timestamp = (new Date().getTime() / 1000 | 0).toString(16)
  return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => (Math.random() * 16 | 0).toString(16)).toLowerCase()
}
