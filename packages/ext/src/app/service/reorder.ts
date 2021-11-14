import storage from "src/common/storage"
import { mutateListTabs } from "."

interface Orderable {
  order: number
}

/**
 * Calculate target order for item to specified index in a list.
 *
 * @param items item list with order field
 * @param index target index
 */
 const calculateOrderForIndex = (items: Orderable[], index: number) => {
  const [before, after] = [items[index - 1], items[index]]

  const order = !before
    ? items.length
      ? items[0].order - 1000
      : Date.now()
    : !after
    ? Date.now()
    : (before.order + after.order) / 2

  return order
}

export const reorderTab = async (
  tabId: string,
  fromListId: string,
  toListId: string,
  targetIndex: number,
) => {
  if (fromListId === toListId) {
    const tabs = await storage.tabs.getSortedTabsByList(fromListId)
    const filteredTabs = tabs.filter(tab => tab.id !== tabId)
    const order = calculateOrderForIndex(filteredTabs, targetIndex)
    return storage.tabs.updateTab(tabId, { order })
  }

  const tabs = await storage.tabs.getSortedTabsByList(toListId)
  const order = calculateOrderForIndex(tabs, targetIndex)
  return storage.tabs.updateTab(tabId, { listId: toListId, order })
}

export const reorderTabLocally = async (tabId: string, fromListId: string, toListId: string, targetIndex: number) => {
  if (fromListId === toListId) {
    mutateListTabs([fromListId], (tabs: any[]) => {
      const tabIndex = tabs.findIndex(tab => tab.id === tabId)
      const tab = tabs[tabIndex]
      const newTabs = [...tabs.slice(0, tabIndex), ...tabs.slice(tabIndex + 1)]
      newTabs.splice(targetIndex, 0, tab)
      return newTabs
    }, false)
    return
  }

  mutateListTabs([fromListId], (tabs: any[]) => {
    const tabIndex = tabs.findIndex(tab => tab.id === tabId)
    const tab = tabs[tabIndex]
    const newTabs = [...tabs.slice(0, tabIndex), ...tabs.slice(tabIndex + 1)]
    mutateListTabs([toListId], (tabs: any[]) => {
      return [...tabs.slice(0, targetIndex), tab, ...tabs.slice(targetIndex)]
    }, false)
    return newTabs
  }, false)
}
