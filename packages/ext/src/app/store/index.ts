import _ from 'lodash/fp'
import { BehaviorSubject, map, Observable, Subject } from 'rxjs'
import { useObservable } from 'rxjs-hooks'
import type { List } from 'src/common/storage/lists'
import type { Tab } from 'src/common/storage/tabs'

export const $tabsMap = new BehaviorSubject<Record<string, Tab>>({})
export const $listsMap = new BehaviorSubject<Record<string, List>>({})

export const $tabs = $tabsMap.pipe(map(_.values))
export const $lists = $listsMap.pipe(map(_.values))

export const $tabChanges = new Subject<Tab>()
export const $listChanges = new Subject<List>()

export const $allTabs = $tabChanges.pipe(
  map(tab => _.set(tab.id, tab, $tabsMap.value)),
)
$allTabs.subscribe(v => $tabsMap.next(v))

export const $allLists = $listChanges.pipe(
  map(list => _.set(list.id, list, $listsMap.value)),
)
$allLists.subscribe(v => $listsMap.next(v))

export const getSortedTabsInList$ = (listId: string): Observable<Tab[]> =>
  $tabs.pipe(
    map(_.filter(tab => tab.listId === listId)),
    map(_.sortBy(tab => tab.order)),
  )

export const getListTabs$ = (listId: string): Observable<Tab[]> =>
  $tabs.pipe(map(_.filter(tab => tab.listId === listId)))

export const useListTabs = (listId: string) =>
  useObservable(() => getListTabs$(listId), [])
