<template>
<div>

<div class="text-xs-center" v-if="pageLength > 1">
  <v-pagination
    :value="currentPage"
    @input="changePage"
    :length="pageLength"
    circle
  ></v-pagination>
</div>

<v-expansion-panel
  ref="panel" expand popout
  :value="expandStatus"
  @input="expandStatusChanged"
  class="my-3"
>
  <v-expansion-panel-content
    v-for="list in inPageLists(currentPage)"
    hide-actions
    class="tab-list"
    :key="list.index"
    ref="list"
  >
    <v-layout slot="header" row spacer>
      <v-flex no-wrap xs10>

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
                  @click.stop="changeColor([list.index, color])"
                ></div>
              </v-flex>
            </v-layout>
          </v-card>
        </v-menu>
        <strong class="grey--text date">{{ __('ui_created') }} <dynamic-time v-model="list.time"></dynamic-time></strong>
      </v-flex>
      <v-flex no-wrap md6 lg9 @keydown.enter="saveTitle(list.index)">
        <v-text-field
          class="title-editor"
          autofocus
          v-if="list.titleEditing"
          @blur="saveTitle(list.index)"
          @click.prevent.stop
          v-model="list.title"
          single-line
          hide-details
        ></v-text-field>
        <div class="list-title" v-else :class="list.color ? list.color + '--text' : ''">{{ list.title }}</div>
      </v-flex>
      <v-flex xs2 class="text-xs-right">
        <v-btn :title="__('ui_title_down_btn')" @click.stop="moveListDown(list.index)" flat icon class="icon-in-title" :disabled="list.index === lists.length - 1">
          <v-icon color="gray" :style="{fontSize: '14px'}">fas fa-arrow-down</v-icon>
        </v-btn>
        <v-btn :title="__('ui_title_up_btn')" @click.stop="moveListUp(list.index)" flat icon class="icon-in-title" :disabled="list.index === 0">
          <v-icon color="gray" :style="{fontSize: '14px'}">fas fa-arrow-up</v-icon>
        </v-btn>
        <v-btn :title="__('ui_title_pin_btn')" @click.stop="pinList([list.index, !list.pinned])" flat icon class="icon-in-title">
          <v-icon :color="list.pinned ? 'blue' : 'gray'" :style="{fontSize: '14px'}">fas fa-thumbtack</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
    <v-card>
      <v-layout>
        <v-flex class="checkbox-column">
          <v-checkbox
            hide-details
            class="checkbox"
            :value="list.tabs.some(tab => tab.selected)"
            @click.self.stop="selectAllBtnClicked(list.index)"
            :indeterminate="list.tabs.some(tab => tab.selected) && list.tabs.some(tab => !tab.selected)"
          ></v-checkbox>
        </v-flex>
        <v-flex>
          <v-btn
            :ref="'multi-op-' + list.index"
            flat small v-on:click="multiOpBtnClicked(list.index, $event)"
            icon :disabled="list.tabs.every(tab => !tab.selected)"
          >
            <v-icon>more_vert</v-icon>
          </v-btn>
          <v-btn flat small v-on:click="openChangeTitle(list.index)">{{ __('ui_retitle_list') }}</v-btn>
          <v-btn flat small v-on:click="restoreList([list.index])">{{ __('ui_restore_all') }}</v-btn>
          <v-btn flat small v-on:click="restoreList([list.index, true])">{{ __('ui_restore_all_in_new_window') }}</v-btn>
          <v-btn flat small color="error" v-on:click="removeList(list.index)" :disabled="list.pinned">{{ __('ui_remove_list') }}</v-btn>
          <v-btn flat small v-on:click="pinList([list.index, !list.pinned])">{{ list.pinned ? __('ui_unpin') : __('ui_pin') }} {{ __('ui_list') }}</v-btn>
        </v-flex>
      </v-layout>
      <v-divider></v-divider>
      <v-list dense class="my-1">
        <draggable
          v-model="list.tabs"
          :options="draggableOptions"
          @change="tabMoved([list.index])"
        >
          <v-list-tile
            v-for="(tab, tabIndex) in list.tabs"
            :href="opts.itemClickAction !== 'none' ? tab.url : null"
            :target="opts.itemClickAction !== 'none' ? '_blank' : null"
            @click.self="itemClicked([list.index, tabIndex])"
            @contextmenu="rightClicked(list.index, tabIndex, $event)"
            class="list-item"
            :ref="'list-' + list.index + '-tab'"
            :key="tabIndex"
            v-if="tabIndex < 10 || list.showAll"
          >
            <div class="drag-indicator" @click.stop.prevent><i></i></div>
            <v-list-tile-action>
              <v-checkbox
                hide-details
                class="checkbox"
                :value="tab.selected"
                @click.prevent.stop.self="tabSelected(listIndex, tabIndex, !tab.selected)"
              ></v-checkbox>
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
          </v-list-tile>
          <v-layout v-if="list.tabs.length > 10 && !list.showAll">
            <v-flex class="text-xs-center">
              <v-btn small flat @click="showAll(list.index)"><v-icon>more_horiz</v-icon></v-btn>
            </v-flex>
          </v-layout>
        </draggable>
      </v-list>
    </v-card>
  </v-expansion-panel-content>
