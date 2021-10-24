import { listStorage } from './lists'
import { tabsStorage } from './tabs'

export const lists = listStorage
export const tabs = tabsStorage

export const storage = {
  lists,
  tabs,
}

export default storage
