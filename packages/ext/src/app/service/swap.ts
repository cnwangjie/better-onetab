import storage from 'src/common/storage'
import type { List } from 'src/common/storage/lists'
import type { Tab } from 'src/common/storage/tabs'
import __ from 'src/common/util/i18n'

const parseCompatibleLists = (data: string) => {
  return data
    .split('\n\n')
    .filter(i => i.trim())
    .map(i =>
      i
        .split('\n')
        .filter(j => j)
        .map(j => {
          const [url, ...title] = j.split('|')
          return {
            url: url.trim(),
            title: title.join().trim(),
          }
        }),
    )
    .map(tabs => ({ tabs }))
}

const genCompatibleLists = (lists: Tab[][]) => {
  return lists
    .map(tabs => {
      return tabs.map(tab => `${tab.url} | ${tab.title}`).join('\n')
    })
    .join('\n\n')
}

export const importFromText = async (data: string, compatible = false) => {
  const lists: any[] = compatible
    ? parseCompatibleLists(data)
    : JSON.parse(data)

  const tasks = await lists.map(async ({ tabs, ...listInfos }) => {
    const list = await storage.lists.createList(listInfos)
    await storage.tabs.createTabs(tabs, list.id)
  })

  return Promise.all(tasks)
}

export const exportToText = async (lists: List[], compatible = false) => {
  // TODO:
}
