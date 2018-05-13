<template>
<v-expansion-panel expand popout>
  <v-expansion-panel-content v-for="(list, listIndex) in lists" :value="true">
    <v-layout slot="header" row spacer>
      <v-flex no-wrap xs3>
        <v-chip
          label
          small
        >{{ list.tabs.length }} tabs</v-chip>
        <strong class="grey--text date">Created {{ formatTime(list.time) }}</strong>
      </v-flex>
      <v-flex no-wrap xs9>
        <v-text-field
          class="title-editor"
          autofocus
          v-if="list.titleEditing"
          @blur="saveTitle(listIndex)"
          v-model="list.title"
        ></v-text-field>
        <strong class="list-title" v-else>{{ list.title }}</strong>
      </v-flex>
    </v-layout>
    <v-card>
      <v-btn flat small v-on:click="openChangeTitle(listIndex)">retitle list</v-btn>
      <v-btn flat small v-on:click="restoreList(listIndex)">restore all</v-btn>
      <v-btn flat small v-on:click="restoreList(listIndex, true)">restore all in new window</v-btn>
      <v-btn flat small color="error" v-on:click="removeList(listIndex)">remove list</v-btn>
      <v-divider></v-divider>
      <v-list dense class="my-1">
        <draggable
          v-model="list.tabs"
          :options="{group: {name: 'g', put: true, pull: true}}"
          @change="tabMoved"
        >
          <v-list-tile v-for="(tab, tabIndex) in list.tabs" @click="" class="list-item" :key="tabIndex">
            <v-list-tile-action>
              <v-icon class="clear-btn" color="red" @click="removeTab(listIndex, tabIndex)">clear</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>
                <v-avatar
                  tile
                  size="16"
                  color="grey lighten-4"
                >
                  <img :src="tab.favIconUrl">
                </v-avatar>
                {{ tab.title }}
              </v-list-tile-title>
              <v-list-tile-sub-title>
                {{ tab.url }}
              </v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </draggable>
      </v-list>
    </v-card>
  </v-expansion-panel-content>
</v-expansion-panel>
</template>
<script>
import moment from 'moment'
import tabs from '@/common/tabs'
import list from '@/common/list'
import storage from '@/common/storage'
import draggable from 'vuedraggable'

export default {
  data() {
    return {
      lists: [],
    }
  },
  created() {
    this.init()
  },
  components: {
    draggable,
  },
  methods: {
    tabMoved() {
      this.lists = this.lists.filter(list => list.tabs.length !== 0)
      this.storeLists()
    },
    getLists() {
      storage.getLists().then(lists => {
        if (lists) {
          this.lists = lists.filter(i => Array.isArray(i.tabs))
        }
      })
    },
    init() {
      this.getLists()
      chrome.storage.onChanged.addListener(changes => {
        if (changes.lists) {
          const newLists = changes.lists.newValue
          this.lists = newLists.filter(i => Array.isArray(i.tabs))
        }
      })
    },
    storeLists() {
      storage.setLists(this.lists).then(() => console.log('stored'))
    },
    removeList(listIndex) {
      this.lists.splice(listIndex, 1)
      this.storeLists()
    },
    removeTab(listIndex, tabIndex) {
      this.lists[listIndex].tabs.splice(tabIndex, 1)
      this.storeLists()
    },
    restoreList(listIndex, inNewWindow = false) {
      if (inNewWindow) tabs.restoreListInNewWindow(this.lists[listIndex])
      else tabs.restoreList(this.lists[listIndex])
      this.removeList(listIndex)
    },
    openChangeTitle(listIndex) {
      this.lists[listIndex].titleEditing = true
    },
    saveTitle(listIndex) {
      console.log('!!')
      this.lists[listIndex].titleEditing = false
      this.storeLists()
    },
    formatTime(time) {
      if (Date.now() - time < 3600E3) return moment(time).fromNow()

      const withYear = !moment(time).isSame(new Date(), 'year')
      return moment(time).format(`ddd, MMMM Do ${withYear ? 'YYYY' : ''}, hh:ss`)
    },
  }
}
</script>
<style lang="scss" scoped>
.date {
  font-size: 100%;
}
.title-editor {
  padding: 0;
}
.list-title {
  font-size: 100%;
  line-height: 34px;
}
.list-item {
  .clear-btn {
    display: none;
  }
  &:hover {
    .clear-btn {
      display: block;
    }
  }
}
</style>
