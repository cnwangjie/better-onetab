<template>
<div>

<v-autocomplete
  v-if="opts.enableSearch"
  solo
  :label="'search'"
  :items="searchItems"
  clearable
  item-text="title"
  item-value="value"
  :filter="searchItem"
  v-model="choice"
>
  <template
    slot="item"
    slot-scope="{ item }"
  >
    <v-list-tile-content
      :class="item.color ? item.color + '--text' : ''"
      transition="none"
    >
      <v-list-tile-title v-text="item.title"></v-list-tile-title>
      <v-list-tile-sub-title v-text="item.subtitle"></v-list-tile-sub-title>
    </v-list-tile-content>
    <v-list-tile-action>
      <v-icon>{{ 'tabIndex' in item.value ? 'link' : 'list' }}</v-icon>
    </v-list-tile-action>
  </template>
</v-autocomplete>

<v-expansion-panel ref="panel" expand popout :value="expandStatus" @input="expandStatusChanged">
  <v-expansion-panel-content
    hide-actions
    v-for="(list, listIndex) in lists"
    class="tab-list"
    :key="listIndex"
    ref="list"
    v-if="listIndex < 3"
  >
    <v-layout slot="header" row spacer>
      <v-flex no-wrap md7 lg4>

        <v-menu open-on-hover top offset-y>
          <v-chip
            slot="activator"
            label
            small
            :color="list.color"
            class="lighten-3"
          >{{ list.tabs.length }} {{ __('ui_tab') }}</v-chip>
          <v-card>
            <v-layout wrap class="color-panel">
              <v-flex wrap xs3 v-for="(color, colorIndex) in colorList" :key="colorIndex">
                <div
                  class="color-selector lighten-3"
                  :class="color"
                  @click.stop="changeColor(listIndex, color)"
                ></div>
              </v-flex>
            </v-layout>
          </v-card>
        </v-menu>
        <strong class="grey--text date">{{ __('ui_created') }} <dynamic-time v-model="list.time"></dynamic-time></strong>
      </v-flex>
      <v-flex no-wrap md6 lg9 @keydown.enter="saveTitle(listIndex)">
        <v-text-field
          class="title-editor"
          autofocus
          v-if="list.titleEditing"
          @blur="saveTitle(listIndex)"
          v-model="list.title"
          single-line
          hide-details
        ></v-text-field>
        <strong class="list-title" v-else :class="list.color ? list.color + '--text' : ''">{{ list.title }}</strong>
      </v-flex>
      <v-flex xs2 class="text-xs-right">
        <v-btn :title="__('ui_title_down_btn')" @click.stop="moveListDown(listIndex)" flat icon class="icon-in-title" :disabled="listIndex === lists.length - 1">
          <v-icon color="gray" :style="{fontSize: '14px'}">fas fa-arrow-down</v-icon>
        </v-btn>
        <v-btn :title="__('ui_title_up_btn')" @click.stop="moveListUp(listIndex)" flat icon class="icon-in-title" :disabled="listIndex === 0">
          <v-icon color="gray" :style="{fontSize: '14px'}">fas fa-arrow-up</v-icon>
        </v-btn>
        <v-btn :title="__('ui_title_pin_btn')" @click.stop="pinList(listIndex, !list.pinned)" flat icon class="icon-in-title">
          <v-icon :color="list.pinned ? 'blue' : 'gray'" :style="{fontSize: '14px'}">fas fa-thumbtack</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
    <v-card>
      <v-btn flat small v-on:click="openChangeTitle(listIndex)">{{ __('ui_retitle_list') }}</v-btn>
      <v-btn flat small v-on:click="restoreList(listIndex)">{{ __('ui_restore_all') }}</v-btn>
      <v-btn flat small v-on:click="restoreList(listIndex, true)">{{ __('ui_restore_all_in_new_window') }}</v-btn>
      <v-btn flat small color="error" v-on:click="removeList(listIndex)" :disabled="list.pinned">{{ __('ui_remove_list') }}</v-btn>
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
            :href="opts.itemClickAction !== 'none' ? tab.url : null"
            :target="opts.itemClickAction !== 'none' ? '_blank' : null"
            @click="itemClicked(listIndex, tabIndex)"
            @contextmenu="rightClicked(listIndex, tabIndex, $event)"
            class="list-item"
            :ref="'list-' + listIndex + '-tab'"
            :key="tabIndex">
            <v-list-tile-action v-if="opts.removeItemBtnPos === 'left'">
              <v-icon class="clear-btn" color="red" @click.stop.prevent="removeTab(listIndex, tabIndex)">clear</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>
                <v-avatar
                  tile
                  size="16"
                  color="grey lighten-4"
                  v-if="!opts.hideFavicon"
                >
                  <img :src="tab.favIconUrl ? tab.favIconUrl : `https://www.google.com/s2/favicons?domain=${getDomain(tab.url)}`">
                </v-avatar>
                {{ opts.itemDisplay === 'url' ? tab.url : tab.title }}
              </v-list-tile-title>
              <v-list-tile-sub-title v-if="opts.itemDisplay === 'title-and-url'">
                {{ tab.url }}
              </v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-action v-if="opts.removeItemBtnPos === 'right'">
              <v-icon class="clear-btn" color="red" @click.stop.prevent="removeTab(listIndex, tabIndex)">clear</v-icon>
            </v-list-tile-action>
          </v-list-tile>
        </draggable>
      </v-list>
    </v-card>
  </v-expansion-panel-content>
