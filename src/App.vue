<template>
  <div id="app">
    <div class="container">
      <div class="header">
        <h1>OneTab</h1>
      </div>
      <div class="tab-list" v-for="(list, listIndex) in lists">
        <div class="title-line">
          <div class="list-title">
            <div class="tab-sum">{{ list.tabs.length }} tab(s)</div>
            <div class="date">Created {{ formatTime(list.time) }}</div>
            <input :ref="`title-editor-${listIndex}`" class="title-editor" v-if="list.titleEditing" v-on:keydown.self.enter="saveTitle(listIndex)" v-model="list.title"></input>
            <div class="title" v-else>{{ list.title }}</div>
          </div>

          <a class="btn" v-on:click="openChangeTitle(listIndex)">retitle list</a>
          <a class="btn" v-on:click="restoreList(listIndex)">restore all</a>
          <a class="btn" v-on:click="removeList(listIndex)">remove list</a>
        </div>
        <ul>
          <li v-for="(tab, tabIndex) in list.tabs" draggable="true">
            <img v-if="tab && tab.favIconUrl" :src="tab.favIconUrl"></img>
            <a :href="tab.url" target="_blank">{{ tab.title }}</a>
            <div class="remove-btn" v-on:click="removeTab(listIndex, tabIndex)">
              <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" style="pointer-events: none; display: block; width: 100%; height: 100%;"><g style="fill:red"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"></path></g></svg>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
import moment from 'moment'
import tabs from './common/tabs'
import list from './common/list'
import storage from './common/storage'

export default {
  data() {
    return {
      lists: [],
    }
  },
  created() {
    this.init()
  },
  methods: {
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
      storage.setLists(this.lists, () => console.log('stored'))
    },
    removeList(listIndex) {
      this.lists.splice(listIndex, 1)
      this.storeLists()
    },
    removeTab(listIndex, tabIndex) {
      this.lists[listIndex].tabs.splice(tabIndex, 1)
      this.storeLists()
    },
    restoreList(listIndex) {
      tabs.restoreList(this.lists[listIndex])
      this.removeList(listIndex)
    },
    openChangeTitle(listIndex) {
      this.lists[listIndex].titleEditing = true
      this.$nextTick(() => {
        const editor = this.$refs[`title-editor-${listIndex}`].shift()
        editor.focus()
        editor.setSelectionRange(0, editor.value.length)
      })
    },
    saveTitle(listIndex) {
      this.lists[listIndex].titleEditing = false
      this.storeLists()
    },
    formatTime(time) {
      if (Date.now() - time < 3600E3)
        return moment(time).fromNow()
      else {
        const withYear = !moment(time).isSame(new Date(), 'year')
        return moment(time).format(`ddd, MMMM Do ${withYear ? 'YYYY' : ''}, hh:ss`)
      }
    },
  }
}
</script>
<style lang="scss">
$theme-color: #ff5722;
body {
  margin: 0;
}
.header {
  height: 72px;
  h1 {
    font-family: serif;
    font-size: 42px;
  }
}
.list-title {
  height: 48px;
  div {
    display: inline-block;
  }
  .tab-sum {
    color: gray;
    font-size: 16px;
    margin: 0 16px 0 0;
  }

  .title {
    display: inline-block;
    padding: 8px 16px;
    margin: 0 32px;
  }
  .title-editor {
    display: inline-block;
    height: 16px;
    padding: 8px 16px 7px;
    margin: 0 32px;
    border: 0;
    border-bottom: $theme-color 1px solid;
    &:focus {
      outline: none;
    }
  }
}
.btn {
  display: inline-block;
  padding: 4px 8px;
  color: $theme-color;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
}
.container {
  box-shadow: 0 0 10px black;
  max-width: 680px;
  margin: 0 auto;
  padding: 8px 45px;
  border: 0;
  .tab-icon {
    border-radius: 0;
  }
  .tab-list {
    margin: 26px 0 42px;
    padding: 0 25px;
    ul {
      list-style: none;
      padding: 0;
      li {
        height: 32px;
        line-height: 32px;
        padding: 2px 8px;
        transition: .2s;
        &:hover {
          box-shadow: 2px 2px 5px black;
          transition: .2s;
        }
        img {
          width: 16px;
          height: 16px;
          padding: 8px;
        }
        a {
          text-decoration: none;
          color: black;
          height: 32px;
          position: absolute;
        }
        span {
          color: $theme-color;
          float: right;
          height: 32px;
        }
        .remove-btn {
          opacity: 0;
          float: right;
          cursor: pointer;
          position: relative;
          padding: 6px;
          height: 20px;
          width: 20px;
          color: white;
          &:hover {
            opacity: 0.7;
          }
        }
      }
    }
  }
}
</style>

