<template>
<div>
  <transition-group
    tag="v-layout" name="slide" class="wrap"
    v-if="!q"
  >
    <v-flex wrap xs12 sm6 offset-sm3 class="my-3" key="color" v-if="card > 0">
      <v-card>
        <v-subheader>Color</v-subheader>
        <div>
          <div class="color-placeholder" v-for="color in listColors" :key="color">
            <router-link
              class="lighten-3 color-btn" :class="color" replace
              :to="{name: 'search', query: {q: encodeURIComponent('color:' + color + ' ')}}"
            ></router-link>
          </div>
        </div>
      </v-card>
    </v-flex>
  </transition-group>

  <v-card v-if="q && items && items.length">
    <v-list>
      <v-list-tile
        v-for="(item, index) in items" :key="index" :color="item.color"
        :to="{name: 'detailList', query: item.value}"
      >
        <v-list-tile-content>
          <v-list-tile-title v-text="item.title"></v-list-tile-title>
          <v-list-tile-sub-title v-text="item.subtitle"></v-list-tile-sub-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-icon>{{ 'tabIndex' in item.value ? 'link' : 'list' }}</v-icon>
        </v-list-tile-action>
      </v-list-tile>
    </v-list>
  </v-card>
</div>
</template>
<script>
import _ from 'lodash'
import __ from '@/common/i18n'
import storage from '@/common/storage'
import {mapState, mapActions} from 'vuex'
import {formatTime} from '@/common/utils'

export default {
  data() {
    return {
      card: 0,
      toBeHide: 0,
      items: [],
    }
  },
  watch: {
    q: 'search',
  },
  computed: {
    ...mapState(['listColors', 'lists']),
    q() {
      return this.$route.query.q
    },
  },
  created() {
    if (this.q) this.search()
    else this.preloadLists()
  },
  activated() {
    if (this.q) this.search()
    else this.preloadLists()
    if (this.card === 0) this.slideCard()
  },
  deactivated() {
    this.card = 0
  },
  methods: {
    ...mapActions(['preloadLists']),
    slideCard() {
      if (this.card === 2) return
      this.toBeHide = this.card += 1
      setTimeout(this.slideCard, 200)
    },
    parseQuery() {
      const q = {str: []}
      if (!this.$route.query.q) return q
      const str = decodeURIComponent(this.$route.query.q)
      str.split(' ').filter(i => i).forEach(i => {
        if (~i.indexOf(':')) {
          const [k, v] = i.split(':')
          q[k] = v
        } else {
          q.str.push(i)
        }
      })
      return q
    },
    async search() {
      const {color, str} = this.parseQuery()
      const lists = this.lists
      const items = []
      lists.forEach((list, listIndex) => {
        const colorMatch = color == null || color === list.color
        const beMatch = [list.title || '', formatTime(list.time), list.color || '']
        const strMatch = str.every(i => beMatch.some(j => ~j.indexOf(i)))
        if (colorMatch && strMatch) {
          items.push({
            title: list.title || __('ui_untitled'),
            subtitle: formatTime(list.time),
            value: {listIndex},
            color: list.color || '',
          })
        }
        list.tabs.forEach((tab, tabIndex) => {
          const colorMatch = color == null || color === list.color
          const beMatch = [tab.title, tab.url]
          const strMatch = str.every(i => beMatch.some(j => ~j.indexOf(i)))
          if (colorMatch && strMatch) {
            items.push({
              title: tab.title,
              subtitle: tab.url,
              value: {listIndex, tabIndex},
              color: list.color || '',
            })
          }
        })
      })
      console.log(items)
      this.items = _.sortBy(items, 'title')
    }
  },
}
</script>

<style lang="scss" scoped>
.color-placeholder {
  display: inline-block;
  width: 78px;
  height: 78px;
  .color-btn {
    display: block;
    margin: 15px;
    width: 48px;
    height: 48px;
    border-radius: 24px !important;
    border: 2px solid rgba(0, 0, 0, 0.08) !important;
    &:hover {
      border: 2px solid rgba(0, 0, 0, 0.4) !important;
    }
  }
}
.slide-enter-active {
  transition: all ease-out .22s;
}
.slide-leave-active  {
  transition: all 0;
}
.slide-enter-to {
  opacity: 1;
}
.slide-enter {
  transform: translateY(100px);
  opacity: 0.3;
}
</style>