</v-expansion-panel>

<v-layout v-if="processed && lists.length === 0" align-center justify-center column fill-height class="no-list-tip">
  <h3 class="display-3 grey--text" v-text="__('ui_no_list')"></h3>
  <p class="display-2 grey--text text--lighten-1" v-html="__('ui_no_list_tip')"></p>
</v-layout>

<v-menu
  v-model="showMenu"
  :position-x="x"
  :position-y="y"
  min-width="200"
  absolute
  offset-y
>
  <v-list subheader dense>
    <v-subheader>{{ __('ui_move_to') }}</v-subheader>
    <v-list-tile
      v-for="(list, listIndex) in lists"
      :key="listIndex"
      @click="moveTo(listIndex)"
      v-if="list.title"
      :color="list.color"
    >
      <v-list-tile-title>{{ list.title }}</v-list-tile-title>
    </v-list-tile>
    <v-list-tile @click="moveTo(-1)">
      <v-list-tile-title>{{ __('ui_a_new_list') }}</v-list-tile-title>
    </v-list-tile>
  </v-list>
</v-menu>
</div>
</template>
<script>
import _ from 'lodash'
import draggable from 'vuedraggable'

import __ from '@/common/i18n'
import tabs from '@/common/tabs'
import list from '@/common/list'
import storage from '@/common/storage'
import {formatTime} from '@/common/utils'
import dynamicTime from '@/component/DynamicTime'
import {mapState} from 'vuex'

