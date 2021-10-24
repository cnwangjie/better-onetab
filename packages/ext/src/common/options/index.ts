import _, { fromPairs, keyBy } from 'lodash'
import { optionsList, Type } from './list'
import { attemptParseJSON } from 'src/common/util'
import { OptionKey, Options } from './types'

const OptionsMap = keyBy(optionsList, 'name')
const OptionsKeys = Object.keys(OptionsMap) as OptionKey[]
const getOptionStoreKey = (name: string) => `opt_${name}`

export const getOption = (name: OptionKey): any => {
  const storeKey = getOptionStoreKey(name)
  const rawValue = localStorage.getItem(storeKey)
  const config = OptionsMap[name]
  if (!config) return
  const { type, default: defaultValue } = config
  const value =
    (type === Type.boolean ? attemptParseJSON(rawValue) : rawValue) ??
    defaultValue

  return value
}

export const getOptions = () => {
  const optionsPairs = OptionsKeys.map(
    (name) => {
      const value = getOption(name)
      return [name, value]
    },
  )

  return fromPairs(optionsPairs) as Options
}

export const setOption = (name: string, value: any) => {
  const storeKey = getOptionStoreKey(name)
  const config = OptionsMap[name]
  if (!config) return
  const { type } = config
  const rawValue = type === Type.boolean ? JSON.stringify(value) : value
  localStorage.setItem(storeKey, rawValue)
}
