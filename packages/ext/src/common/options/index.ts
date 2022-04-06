import { fromPairs, keyBy, zip } from 'lodash'
import { optionsList, Type } from './list'
import { attemptParseJSON } from 'src/common/util'
import { OptionKey, Options } from './types'
import { wrapCommunicationDeeply } from '../util/ipc'

const OptionsMap = keyBy(optionsList, 'name')
const OptionsKeys = Object.keys(OptionsMap) as OptionKey[]
const getOptionStoreKey = (name: string) => `opt_${name}`

const getOption = async (name: OptionKey): Promise<any> => {
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

const getOptions = async () => {
  const optionsValues = await Promise.all(OptionsKeys.map(getOption))
  const optionsPairs = zip(OptionsKeys, optionsValues)

  return fromPairs(optionsPairs) as Options
}

const setOption = async (name: string, value: any) => {
  const storeKey = getOptionStoreKey(name)
  const config = OptionsMap[name]
  if (!config) return
  const { type } = config
  const rawValue = type === Type.boolean ? JSON.stringify(value) : value
  localStorage.setItem(storeKey, rawValue)
}

const options = {
  getOption,
  getOptions,
  setOption,
}

const allowCurrentExtension = true

export default wrapCommunicationDeeply(options, { allowCurrentExtension })
