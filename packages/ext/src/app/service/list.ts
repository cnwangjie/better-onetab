import storage from 'src/common/storage'
import type { UpdateListOpt } from 'src/common/storage/lists'

export const changeList = async (listId: string, opt: UpdateListOpt) => {
  await storage.lists.updateList(listId, opt)
}
