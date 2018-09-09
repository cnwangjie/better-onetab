<template>
<v-app :dark="nightmode">
  <v-toolbar :color="nightmode ? null : 'primary'" :fixed="opts.fixedToolbar">
    <v-toolbar-title class="white--text">OneTab</v-toolbar-title>
    <v-spacer></v-spacer>

    <v-tooltip left>
      <v-btn slot="activator" icon dark :loading="syncing" @click="syncBtnClicked" :disabled="!hasToken">
        <v-icon :style="conflict ? {color: 'red'} : {}">cloud_upload</v-icon>
      </v-btn>
      <span>{{ tooltip }}<dynamic-time v-if="!tooltip" v-model="lastUpdated"></dynamic-time></span>
    </v-tooltip>
    <v-toolbar-items>
      <v-btn flat dark @click="nightmode = !nightmode">
        {{ __('ui_nightmode') }}
      </v-btn>
      <v-btn flat dark exact :to="'/app/'">
        {{ __('ui_tab_list') }}
      </v-btn>
      <v-menu offset-y>
        <v-btn slot="activator" flat dark>
          <v-icon>more_vert</v-icon>
        </v-btn>
        <v-list>
          <v-list-tile :to="'/app/options'">
            <v-list-tile-action>
              <v-icon>fas fa-cog</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              {{ __('ui_options') }}
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile :to="'/app/about'">
            <v-list-tile-action>
              <v-icon>fas fa-exclamation-circle</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              {{ __('ui_about') }}
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile @click="showIEP">
            <v-list-tile-action>
              <v-icon>fas fa-file-import</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              {{ __('ui_export_import') }}
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile @click="openShortcutPage">
            <v-list-tile-action>
              <v-icon>fas fa-keyboard</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              {{ __('ui_keyboard_shortcuts') }}
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile href="https://github.com/cnwangjie/better-onetab/issues/new/choose">
            <v-list-tile-action>
              <v-icon>fas fa-bug</v-icon>
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
      </v-menu>
    </v-toolbar-items>
  </v-toolbar>
  <v-content :style="opts.fixedToolbar ? {marginTop: '64px'} : null">
    <v-container>
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </v-container>
  </v-content>
  <v-footer>
    <v-spacer></v-spacer>
    <span>
      Made with <i class="fa fa-heart throb" style="color:#d43f57"></i> by <a style="color:black; text-decoration: none;" href="https://www.cnwangjie.com/" target="_blank">WangJie</a>
    </span>
    <v-spacer></v-spacer>
  </v-footer>
  <import-export-panel ref="IEP"></import-export-panel>
</v-app>
</template>
<script>
import _ from 'lodash'
import __ from '@/common/i18n'
import storage from '@/common/storage'
import boss from '@/common/service/boss'
import browser from 'webextension-polyfill'
import dynamicTime from '@/component/DynamicTime'
import importExportPanel from '@/component/ImportExportPanel'
import {mapState, mapActions, mapMutations} from 'vuex'

export default {
  data() {
    return {
      nightmode: false,
      syncing: false,
      lastUpdated: NaN,
      uploadError: null,
      fixedToolbar: false,
    }
  },
  components: {
    dynamicTime,
    importExportPanel,
  },
  computed: {
    ...mapState(['opts', 'hasToken', 'conflict']),
    tooltip() {
      return !this.hasToken ? __('ui_not_login')
        : this.syncing ? __('ui_syncing')
        : this.conflict ? __('ui_conflict')
        : this.uploadError ? __('ui_upload_error')
        : isFinite(this.lastUpdated) ? null
        : __('ui_not_sync')
    }
  },
  watch: {
    async nightmode(newValue) {
      const window = await browser.runtime.getBackgroundPage()
      window.nightmode = newValue
    },
  },
  created() {
    this.init()
  },
  methods: {
    __,
    ...mapActions(['loadOptions', 'checkToken', 'loadConflict']),
    ...mapMutations(['setConflict']),
    async init() {
      this.switchNightMode()
      this.checkToken()
      this.loadOptions()
      this.loadConflict()
      chrome.runtime.onMessage.addListener(async msg => {
        console.log(msg)
        if (msg.uploadImmediate || msg.forceDownload) {
          this.syncing = true
        } else if (msg.uploaded || msg.downloaded) {
          this.syncing = false
          const result = msg.uploaded || msg.downloaded
          if (!_.isEmpty(result.conflict)) this.setConflict(result.conflict)
          else if (!_.isEmpty(result.error)) this.uploadError = result.error
          else this.lastUpdated = Date.now()
        }
      })
    },
    async syncBtnClicked() {
      if (this.conflict) this.$router.push('/app/options/sync')
      else {
        browser.runtime.sendMessage({uploadImmediate: true})
        this.syncing = true
      }
    },
    async switchNightMode() {
      const window = await browser.runtime.getBackgroundPage()
      if ('nightmode' in window) this.nightmode = window.nightmode || false
    },
    openShortcutPage() {
      chrome.tabs.create({url: 'chrome://extensions/shortcuts'})
    },
    showIEP() {
      this.$refs.IEP.show = true
    },
  }
}
</script>
