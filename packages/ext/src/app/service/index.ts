import storage from 'src/common/storage'
import useSWR from 'swr'

type ThenArg<T> = T extends PromiseLike<infer U> ? U : never

const createSWR = <
  F extends (...args: any[]) => Promise<T>,
  T = ThenArg<ReturnType<F>>
>(
  prefix: string,
  fn: F,
  requireArgs = false,
) => (...args: any[]) => {
  const key = requireArgs && args.every(i => !i) ? null : [prefix, ...args]

  return useSWR<T>(key, (_, ...args: any) => {
    return fn(...args)
  })
}

export const useLists = createSWR('lists', storage.lists.listList)

export const useListTabs = createSWR('listTab', storage.tabs.getSortedTabsByList, true)
