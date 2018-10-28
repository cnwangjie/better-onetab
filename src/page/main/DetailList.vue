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

<v-expansion-panel ref="panel" expand popout :value="expandStatus" @input="expandStatusChanged" class="my-3">
  <v-expansion-panel-content
    hide-actions
    v-for="(list, listIndex) in lists"
    class="tab-list"
    :key="listIndex"
    ref="list"
    v-if="inCurrentPage(listIndex)"
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
          @click.prevent.stop
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
      <v-layout>
        <v-flex class="checkbox-column">
          <v-checkbox
            hide-details
            class="checkbox"
            :value="list.tabs.some(tab => tab.selected)"
            @click.self.stop="selectAllBtnClicked(listIndex)"
            :indeterminate="list.tabs.some(tab => tab.selected) && list.tabs.some(tab => !tab.selected)"
          ></v-checkbox>
        </v-flex>
        <v-flex>
          <v-btn
            :ref="'multi-op-' + listIndex"
            flat small v-on:click="multiOpBtnClicked(listIndex, $event)"
            icon :disabled="list.tabs.every(tab => !tab.selected)"
          >
            <v-icon>more_vert</v-icon>
          </v-btn>
          <v-btn flat small v-on:click="openChangeTitle(listIndex)">{{ __('ui_retitle_list') }}</v-btn>
          <v-btn flat small v-on:click="restoreList(listIndex)">{{ __('ui_restore_all') }}</v-btn>
          <v-btn flat small v-on:click="restoreList(listIndex, true)">{{ __('ui_restore_all_in_new_window') }}</v-btn>
          <v-btn flat small color="error" v-on:click="removeList(listIndex)" :disabled="list.pinned">{{ __('ui_remove_list') }}</v-btn>
          <v-btn flat small v-on:click="pinList(listIndex, !list.pinned)">{{ list.pinned ? __('ui_unpin') : __('ui_pin') }} {{ __('ui_list') }}</v-btn>
        </v-flex>
      </v-layout>
      <v-divider></v-divider>
      <v-list dense class="my-1">
        <draggable
          v-model="list.tabs"
          :options="draggableOptions"
          @change="tabMoved"
        >
          <v-list-tile
            v-for="(tab, tabIndex) in list.tabs"
            :href="opts.itemClickAction !== 'none' ? tab.url : null"
            :target="opts.itemClickAction !== 'none' ? '_blank' : null"
            @click.self="itemClicked(listIndex, tabIndex)"
            @contextmenu="rightClicked(listIndex, tabIndex, $event)"
            class="list-item"
            :ref="'list-' + listIndex + '-tab'"
            :key="tabIndex"
            v-if="tabIndex < 10 || list.showAll"
          >
            <div class="drag-indicator" @click.stop.prevent><i></i></div>
            <v-list-tile-action v-if="opts.removeItemBtnPos === 'left'">
              <v-checkbox
                hide-details
                class="checkbox"
                v-model="tab.selected"
                @click.prevent.stop.self="$set(tab, 'selected', !tab.selected)"
              ></v-checkbox>
              <!-- <v-icon class="clear-btn" color="red" @click.stop.prevent="removeTab(listIndex, tabIndex)">clear</v-icon> -->
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
            <!-- <v-list-tile-action v-if="opts.removeItemBtnPos === 'right'">
              <v-icon class="clear-btn" color="red" @click.stop.prevent="removeTab(listIndex, tabIndex)">clear</v-icon>
            </v-list-tile-action> -->
          </v-list-tile>
          <v-layout v-if="list.tabs.length > 9 && !list.showAll">
            <v-flex class="text-xs-center">
              <v-btn small flat @click="showAll(listIndex)"><v-icon>more_horiz</v-icon></v-btn>
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
import list from '@/common/list'
import storage from '@/common/storage'
import {formatTime} from '@/common/utils'
import dynamicTime from '@/component/DynamicTime'
import {mapState, mapMutations} from 'vuex'

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
      lists: [],
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
    }
  },
  computed: {
    ...mapState(['opts']),
    expandStatus() {
      return this.lists.slice(
        (this.currentPage - 1) * this.opts.listsPerPage,
        this.currentPage * this.opts.listsPerPage
      ).map(i => i.expand)
    },
    currentPage() {
      return +this.$route.query.p || 1
    },
    pageLength() {
      return Math.ceil(this.lists.length / this.opts.listsPerPage)
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
  watch: {
    currentPage() {
      this.updateExpandStatus()
    },
  },
  methods: {
    __,
    formatTime,
    ...mapMutations(['showSnackbar']),
    itemClicked(listIndex, tabIndex) {
      const action = this.opts.itemClickAction
      if (action === 'open-and-remove') {
        this.removeTab(listIndex, tabIndex)
      }
    },
    expandStatusChanged(newStatus) {
      const index = this.lists.findIndex((list, i) => list.expand !== newStatus[i]) + (this.currentPage - 1) * this.opts.listsPerPage
      this.expandList(newStatus[index], index)
    },
    tabMoved() {
      this.lists = this.lists.filter(list => list.tabs.length !== 0)
      this.storeLists()
    },
    async getLists() {
      const lists = await storage.getLists()
      if (lists) lists.filter(i => Array.isArray(i.tabs)).forEach(i => this.lists.push(i))
      this.updateExpandStatus()
      this.processed = true
    },
    init() {
      this.getLists()
      // TODO: load new list from message
      // chrome.storage.onChanged.addListener(changes => {
      //   console.debug(changes)
      //   if (changes.lists) {
      //     const newLists = changes.lists.newValue
      //     this.lists = newLists.filter(i => Array.isArray(i.tabs))
      //   }
      // })
      document.addEventListener('click', () => {
        if (!this.currentHighlightItem) return
        this.currentHighlightItem.$el.classList.remove('elevation-20')
      })
      document.addEventListener('keydown', event => {
        if (event.keyCode === 27) this.showMenu = false
      })
    },
    updateExpandStatus() {
      this.$refs.panel.updateFromValue(this.expandStatus)
    },
    storeLists: _.debounce(async function storeLists() {
      console.time('store')
      await storage.setLists(this.lists) // eslint-disable-line
      console.timeEnd('store')
    }, 2000),
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
      this.$set(this.lists[listIndex], 'titleEditing', true)
    },
    saveTitle(listIndex) {
      this.$set(this.lists[listIndex], 'titleEditing', false)
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
      this.multiOpBtnClickedListIndex = null
      this.x = $event.clientX
      this.y = $event.clientY
      this.$nextTick(() => {
        this.showMenu = true
      })
    },
    getSelectedItems() {
      if (this.rightClickedItem) return [this.rightClickedItem]
      else if (this.multiOpBtnClickedListIndex) {
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
      const tabs = []
      items.forEach(({listIndex, tabIndex}) => {
        const [tab] = this.lists[listIndex].tabs.splice(tabIndex, 1)
        tabs.push(tab)
      })
      if (targetListIndex === -1) {
        this.lists.unshift(list.createNewTabList({tabs}))
      } else {
        tabs.forEach(tab => this.lists[targetListIndex].tabs.push(tab))
      }
      this.tabMoved()
    },
    duplicateSelectedItems() {
      const items = this.getSelectedItems()
      if (!items) return
      items.forEach(({listIndex, tabIndex}) => {
        const tab = Object.assign({}, this.lists[listIndex].tabs[tabIndex])
        this.lists[listIndex].tabs.push(tab)
      })
      this.tabMoved()
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
      items.forEach(({listIndex, tabIndex}) => {
        this.lists[listIndex].tabs.splice(tabIndex, 1)
      })
      this.tabMoved()
    },
    showAll(listIndex) {
      this.lists[listIndex].showAll = true
      this.$forceUpdate()
    },
    changePage(page) {
      this.$router.push({name: 'detailList', query: {p: page}})
    },
    inCurrentPage(index) {
      return index >= (this.currentPage - 1) * this.opts.listsPerPage
        && index < this.currentPage * this.opts.listsPerPage
    },
    selectAllBtnClicked(listIndex) {
      const list = this.lists[listIndex]
      const targetStatus = list.tabs.every(tab => !tab.selected)
      list.tabs.forEach(tab => this.$set(tab, 'selected', targetStatus))
    },
    multiOpBtnClicked(listIndex, $event) {
      console.log(listIndex, $event)
      this.x = $event.x
      this.y = $event.y
      this.multiOpBtnClickedListIndex = listIndex
      this.rightClickedItem = null
      this.showMenu = true
    },
    jumpTo(item) {
      const page = item.listIndex / this.opts.listsPerPage << 0
      this.$router.replace({name: 'detailList', query: {p: page}})
      const opt = {
        duration: 500,
        offset: -100,
        easing: 'easeInOutCubic',
      }
      if (item.tabIndex) {
        this.expandList(true, item.listIndex)
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
