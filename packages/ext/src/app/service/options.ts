import options from 'src/common/options'
import { createMutator, createSWR } from '.'

export const useAllOptions = createSWR('options', options.getOptions)

export const useOptions = () => {
  const { data } = useAllOptions()
  return data
}

export const mutateOptions = createMutator('options')

export const setOption = async (name: string, value: any) => {
  await options.setOption(name, value)
  mutateOptions(
    [],
    (options: any) => {
      return {
        ...options,
        [name]: value,
      }
    },
    false,
  )
}
