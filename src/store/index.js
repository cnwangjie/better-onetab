import _ from 'lodash'
import Vue from 'vue'
import Vuex from 'vuex'
import browser from 'webextension-polyfill'
import storage from '@/common/storage'
import options from '@/common/options'
import boss from '@/common/service/boss'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    opts: options.getDefaultOptions(),
    hasToken: false,
    conflict: null,
  },
  mutations: {
    setOption(state, payload) {
      for (const [k, v] of Object.entries(payload)) {
        state.opts[k] = v
      }
    },
    setToken(state, payload) {
      state.hasToken = payload
    },
    setConflict(state, payload) {
      state.conflict = _.isEmpty(payload) ? null : payload
    },
  },
  actions: {
    async loadOptions({commit}) {
      commit('setOption', await storage.getOptions())
    },
    async checkToken({commit}) {
      commit('setToken', await boss.hasToken())
    },
    async loadConflict({commit}) {
      const {conflict} = await browser.storage.local.get('conflict')
      commit('setConflict', conflict)
    }
  }
})
