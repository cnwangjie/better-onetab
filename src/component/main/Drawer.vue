<template>
<v-navigation-drawer
  class="app-drawer"
  v-model="value"
  fixed
  clipped
  app
  floating
>
  <v-list>
    <v-list-tile :to="'/app/list'" exact>
      <v-list-tile-action>
        <v-icon>list</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        {{ __('ui_tab_list') }}
      </v-list-tile-content>
    </v-list-tile>
    <v-list-tile :to="'/app/list/pinned'" exact>
      <v-list-tile-action>
        <v-icon>done</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        {{ __('ui_pinned') }}
      </v-list-tile-content>
    </v-list-tile>
    <v-list-tile v-for="(lists, tag) in taggedList" :key="tag" :to="'/app/list/tag/' + tag">
      <v-list-tile-action>
        <v-icon>label</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        {{ tag }}
      </v-list-tile-content>
    </v-list-tile>
    <v-divider class="my-1"></v-divider>
    <v-list-tile :to="'/app/options'">
      <v-list-tile-action>
        <v-icon>settings</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        {{ __('ui_options') }}
      </v-list-tile-content>
    </v-list-tile>
    <v-list-tile :to="'/app/about'">
      <v-list-tile-action>
        <v-icon>info</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        {{ __('ui_about') }}
      </v-list-tile-content>
    </v-list-tile>
    <v-list-tile :to="'/app/import-export'">
      <v-list-tile-action>
        <v-icon>import_export</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        {{ __('ui_export_import') }}
      </v-list-tile-content>
    </v-list-tile>
    <v-list-tile @click="openShortcutPage" :disabled="isFirefox">
      <v-list-tile-action>
        <v-icon>keyboard</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        {{ __('ui_keyboard_shortcuts') }}
      </v-list-tile-content>
      <v-list-tile-action>
        <v-icon small>open_in_new</v-icon>
      </v-list-tile-action>
    </v-list-tile>
    <v-list-tile href="https://github.com/cnwangjie/better-onetab/issues/new/choose">
      <v-list-tile-action>
        <v-icon>feedback</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        {{ __('ui_create_issue') }}
      </v-list-tile-content>
    </v-list-tile>
    <v-list-tile href="https://gitter.im/better-onetab/Lobby?utm_source=app">
      <v-list-tile-action>
        <v-icon>fab fa-gitter</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        Gitter
      </v-list-tile-content>
    </v-list-tile>
    <v-list-tile href="https://github.com/cnwangjie/better-onetab">
      <v-list-tile-action>
        <v-icon>fab fa-github</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        {{ __('ui_github') }}
      </v-list-tile-content>
    </v-list-tile>
  </v-list>
</v-navigation-drawer>
</template>
<script>
import __ from '@/common/i18n'
import browser from 'webextension-polyfill'
import { mapActions, mapGetters } from 'vuex'

export default {
  data() {
    return {
      isFirefox: false,
    }
  },
  computed: {
    ...mapGetters(['taggedList']),
  },
  props: {
    value: Boolean,
  },
  created() {
    this.init()
  },
  methods: {
    ...mapActions(['preloadLists']),
    __,
    async init() {
      try {
        const {name} = await browser.runtime.getBrowserInfo()
        if (name === 'Firefox') this.isFirefox = true
      } catch (e) {
        // ignored
      }
      this.preloadLists()
    },
    async openShortcutPage() {
      await browser.tabs.create({url: 'chrome://extensions/shortcuts'})
    },
  }
}
</script>
<style scoped>
.app-drawer {
  background: inherit !important;
}
</style>
