import options from 'src/common/options'
import { createMutator, createSWR } from '.'

export const useOptions = createSWR('options', options.getOptions)

export const mutateOptions = createMutator('options')

export const setOption = async (name: string, value: any) => {
  await options.setOption(name, value)
  mutateOptions([], (options: any) => {
    return {
      ...options,
      [name]: value,
    }
  }, false)
}
