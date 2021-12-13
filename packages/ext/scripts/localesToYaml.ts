import yaml from 'js-yaml'
import path from 'path'
import fs from 'fs/promises'
import _ from 'lodash'

const main = async () => {
  const input = path.join(__dirname, '../src/_locales')
  const locales = await fs.readdir(input)
  const localesOrder = ['en', 'zh_CN']
  const sortedLocales = _.sortBy(locales, (locale) => {
    const i = localesOrder.findIndex((l) => l === locale)
    if (i === -1) return Infinity
    return i
  })
  const localesPairs = sortedLocales.map(locale => {
    return [locale, require(path.join(input, locale, 'messages.json'))]
  })
  const localesData = _.fromPairs(localesPairs)
  const result: any = {}
  _.mapValues(localesData, (data, locale) => {
    _.mapValues(data, (value, key) => {
      if (value.description) {
        _.set(result, [key, 'description'], value.description)
      }
      _.set(result, [key, locale], value.message)
    })
  })
  await fs.writeFile(path.join(__dirname, '../src/i18n-messages.yaml'), yaml.dump(result))
}

main()
