import { wrapCommunicationDeeply } from '../util/ipc'
import { listStorage } from './lists'
import { tabsStorage } from './tabs'

export const lists = listStorage
export const tabs = tabsStorage

export const { storage } = wrapCommunicationDeeply(
  {
    storage: {
      lists,
      tabs,
    },
  },
  {
    allowCurrentExtension: true,
  },
)

window['storage'] = storage

export default storage
