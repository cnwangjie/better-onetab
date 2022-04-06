import { sortBy } from 'lodash'
import { RxDocument } from 'rxdb'
import type { Tabs } from 'webextension-polyfill'
import { genId } from '../util'
import { getDB } from './db'

export interface Tab {
  id: string
  url: string
  title: string
  favIconUrl: string
  pinned: boolean
  listId: string
  order: number
}

export type TabDoc = RxDocument<Tab>

const initTabs = (tabs: Tabs.Tab[], listId: string): Tab[] => {
  return tabs
    .filter(tab => tab.url)
    .map((tab, index) => {
      return {
        id: genId(),
        url: tab.url!,
        title: tab.title || '',
        favIconUrl: tab.favIconUrl || '',
        pinned: tab.pinned || false,
        listId,
        order: index * 1e6,
      }
    })
}

const createTabs = async (tabs: Tabs.Tab[], listId: string) => {
  const db = await getDB()
  const tabsDocs = initTabs(tabs, listId)
  const result = await db.tabs.bulkInsert(tabsDocs)
  if (result.error.length) {
    console.error(result.error)
  }
}

const getTabsByList = async (listId: string): Promise<Tab[]> => {
  console.time(`get db ${listId}`)
  const db = await getDB()
  console.timeEnd(`get db ${listId}`)
  console.time(`get tabs ${listId}`)
  const tabs = await db.tabs.find({ selector: { listId } }).exec()
  console.timeEnd(`get tabs ${listId}`)
  return tabs
}

const removeTabsByList = async (listId: string) => {
  const db = await getDB()
  const tabs = await getTabsByList(listId)
  await db.tabs.bulkRemove(tabs.map(tab => tab.id))
}

const getSortedTabsByList = async (listId: string) => {
  console.time(`getTabsByList: ${listId}`)
  const tabs = await getTabsByList(listId)
  console.timeEnd(`getTabsByList: ${listId}`)
  console.time(`sort ${listId}`)
  const sortedTabs = sortBy(tabs, 'order')
  console.timeEnd(`sort ${listId}`)
  return sortedTabs
}

type TabMutableFields = 'order' | 'listId'

const updateTab = async (
  id: string,
  opt: Partial<Pick<Tab, TabMutableFields>>,
) => {
  const db = await getDB()
  const tab: TabDoc = await db.tabs.findOne({ selector: { id } }).exec()

  if (!tab) return

  return tab.atomicUpdate(doc => {
    return { ...doc, ...opt }
  })
}

const getTabById = async (id: string) => {
  const db = await getDB()
  const tab = await db.tabs.findOne({ selector: { id } }).exec()
  return tab
}

const _importRxDBTabs = async (data: any) => {
  const db = await getDB()
  await db.tabs.importJSON(data)
}

const _exportRxDBTabs = async () => {
  const db = await getDB()
  return db.tabs.exportJSON()
}

export const tabsStorage = {
  createTabs,
  getTabsByList,
  getSortedTabsByList,
  removeTabsByList,
  updateTab,
  getTabById,
  _importRxDBTabs,
  _exportRxDBTabs,
}
