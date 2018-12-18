import _ from 'lodash'
import Vue from 'vue'
import Vuex from 'vuex'
import browser from 'webextension-polyfill'
import storage from '@/common/storage'
import options from '@/common/options'
import boss from '@/common/service/boss'
import listManager from '@/common/listManager'
import {sleep} from '@/common/utils'

import lists from './lists'

Vue.use(Vuex)
listManager.init()

export default new Vuex.Store({
  strict: DEBUG,
  state: {
    opts: options.getDefaultOptions(),    // all options
    hasToken: false,                      // whether token exists
    drawer: false,                        // drawer status
    nightmode: false,                     // nightmode status
    snackbar: { status: false, msg: '' }, // snackbar status
    scrollY: 0,
    ...lists.state,
  },
  getters: {
    ...lists.getters,
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
    setDrawer(state, drawer) {
      state.drawer = drawer
    },
    setNightmode(state, payload) {
      state.nightmode = payload
    },
    setSnackbar(state, message) {
      state.snackbar.msg = message
      state.snackbar.status = true
    },
    closeSnackbar(state) {
      state.snackbar.status = false
    },
    setScrollY(state, v) {
      state.scrollY = v
    },
    ...lists.mutations,
  },
  actions: {
    async loadOptions({commit}) {
      commit('setOption', await storage.getOptions())
    },
    async checkToken({commit}) {
      commit('setToken', await boss.hasToken())
    },
    async loadDrawer({commit}) {
      const window = await browser.runtime.getBackgroundPage()
      window.drawer = _.defaultTo(window.drawer, true)
      commit('setDrawer', window.drawer)
    },
    async switchDrawer({commit, state}) {
      const window = await browser.runtime.getBackgroundPage()
      commit('setDrawer', window.drawer = !state.drawer)
    },
    async loadNightmode({commit, state}) {
      const window = await browser.runtime.getBackgroundPage()
      window.nightmode = _.defaultTo(window.nightmode, state.opts.defaultNightMode)
      commit('setNightmode', window.nightmode)
    },
    async switchNightmode({commit, state}) {
      const window = await browser.runtime.getBackgroundPage()
      commit('setNightmode', window.nightmode = !state.nightmode)
    },
    async showSnackbar({commit}, message) {
      commit('setSnackbar', message)
      await sleep(2000)
      commit('closeSnackbar')
    },
    ...lists.actions,
  },
  plugins: [
    listManager.createVuexPlugin(),
  ],
})
