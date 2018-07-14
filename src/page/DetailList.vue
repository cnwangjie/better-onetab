<template>
<v-expansion-panel expand popout>
  <v-expansion-panel-content
    hide-actions
    v-for="(list, listIndex) in lists"
    :value="list.expand"
    @input="expandList($event, listIndex)"
    class="tab-list"
    :key="listIndex"
  >
    <v-layout slot="header" row spacer>
      <v-flex no-wrap xs3>
        <v-chip
          label
          small
        >{{ list.tabs.length }} {{ __('ui_tab') }}</v-chip>
        <strong class="grey--text date">{{ __('ui_created') }} {{ formatTime(list.time) }}</strong>
      </v-flex>
      <v-flex no-wrap xs7>
        <v-text-field
          class="title-editor"
          autofocus
          v-if="list.titleEditing"
          @blur="saveTitle(listIndex)"
          v-model="list.title"
        ></v-text-field>
        <strong class="list-title" v-else>{{ list.title }}</strong>
      </v-flex>
      <v-flex xs2 class="text-xs-right">
        <v-btn @click.stop="moveListDown(listIndex)" flat icon class="icon-in-title" :disabled="listIndex === lists.length - 1">
          <v-icon :title="__('ui_title_down_btn')" color="gray" :style="{fontSize: '14px'}">fas fa-arrow-down</v-icon>
        </v-btn>
        <v-btn @click.stop="moveListUp(listIndex)" flat icon class="icon-in-title" :disabled="listIndex === 0">
          <v-icon :title="__('ui_title_up_btn')" color="gray" :style="{fontSize: '14px'}">fas fa-arrow-up</v-icon>
        </v-btn>
        <v-btn @click.stop="pinList(listIndex, !list.pinned)" flat icon class="icon-in-title">
          <v-icon :title="__('ui_title_pin_btn')" :color="list.pinned ? 'blue' : 'gray'" :style="{fontSize: '14px'}">fas fa-thumbtack</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
    <v-card>
      <v-btn flat small v-on:click="openChangeTitle(listIndex)">{{ __('ui_retitle_list') }}</v-btn>
      <v-btn flat small v-on:click="restoreList(listIndex)">{{ __('ui_restore_all') }}</v-btn>
      <v-btn flat small v-on:click="restoreList(listIndex, true)">{{ __('ui_restore_all_in_new_window') }}</v-btn>
      <v-btn flat small color="error" v-on:click="removeList(listIndex)">{{ __('ui_remove_list') }}</v-btn>
      <v-btn flat small v-on:click="pinList(listIndex, !list.pinned)">{{ list.pinned ? __('ui_unpin') : __('ui_pin') }} {{ __('ui_list') }}</v-btn>
      <v-divider></v-divider>
      <v-list dense class="my-1">
        <draggable
          v-model="list.tabs"
          :options="{group: {name: 'g', put: true, pull: true}}"
          @change="tabMoved"
        >
          <v-list-tile
            v-for="(tab, tabIndex) in list.tabs"
            @click="itemClicked(listIndex, tabIndex)"
            class="list-item"
            :key="tabIndex">
            <v-list-tile-action>
              <v-icon class="clear-btn" color="red" @click.stop="removeTab(listIndex, tabIndex)">clear</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>
                <v-avatar
                  tile
                  size="16"
                  color="grey lighten-4"
                >
                  <img :src="tab.favIconUrl ? tab.favIconUrl : `https://www.google.com/s2/favicons?domain=${getDomain(tab.url)}`">
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
import _ from 'lodash'
import draggable from 'vuedraggable'

import __ from '@/common/i18n'
import tabs from '@/common/tabs'
import list from '@/common/list'
import storage from '@/common/storage'
import {formatTime} from '@/common/utils'

export default {
  data() {
    return {
      lists: [],
      itemClickAction: '',
      itemDisplay: '',
    }
  },
  created() {
    this.init()
  },
  components: {
    draggable,
  },
  methods: {
    __,
    formatTime,
    async itemClicked(listIndex, tabIndex) {
      const action = this.itemClickAction
      if (action === 'open-and-remove') {
        this.openTab(listIndex, tabIndex)
        this.removeTab(listIndex, tabIndex)
      } else if (action === 'open') {
        this.openTab(listIndex, tabIndex)
      }
    },
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
    async init() {
      this.getLists()
      const opts = await storage.getOptions()
      this.itemClickAction = opts.itemClickAction
      this.itemDisplay = opts.itemDisplay
      chrome.storage.onChanged.addListener(changes => {
        if (changes.lists) {
          const newLists = changes.lists.newValue
          this.lists = newLists.filter(i => Array.isArray(i.tabs))
        }
      })
      chrome.runtime.onMessage.addListener(msg => {
        if (msg.optionsChanged && ['itemClickAction', 'itemDisplay'].indexOf(Object.keys(msg.optionsChanged)) !== -1) {
          Object.keys(msg.optionsChanged).map(key => {
            this[key] = msg.optionsChanged[key]
          })
        }
      })
    },
    storeLists: _.debounce(function() {
      console.time('store')
      storage.setLists(this.lists).then(() => console.timeEnd('store'))
    }, 200),
    removeList(listIndex) {
      this.lists.splice(listIndex, 1)
      this.storeLists()
    },
    removeTab(listIndex, tabIndex) {
      this.lists[listIndex].tabs.splice(tabIndex, 1)
      if (this.lists[listIndex].tabs.length === 0)
        this.removeList(listIndex)
      this.storeLists()
    },
    openTab(listIndex, tabIndex) {
      tabs.openTab(this.lists[listIndex].tabs[tabIndex])
    },
    restoreList(listIndex, inNewWindow = false) {
      if (inNewWindow) tabs.restoreListInNewWindow(this.lists[listIndex])
      else tabs.restoreList(this.lists[listIndex])
      if (this.lists[listIndex].pinned) return
      this.removeList(listIndex)
    },
    openChangeTitle(listIndex) {
      this.lists[listIndex].titleEditing = true
    },
    saveTitle(listIndex) {
      this.lists[listIndex].titleEditing = false
      this.storeLists()
    },
    getDomain(url) {
      try {
        return new URL(url).hostname
      } catch (error) {
        return ''
      }
    },
    pinList(listIndex, pin = true) {
      this.lists[listIndex].pinned = pin
      this.storeLists()
    },
    swapListItem(a, b) {
      [this.lists[a], this.lists[b]] = [this.lists[b], this.lists[a]]
      this.storeLists()
      this.$forceUpdate()
    },
    moveListUp(listIndex) {
      if (listIndex === 0) return
      this.swapListItem(listIndex, listIndex - 1)
    },
    moveListDown(listIndex) {
      if (listIndex === this.lists.length - 1) return
      this.swapListItem(listIndex, listIndex + 1)
    },
    expandList(expand, listIndex) {
      this.lists[listIndex].expand = expand
      this.storeLists()
    }
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
.tab-list {
  .icon-in-title {
    margin: 0 0 0 auto;
    width: 30px;
    height: 30px;
  }
  .icon-in-title {
    .gray--text {
      display: none;
    }
  }
  &:hover {
    .icon-in-title {
      .gray--text {
        display: flex;
      }
    }
  }
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
