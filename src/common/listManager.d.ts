
declare class ListManager {
  addList(list: object): Promise<void>
  updateListById(listId: string, list: object, time?: number): Promise<void>
  removeListById(listId: string): Promise<void>
  changeListOrderRelatively(listId: string, diff: number): Promise<void>

  init(): Promise<void>
  mapMutations(): object
  createVuexPlugin(): object
  idle(): Promise<void>
}

declare const listManager: ListManager

export default listManager
