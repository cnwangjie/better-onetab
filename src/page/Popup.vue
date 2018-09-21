<template>
<v-app :style="{width: '320px'}" :dark="nightmode">
  <v-list dense>
    <template v-for="(list, index) in lists">
      <v-list-tile
        ripple
        @click="clicked(index)"
        :key="index"
        :color="list.color"
      >
        <v-list-tile-content>
          <v-list-tile-title><strong>[{{ list.tabs.length }}]</strong> {{ friendlyTitle(list) }}</v-list-tile-title>
          <v-list-tile-sub-title>{{ formatTime(list.time) }}</v-list-tile-sub-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-icon v-if="list.pinned" color="blue" :style="{fontSize: '14px'}">fas fa-thumbtack</v-icon>
        </v-list-tile-action>
      </v-list-tile>
      <v-divider v-if="index + 1 < lists.length"></v-divider>
    </template>
  </v-list>
</v-app>
</template>
<script>
import __ from '@/common/i18n'
import storage from '@/common/storage'
import {formatTime} from '@/common/utils'
import browser from 'webextension-polyfill'

export default {
  data() {
    return {
      lists: [],
      action: '',
      nightmode: false,
    }
  },
  created() {
    this.init()
  },
  methods: {
    __,
    formatTime,
    friendlyTitle(list) {
      if (list.title) return list.title
      const maxLen = 100
      const titles = list.tabs.map(i => i.title)
      let title = ''
      while (title.length < maxLen && titles.length !== 0) {
        title += titles.shift() + ', '
      }
      title = ': ' + title.slice(0, -2).substr(0, maxLen - 3) + '...'
      return title
    },
    async switchNightMode() {
      const window = await browser.runtime.getBackgroundPage()
      if ('nightmode' in window) this.nightmode = window.nightmode || false
    },
    async init() {
      this.switchNightMode()
      const lists = await storage.getLists()
      this.lists = lists
      const opts = await storage.getOptions()
      this.action = opts.popupItemClickAction
    },
    clicked(index) {
      if (['restore', 'restore-new-window'].includes(this.action)) {
        chrome.runtime.sendMessage({restoreList: {
          index,
          newWindow: this.action === 'restore-new-window',
        }})
      } else return

      if (!this.lists[index].pinned) this.lists.splice(index, 1)
    },
  }
}
</script>
<style lang="scss">

</style>
