import Vue from 'vue'
import _ from 'lodash'
import __ from '@/common/i18n'
import {normalizeTab} from '@/common/tab'
import {formatTime} from '@/common/utils'
import storage from '@/common/storage'
import {validateList} from '@/common/list'
import listManager from '@/common/listManager'
import tabManager from '@/common/tabs'
import {
  UPDATE_LIST_BY_ID,
  REMOVE_LIST_BY_ID,
  CHANGE_LIST_ORDER,
} from '@/common/constants'

listManager.init()

export default {
  state: {
    lists: [],
    loaded: false,
  },
  getters: {
    indexedLists(state) {
      return state.lists.map((list, index) => Object.assign({}, list, {index}))
    },
    inPageLists(state) {
      return (page, lists) => lists.slice(
        (page - 1) * state.opts.listsPerPage,
        page * state.opts.listsPerPage,
      )
    },
    listColors(state) {
      const colors = new Set()
      state.lists.forEach(list => {
        colors.add(list.color || '')
      })
      return Array.from(colors)
    },
    taggedList(state, getters) {
      const tags = {}
      getters.indexedLists.forEach(list => {
        if (list.tags) {
          list.tags.forEach(tag => {
            tags[tag] = tags[tag] || []
            tags[tag].push(list)
          })
        }
      })
      const sorted = {}
      Object.keys(tags).sort().forEach(k => { sorted[k] = tags[k] })
      return sorted
    },
    pinnedList(state, getters) {
      return getters.indexedLists.filter(list => list.pinned)
    },
    getPageLength(state) {
      return size => Math.ceil(size / state.opts.listsPerPage)
    },
  },
  mutations: {
    ...listManager.mapMutations(),
    setLists(state, lists) {
      state.lists = lists.filter(validateList)
    },
    setTitle(state, [listIndex, title]) {
      state.lists[listIndex].title = title
    },
    openChangeTitle(state, listIndex) {
      Vue.set(state.lists[listIndex], 'titleEditing', true)
    },
    closeChangeTitle(state, listIndex) {
      Vue.set(state.lists[listIndex], 'titleEditing', false)
    },
    setPinned(state, [listIndex, pinned]) {
      Vue.set(state.lists[listIndex], 'pinned', pinned)
    },
    showAll(state, listIndex) {
      Vue.set(state.lists[listIndex], 'showAll', true)
    },
    swapListItem(state, [a, b]) {
      const tmp = state.lists[a]
      Vue.set(state.lists, a, state.lists[b])
      Vue.set(state.lists, b, tmp)
    },
    setExpand(state, [listIndex, expand]) {
      Vue.set(state.lists[listIndex], 'expand', expand)
    },
    setColor(state, [listIndex, color]) {
      Vue.set(state.lists[listIndex], 'color', color)
    },
    loaded(state) {
      state.loaded = true
    },
    tabSelected(state, [listIndex, tabIndex, selected]) {
      Vue.set(state.lists[listIndex].tabs[tabIndex], 'selected', selected)
    },
    removeTabDirectly(state, [listIndex, tabIndex]) {
      state.lists[listIndex].tabs.splice(tabIndex, 1)
    },
    addTab(state, [listIndex, tab]) {
      state.lists[listIndex].tabs.push(normalizeTab(tab))
    },
    setTags(state, [listIndex, tags]) {
      Vue.set(state.lists[listIndex], 'tags', tags)
    },
  },
  actions: {
    preloadLists({dispatch, commit, state}) {
      if (state.loaded) return
      commit('loaded')
      return dispatch('getLists')
    },
    async getLists({commit}) {
      const lists = await storage.getLists()
      if (lists) commit('setLists', lists)
    },
    itemClicked({dispatch, state}, [listIndex, tabIndex]) {
      const action = state.opts.itemClickAction
      if (action === 'open-and-remove') {
        return dispatch('removeTab', [listIndex, tabIndex])
      }
    },
    removeList({commit, state}, listIndex) {
      const list = state.lists[listIndex]
      if ((list.tabs.length !== 0) && state.opts.alertRemoveList && !confirm(`${__('ui_remove_list')}:
        [${list.tabs.length}] ${list.title || __('ui_untitled')}
        ${__('ui_created')} ${formatTime(list.time)}`)) return
      commit(REMOVE_LIST_BY_ID, [list._Id])
    },
    removeTab({commit, state}, [listIndex, tabIndex]) {
      const list = state.lists[listIndex]
      const tabs = list.tabs.slice()
      tabs.splice(tabIndex, 1)
      if (tabs.length === 0) commit(REMOVE_LIST_BY_ID, [list._id])
      else commit(UPDATE_LIST_BY_ID, [list._id, {tabs}])
    },
    restoreList({commit, state}, [listIndex, inNewWindow = false]) {
      const list = state.lists[listIndex]
      if (inNewWindow) tabManager.restoreListInNewWindow(list)
      else tabManager.restoreList(list)
      if (list.pinned) return
      commit(REMOVE_LIST_BY_ID, [list._id])
    },
    saveTitle({commit, state}, listIndex) {
      const list = state.lists[listIndex]
      if (!list.titleEditing) return
      commit('closeChangeTitle', listIndex)
      commit(UPDATE_LIST_BY_ID, [list._id, _.pick(list, 'title')])
    },
    pinList({commit, state}, [listIndex, pinned = true]) {
      const list = state.lists[listIndex]
      commit('setPinned', [listIndex, pinned])
      commit(UPDATE_LIST_BY_ID, [list._id, {pinned}])
    },
    swapListItem({commit, state}, [a, b]) {
      commit('swapListItem', [a, b])
      const list = state.lists[a]
      commit(CHANGE_LIST_ORDER, [list._id, b - a])
    },
    moveListUp({dispatch}, listIndex) {
      if (listIndex === 0) return
      dispatch('swapListItem', [listIndex, listIndex - 1])
    },
    moveListDown({dispatch, state}, listIndex) {
      if (listIndex === state.lists.length - 1) return
      dispatch('swapListItem', [listIndex, listIndex + 1])
    },
    expandList({commit, state}, [expand, listIndex]) {
      const list = state.lists[listIndex]
      if (list.expand === expand) return
      commit('setExpand', [listIndex, expand])
      commit(UPDATE_LIST_BY_ID, [list._id, {expand}])
    },
    changeColor({commit, state}, [listIndex, color]) {
      const list = state.lists[listIndex]
      commit('setColor', [listIndex, color])
      commit(UPDATE_LIST_BY_ID, [list._id, {color}])
    },
    tabMoved({commit, state}, changedLists) {
      // judge last list firstly in order to avoid list index changed
      _.uniq(changedLists).sort((a, b) => b - a).forEach(listIndex => {
        const list = state.lists[listIndex]
        if (list.tabs.length === 0) commit(REMOVE_LIST_BY_ID, [list._id])
        else commit(UPDATE_LIST_BY_ID, [list._id, _.pick(list, 'tabs')])
      })
    },
    setTags({commit, state}, [listIndex, tags]) {
      const list = state.lists[listIndex]
      commit('setTags', [listIndex, tags])
      commit(UPDATE_LIST_BY_ID, [list._id, {tags}])
    },
  },

}
