module.exports = () => {
  let devI18nArr = __i18n__
  let obj = {}
  devI18nArr.map(key => {
    obj[key] = chrome.i18n.getMessage(key)
  })
  return obj
}
