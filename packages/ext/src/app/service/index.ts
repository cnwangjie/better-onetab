import storage from 'src/common/storage'
import useSWR, { mutate } from 'swr'
import { $listChanges, $tabChanges } from '../store'

type ThenArg<T> = T extends PromiseLike<infer U> ? U : never

const getKey =
  (prefix: string, requireArgs = false) =>
  (...args: any[]) =>
    requireArgs && args.every(i => !i) ? null : [prefix, ...args]

export const createSWR =
  <F extends (...args: any[]) => Promise<T>, T = ThenArg<ReturnType<F>>>(
    prefix: string,
    fn: F,
    requireArgs = false,
  ) =>
  (...args: Parameters<F>) => {
    const key = getKey(prefix, requireArgs)(...args)

    return useSWR<T>(key, (_, ...args: any) => {
      return fn(...args)
    })
  }

export const createMutator =
  (prefix: string) => (args: any[], data?: any, shouldRevalidate?: boolean) =>
    mutate([prefix, ...args], data, shouldRevalidate)

export const useLists = createSWR('lists', storage.lists.listList)

export const fetchLists: typeof storage.lists.listList = async opt => {
  const result = await storage.lists.listList(opt)

  result.result.map(list => $listChanges.next(list))

  return result
}

export const mutateLists = createMutator('lists')

export const useListTabs = createSWR(
  'listTab',
  storage.tabs.getSortedTabsByList,
  true,
)

export const fetchListTabs: typeof storage.tabs.getSortedTabsByList =
  async listId => {
    const tabs = await storage.tabs.getSortedTabsByList(listId)

    tabs.map(tab => $tabChanges.next(tab))

    return tabs
  }

export const mutateListTabs = createMutator('listTab')
