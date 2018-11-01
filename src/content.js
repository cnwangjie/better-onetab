import browser from 'webextension-polyfill'
console.debug('content_script loaded')
const main = async () => {
  const url = DEBUG ? 'http://127.0.0.1' : 'https://boss.cnwangjie.com'
  if (!document.URL.startsWith(url)) return
  const token = localStorage._BOSS_TOKEN
  console.debug('token', token)
  if (!token) return
  await browser.runtime.sendMessage({login: {token}})
}

main()