const SEPARATOR = '__$$SEPARATOR$$__'
const colorList = [
  '', 'red', 'pink', 'purple',
  'indigo', 'blue', 'cyan', 'teal',
  'green', 'yellow', 'orange', 'brown',
]
// TODO: UI performance
// TODO: pageination
export default {
  data() {
    return {
      colorList,
      lists: [],
      processed: false, // if task to get list completed
      choice: null, // choice in search result
      showMenu: false, // item right click menu
      x: NaN, y: NaN, // menu position
      rightClickedItem: null,
    }
  },
  computed: {
    ...mapState(['opts']),
    expandStatus() {
      return this.lists.map(i => i.expand)
    },
    searchItems() {
      const tabs = this.lists.map((list, listIndex) => list.tabs.map((tab, tabIndex) => ({
        text: [tab.title, tab.url].join(SEPARATOR),
        title: tab.title,
        subtitle: tab.url,
        value: {listIndex, tabIndex},
        color: list.color || '',
      })))
      const lists = this.lists.map((list, listIndex) => ({
        text: [list.title || '', formatTime(list.time), list.color || ''].join(SEPARATOR),
        title: list.title || __('ui_untitled'),
        subtitle: formatTime(list.time),
        value: {listIndex},
        color: list.color || '',
      }))
      return _.sortBy(_.flatten(tabs).concat(lists), 'title')
    },
  },
  created() {
    this.init()
  },
  components: {
    draggable,
    dynamicTime,
  },
  watch: {
    choice(item) {
      const opt = {
        duration: 500,
        offset: -50,
        easing: 'easeInOutCubic',
      }
      if (item.tabIndex) {
        this.expandList(true, item.listIndex)
        this.$vuetify.goTo(this.$refs[`list-${item.listIndex}-tab`][item.tabIndex], opt)
      } else {
        this.$vuetify.goTo(this.$refs.list[item.listIndex], opt)
      }
    }
  },
  methods: {
    __,
    formatTime,
    searchItem(item, query, itemText) {
      const texts = itemText.split(SEPARATOR)
        .filter(t => t)
        .map(i => i.toLowerCase())
      return query.split(' ')
        .filter(i => i)
        .map(i => i.toLowerCase())
        .every(i => texts.some(t => ~t.indexOf(i)))
    },
    itemClicked(listIndex, tabIndex) {
      const action = this.opts.itemClickAction
      if (action === 'open-and-remove') {
        this.removeTab(listIndex, tabIndex)
      }
    },
    expandStatusChanged(newStatus) {
      const index = this.lists.findIndex((list, i) => list.expand !== newStatus[i])
      this.expandList(newStatus[index], index)
    },
    tabMoved() {
      this.lists = this.lists.filter(list => list.tabs.length !== 0)
      this.storeLists()
    },
    async getLists() {
      const lists = await storage.getLists()
      if (lists) lists.filter(i => Array.isArray(i.tabs)).forEach(i => this.lists.push(i))
      this.$refs.panel.updateFromValue(this.expandStatus)
      this.processed = true
    },
    init() {
      this.getLists()
      chrome.storage.onChanged.addListener(changes => {
        console.debug(changes)
        if (changes.lists) {
          const newLists = changes.lists.newValue
          this.lists = newLists.filter(i => Array.isArray(i.tabs))
        }
      })
    },
    storeLists: _.debounce(function storeLists() {
      console.time('store')
      this.$nextTick(() => { // eslint-disable-line
        storage.setLists(this.lists).then(() => console.timeEnd('store')) // eslint-disable-line
      })
    }, 200),
    removeList(listIndex) {
      const list = this.lists[listIndex]
      if ((list.tabs.length !== 0) && this.opts.alertRemoveList && !confirm(`${__('ui_remove_list')}:
        [${list.tabs.length}] ${list.title || __('ui_untitled')}
        ${__('ui_created')} ${formatTime(list.time)}`)) return
      this.lists.splice(listIndex, 1)
      this.storeLists()
    },
    removeTab(listIndex, tabIndex) {
      this.lists[listIndex].tabs.splice(tabIndex, 1)
      if (this.lists[listIndex].tabs.length === 0) this.removeList(listIndex)
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
      if (this.lists[listIndex].expand === expand) return
      this.lists[listIndex].expand = expand
      this.storeLists()
    },
    changeColor(listIndex, color) {
      this.lists[listIndex].color = color
      this.$forceUpdate()
      this.storeLists()
    },
    rightClicked(listIndex, tabIndex, $event) {
      $event.preventDefault()
      this.showMenu = false
      this.rightClickedItem = {listIndex, tabIndex}
      this.x = $event.clientX
      this.y = $event.clientY
      this.$nextTick(() => {
        this.showMenu = true
      })
    },
    moveTo(targetListIndex) {
      if (!this.rightClickedItem) return
      const {listIndex, tabIndex} = this.rightClickedItem
      this.rightClickedItem = null
      const [tab] = this.lists[listIndex].tabs.splice(tabIndex, 1)
      if (targetListIndex === -1) {
        this.lists.unshift(list.createNewTabList({tabs: [tab]}))
      } else {
        this.lists[targetListIndex].tabs.push(tab)
      }
      this.tabMoved()
    },
  }
}
</script>
<style lang="scss" scoped>
.color-panel {
  width: 136px;
  height: 110px;
  padding: 5px;
  .color-selector {
    display: inline-block;
    width: 26px;
    height: 26px;
    border-radius: 13px;
    border: 2px solid white !important;
    &:hover {
      border: 2px solid gray !important;
    }
  }
}
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
.no-list-tip {
  user-select: none;
}
</style>
