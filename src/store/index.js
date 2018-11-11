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
    opts: options.getDefaultOptions(),    // all options
    hasToken: false,                      // whether token exists
    drawer: false,                        // drawer status
    nightmode: false,                     // nightmode status
    snackbar: { status: false, msg: '' }, // snackbar status
    listColors: [],                       // be used colors of lists
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
    showSnackbar(state, message) {
      state.snackbar.msg = message
      state.snackbar.status = true
    },
    setListColors(state, colors) {
      state.listColors = colors
    },
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
    async loadListColors({commit}) {
      const lists = await storage.getLists()
      const colors = new Set()
      lists.forEach(list => {
        colors.add(list.color || '')
      })
      commit('setListColors', Array.from(colors))
    },
  }
})
