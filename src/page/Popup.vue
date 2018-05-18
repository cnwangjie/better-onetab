<template>
<v-app :style="{width: '320px', height: 'auto', maxHeight: '75vh'}">
  <v-list dense>
    <template v-for="(list, index) in lists">
      <v-list-tile
        ripple
        @click="clicked(index)"
        :key="index"
      >
        <v-list-tile-content>
          <v-list-tile-title><strong>[{{ list.tabs.length }}]</strong> {{ list.title || '(untitled)' }}</v-list-tile-title>
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
import tabs from '@/common/tabs'
import storage from '@/common/storage'
import {formatTime} from '@/common/utils'

export default {
  data() {
    return {
      lists: [],
      action: '',
    }
  },
  created() {
    this.init()
  },
  methods: {
    formatTime,
    async init() {
      const lists = await storage.getLists()
      this.lists = lists
      const opts = await storage.getOptions()
      this.action = opts.popupItemClickAction
    },
    clicked(index) {
      if (this.action === 'restore') {
        tabs.restoreList(this.lists[index])
      } else if (this.action === 'restore-new-window') {
        tabs.restoreListInNewWindow(this.lists[index])
      } else return

      if (!this.lists[index].pinned) {
        this.lists.splice(index, 1)
        storage.setLists(this.lists)
      }
    },
  }
}
</script>
<style lang="scss">

</style>
