import {SYNC_SERVICE_URL} from './common/constants'
import {sendMessage} from './common/utils'

console.debug('content_script loaded')
const main = async () => {
  if (!document.URL.startsWith(SYNC_SERVICE_URL)) return
  const token = localStorage._BOSS_TOKEN
  console.debug('token', token)
  if (!token) return
  await sendMessage({login: {token}})
}

main()

