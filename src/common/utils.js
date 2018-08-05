import moment from 'moment'
import __ from './i18n'
moment.locale(__('@@ui_locale'))
export const formatTime = time => {
  if (Date.now() - time < 3600E3) return moment(time).fromNow()

  const withYear = !moment(time).isSame(new Date(), 'year')
  return moment(time).format(`ddd, MMMM Do ${withYear ? 'YYYY' : ''}, hh:ss`)
}
