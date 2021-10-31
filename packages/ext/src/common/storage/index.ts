import { wrapBackgroundCommunicationDeeply } from '../util/ipc'
import { listStorage } from './lists'
import { tabsStorage } from './tabs'

export const lists = listStorage
export const tabs = tabsStorage

export const storage = wrapBackgroundCommunicationDeeply({
  lists,
  tabs,
})

export default storage
