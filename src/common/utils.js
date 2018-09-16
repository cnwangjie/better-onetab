import moment from 'moment'
import __ from './i18n'
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
