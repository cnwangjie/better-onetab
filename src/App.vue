<template>
  <div id="app">
    <div class="container">
      <div class="tab-list" v-for="(list, listIndex) in lists">
        <div class="title-line">
          <div class="list-title">
            <span>{{ list.tabs.length }} tab(s)</span>
            <input class="title-editor" v-if="list.titleEdting" v-on:keydown.self.enter="list.titleEdting = false" v-model="list.title"></input>
            <span class="title" v-else>{{ list.title }}</span>
          </div>

          <a class="btn" v-on:click="list.titleEdting = true">retitle list</a>
          <a class="btn">restore all</a>
          <a class="btn" v-on:click="lists.splice(listIndex, 1)">remove list</a>
        </div>
        <ul>
          <li v-for="(tab, tabIndex) in list.tabs" draggable="true">
            <img v-if="tab && tab.favIconUrl" :src="tab.favIconUrl"></img>
            <a :href="tab.url" target="_blank">{{ tab.title }}</a>
            <span class="btn" v-on:click="list.tabs.splice(tabIndex, 1)">X</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
import storage from './common/storage'
import tabs from './common/tabs'

export default {
  data() {
    return {
      lists: [],
    }
  },
  created() {
    this.init()
  },
  watch: {
    'lists': 'storeLists',
  },
  methods: {
    init() {
      storage.getLists().then(lists => {
        if (lists) {
          lists.map(list => {
            if (Array.isArray(list.tabs)) {
              this.lists.push({
                tabs: list.tabs,
                title: list.title || '',
                time: list.time || Date.now(),
                titleEdting: false,
              })
            }
          })
        }
      })
    },
    storeLists() {
      storage.setLists(this.lists, () => console.log('stored'))
    },
    open() {

    }
  }
}
</script>
<style lang="scss">
.title {
  display: inline-block;
  padding: 0 32px;
}
.btn {
  display: inline-block;
  padding: 4px 8px;
  color: red;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
}
.title-editor {
  display: inline-block;
  height: 16px;
}
.container {
  max-width: 680px;
  margin: 0 auto;
  border: 0;
  .tab-icon {
    border-radius: 0;
  }
  .tab-list {
    margin: 26px 0 42px;
    ul {
      list-style: none;
      padding: 0;
      li {
        height: 32px;
        line-height: 32px;
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
          color: red;
          float: right;
          height: 32px;
        }
      }
    }
  }
}
</style>

