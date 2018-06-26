module.exports = () => {
  let devI18nObj = JSON.parse(__i18n__)
  if (window.chrome && window.chrome.i18n) {
    let obj = {}
    Object.keys(devI18nObj).map(key => {
      obj[key] = window.chrome.i18n.getMessage(key)
    })
    return obj
  } else {
    let obj = {}
    Object.keys(devI18nObj).map(key => {
      obj[key] = devI18nObj[key].message
    })
    return obj
  }
}
