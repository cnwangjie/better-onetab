import storage from '@/common/storage'
import {validateList} from '@/common/list'
import listManager from '@/common/listManager'

listManager.init()

export default {
  state: {
    _: [],
  },
  mutations: {
    ...listManager.mapMutations(),
    setLists(state, lists) {
      state._ = lists.filter(validateList)
    },
  },
  actions: {
    async getLists({commit}) {
      const lists = await storage.getLists()
      if (lists) commit('setLists', lists)
    },
    removeList({commit}, id) {
      commit('removeListById', id)
      listManager.removeListById(id)
    },
  }
}
