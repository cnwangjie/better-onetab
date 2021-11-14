import browser from 'webextension-polyfill'

export const genId = () => {
  const timestamp = ((new Date().getTime() / 1000) | 0).toString(16)
  return (
    timestamp +
    'xxxxxxxxxxxxxxxx'
      .replace(/[x]/g, function () {
        return ((Math.random() * 16) | 0).toString(16)
      })
      .toLowerCase()
  )
}

export const isBackground = async () => {
  if (!browser.runtime.getBackgroundPage) return false
  const bg = await browser.runtime.getBackgroundPage()
  return bg === window
}

export const attemptParseJSON = (value: any) => {
  try {
    return JSON.parse(value)
  } catch (e) {
    return
  }
}

export const getDomain = (url: string) => {
  try {
    return new URL(url).hostname
  } catch (e) {
    return ''
  }
}

export const getDefaultFavIcon = (url: string) => {
  return `https://www.google.com/s2/favicons?domain=${getDomain(url)}`
}
