import _ from 'lodash'
import __ from './i18n'
import moment from 'moment'
import {COLORS} from './constants'
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
  // refer: https://gist.github.com/solenoid/1372386
  const timestamp = (new Date().getTime() / 1000 | 0).toString(16)
  return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => (Math.random() * 16 | 0).toString(16)).toLowerCase()
}
export const isBackground = async () => {
  if (window._isBackground == null) window._isBackground = window === await browser.runtime.getBackgroundPage()
  return window._isBackground
}
export const formatSize = bytes => {
  // refer: https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string
  const sufixes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return !bytes && '0 Bytes' || (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sufixes[i]
}
export const sleep = ms => new Promise(r => setTimeout(r, ms))

export const getColorByHash = _.memoize(str => {
  const hash = typeof str === 'string' ? str.split('').reduce((r, i) => i.charCodeAt(0) + r, 0) : 0
  return COLORS[hash % COLORS.length]
})

export const timeout = (promise, ms) => Promise.race([
  promise, new Promise((resolve, reject) => setTimeout(() => {
    reject(new Error('promise timeout'))
  }, ms))
])