</v-expansion-panel>

<div class="text-xs-center" v-if="pageLength > 1">
  <v-pagination
    :value="currentPage"
    @input="changePage"
    :length="pageLength"
    circle
  ></v-pagination>
</div>

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
  <v-list dense>
    <!-- <v-subheader>{{ __('ui_move_to') }}</v-subheader> -->
    <v-menu offset-x open-on-hover>
      <v-list-tile @click="init" slot="activator">
        <v-list-tile-action>
          <v-icon small>move_to_inbox</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          {{ __('ui_move_to') }}
        </v-list-tile-content>
        <v-list-tile-action>
          <v-icon :style="{transform: 'rotate(-90deg)'}">arrow_drop_down</v-icon>
        </v-list-tile-action>
      </v-list-tile>
      <v-list dense>
        <v-list-tile
          v-for="(list, listIndex) in lists"
          :key="listIndex"
          @click="moveSelectedItemsTo(listIndex)"
          v-if="list.title"
          :color="list.color"
        >
          <v-list-tile-title>{{ list.title }}</v-list-tile-title>
        </v-list-tile>
        <v-list-tile @click="moveSelectedItemsTo(-1)">
          <v-list-tile-title>{{ __('ui_a_new_list') }}</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>

    <v-divider class="my-1"></v-divider>

    <v-list-tile @click="duplicateSelectedItems">
      <v-list-tile-action>
        <v-icon small>content_copy</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        Duplicate
      </v-list-tile-content>
    </v-list-tile>

    <v-list-tile @click="copyLinksOfSelectedItems">
      <v-list-tile-action>
        <v-icon small>link</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        Copy link
      </v-list-tile-content>
    </v-list-tile>

    <v-list-tile @click="copyTitleOfSelectedItems">
      <v-list-tile-action>
        <v-icon small>title</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        Copy title
      </v-list-tile-content>
    </v-list-tile>

    <v-divider class="my-1"></v-divider>

    <v-list-tile @click="removeSelectedItems">
      <v-list-tile-action>
        <v-icon small>delete</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        Remove
      </v-list-tile-content>
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
import {createNewTabList} from '@/common/list'
import storage from '@/common/storage'
import listManager from '@/common/listManager'
import {formatTime} from '@/common/utils'
import dynamicTime from '@/component/DynamicTime'
import browser from 'webextension-polyfill'
import {ADD_LIST} from '@/common/constants'
import {mapState, mapActions, mapMutations, mapGetters} from 'vuex'
if (DEBUG) window.listManager = listManager
const colorList = [
  '', 'red', 'pink', 'purple',
  'indigo', 'blue', 'cyan', 'teal',
  'green', 'yellow', 'orange', 'brown',
]
// TODO: collapse all list
export default {
  data() {
    return {
      colorList,
      processed: false, // if task to get list completed
      choice: null, // choice in search result
      showMenu: false, // item right click menu
      x: NaN, y: NaN, // menu position
      rightClickedItem: null, // if right click on an item
      multiOpBtnClickedListIndex: null,
      currentHighlightItem: null, // after jump to an item
      draggableOptions: {
        group: {
          name: 'g',
          put: true,
          pull: true,
        },
        animation: 150,
        handle: '.drag-indicator',
      },
      expandStatus: [],
    }
  },
  watch: {
    '$route.query.p': 'updateExpandStatus',
  },
  computed: {
    ...mapGetters(['inPageLists', 'pageLength', 'getExpandStatus']),
    ...mapState(['opts', 'lists']),
    currentPage() {
      return +this.$route.query.p || 1
    },
  },
  created() {
    this.init()
  },
  activated() {
    if (this.$route.query.listIndex != null) this.jumpTo(this.$route.query)
  },
  components: {
    draggable,
    dynamicTime,
  },
  methods: {
    __,
    formatTime,
    ...mapMutations(['openChangeTitle', 'showAll', 'tabSelected', 'addTab', 'removeTabDirectly']),
    ...mapActions([
      'showSnackbar', 'itemClicked', 'getLists', 'itemClicked',
      'removeList', 'removeTab', 'restoreList', 'saveTitle',
      'pinList', 'moveListUp', 'moveListDown', 'expandList',
      'changeColor', 'tabMoved',
    ]),
    init() {
      if (DEBUG) window.dl = this
      this.getLists().then(() => {
        this.updateExpandStatus()
        if (!this.processed) {
          this.processed = true
          if (this.$route.query.listIndex != null) this.jumpTo(this.$route.query)
        }
      })
      listManager.init()
      browser.runtime.onMessage.addListener(({refreshed}) => {
        if (refreshed) this.getLists()
      })
      document.addEventListener('click', () => {
        if (!this.currentHighlightItem) return
        this.currentHighlightItem.$el.classList.remove('elevation-20')
      })
      document.addEventListener('keydown', event => {
        if (event.keyCode === 27) this.showMenu = false
      })
    },
    expandStatusChanged(newStatus) {
      const indexInPage = this.expandStatus.findIndex((s, i) => s !== newStatus[i])
      if (!~indexInPage) return
      const index = indexInPage + (this.currentPage - 1) * this.opts.listsPerPage
      const expand = newStatus[indexInPage]
      this.expandList([expand, index])
    },
    async updateExpandStatus() {
      await this.$nextTick()
      this.expandStatus = this.getExpandStatus(this.currentPage)
    },
    openTab(listIndex, tabIndex) {
      tabs.openTab(this.lists[listIndex].tabs[tabIndex])
    },
    getDomain(url) {
      try {
        return new URL(url).hostname
      } catch (error) {
        return ''
      }
    },
    rightClicked(listIndex, tabIndex, $event) {
      $event.preventDefault()
      this.showMenu = false
      this.rightClickedItem = {listIndex, tabIndex}
      this.multiOpBtnClickedListIndex = null
      this.x = $event.clientX
      this.y = $event.clientY
      this.$nextTick(() => {
        this.showMenu = true
      })
    },
    getSelectedItems() {
      if (this.rightClickedItem) return [this.rightClickedItem]
      else if (isFinite(this.multiOpBtnClickedListIndex)) {
        const listIndex = this.multiOpBtnClickedListIndex
        const list = this.lists[listIndex]
        const selectedItems = []
        list.tabs.forEach((tab, tabIndex) => {
          if (tab.selected) selectedItems.push({listIndex, tabIndex})
        })
        return selectedItems
      }
    },
    moveSelectedItemsTo(targetListIndex) {
      const items = this.getSelectedItems()
      if (!items) return
      const changedLists = [targetListIndex]
      const tabs = items.map(({listIndex, tabIndex}) => {
        changedLists.push(listIndex)
        return this.lists[listIndex].tabs[tabIndex]
      })
      items.sort((a, b) => b.tabIndex - a.tabIndex)
        .forEach(({listIndex, tabIndex}) => this.removeTabDirectly([listIndex, tabIndex]))

      if (targetListIndex === -1) {
        const newList = createNewTabList({tabs})
        this[ADD_LIST]([newList])
        this.tabMoved(changedLists.map(i => i + 1)) // it will create a new list
      } else {
        tabs.forEach(tab => this.addTab([targetListIndex, tab]))
        this.tabMoved(changedLists)
      }
    },
    duplicateSelectedItems() {
      const items = this.getSelectedItems()
      if (!items) return
      const changedLists = []
      items.forEach(({listIndex, tabIndex}) => {
        changedLists.push(listIndex)
        this.addTab([listIndex, tabIndex, this.lists[listIndex].tabs[tabIndex]])
      })
      this.tabMoved(changedLists)
    },
    async copyLinksOfSelectedItems() {
      const items = this.getSelectedItems()
      if (!items) return
      const text = items.map(({listIndex, tabIndex}) => {
        const tab = this.lists[listIndex].tabs[tabIndex]
        return tab.url
      }).join('\n')
      if (await this.$copyText(text)) this.showSnackbar(__('ui_copied'))
    },
    async copyTitleOfSelectedItems() {
      const items = this.getSelectedItems()
      if (!items) return
      const text = items.map(({listIndex, tabIndex}) => {
        const tab = this.lists[listIndex].tabs[tabIndex]
        return tab.title
      }).join('\n')
      if (await this.$copyText(text)) this.showSnackbar(__('ui_copied'))
    },
    removeSelectedItems() {
      const items = this.getSelectedItems()
      if (!items) return
      const changedLists = []
      items.sort((a, b) => b.tabIndex - a.tabIndex)
        .forEach(({listIndex, tabIndex}) => {
          changedLists.push(listIndex)
          this.removeTabDirectly([listIndex, tabIndex])
        })
      this.tabMoved(changedLists)
    },
    changePage(page) {
      this.$router.push({name: 'detailList', query: {p: page}})
    },
    selectAllBtnClicked(listIndex) {
      const list = this.lists[listIndex]
      const targetStatus = list.tabs.every(tab => !tab.selected)
      for (let i = 0; i < list.tabs.length; i += 1) {
        this.tabSelected(listIndex, i, targetStatus)
      }
    },
    multiOpBtnClicked(listIndex, $event) {
      this.x = $event.x
      this.y = $event.y
      this.multiOpBtnClickedListIndex = listIndex
      this.rightClickedItem = null
      this.showMenu = true
    },
    async jumpTo(item) {
      const page = item.listIndex / this.opts.listsPerPage << 0
      this.$router.replace({name: 'detailList', query: {p: page}})
      await this.$nextTick()
      const opt = {
        duration: 500,
        offset: -100,
        easing: 'easeInOutCubic',
      }
      if (item.tabIndex) {
        this.expandList([true, item.listIndex])
        this.currentHighlightItem = this.$refs[`list-${item.listIndex}-tab`][item.tabIndex]
      } else {
        this.currentHighlightItem = this.$refs.list[item.listIndex]
      }
      console.log(this.currentHighlightItem)
      this.currentHighlightItem.$el.classList.add('elevation-20')
      this.$vuetify.goTo(this.currentHighlightItem, opt)
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
  display: inline-flex;
  width: 80%;
  font-size: 12px;
  :global(.v-input__control) {
    padding: 0 !important;
  }
}
.list-title {
  display: inline-block;
  font-size: 100%;
  line-height: 34px;
  padding: 0 12px;
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
  .checkbox-column {
    max-width: 40px;
    margin-left: 16px;
    .checkbox {
      margin-left: 20px;
      margin-top: 0;
      padding-top: (40px - 24px) / 2;
    }
  }
}
.sortable-ghost, .sortable-chosen {
  opacity: .5;
  box-shadow: 0 3px 3px -2px rgba(0,0,0,.2), 0 3px 4px 0 rgba(0,0,0,.14), 0 1px 8px 0 rgba(0,0,0,.12);
  &.list-item {
    .drag-indicator {
      display: flex;
    }
  }
}
.sortable-drag {
  opacity: 0;
}
.list-item {
  .checkbox {
    margin-left: 20px;
  }
  .clear-btn {
    display: none;
  }
  &:hover {
    .clear-btn {
      display: block;
    }
    .drag-indicator {
      display: flex;
    }
  }
  .drag-indicator {
    position: absolute;
    cursor: move;
    z-index: 1000;
    display: none;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    i {
      display: inline-block;
      width: 16px;
      height: 16px;
      background-repeat: no-repeat;
      background-size: contain;
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAQAAABIkb+zAAABiElEQVR4Ae3ZgYYCYRQF4AVi9QhVMECJuefNtl6h9AS79QhJz1ADQFX7HFtUrMVWdxdYMv+PvVz/cL4DcBCYuZ15ov8iIiIiIqJeA31Z4fSbJQbdpr3vqFPHXO7Qv8gd807d3neR1bCBlmST1ex9BzKBlkcm1r4DyeQW/EE3yQx9H/kIGk4+MvR9YAcNR/aGvg98QSP5NPR94AKN5GLo+5A9NBx5N/R9YAyNZGzo+8jbscciWoZ+Ai+yqb3vckrIvvyRmNXsfadjThaPx5ksOnVD31+3iYEUOOIoRfg8jvT9ERERcRfiLsRdiLsQdyHuQtyFuAtxF+IuxF2IuxAREXEXyl+kwAEHWaHfa1RsF5KZ3B7+ns/wXJldSNalx9m6IrsQXqGBvFVgF0ILV2gg33k7+V1IhtBwZJj+LrSBRrJNfxc6QSM5pb8LnaGRnJPfhbCFRrIz7EKpjbv2Xcj/MXq170LVepFNE/vElNwuZDjOUtuFAudxgQ8csMSg1+AuREREREREXn4A0o+voNRuPgAAAAAASUVORK5CYII=);
    }
  }
}
.no-list-tip {
  user-select: none;
}
</style>
