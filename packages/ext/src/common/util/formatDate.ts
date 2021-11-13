import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)

export const formatTime = (time: number) => {
  const date = dayjs(time)
  if (date.add(1, 'day').isBefore(dayjs())) {
    return date.format('llll')
  }
  return date.fromNow()
}
