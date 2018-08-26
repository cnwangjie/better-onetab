<template>
<v-app :dark="nightmode">
  <v-toolbar :color="nightmode ? null : 'primary'">
    <v-toolbar-title class="white--text">OneTab</v-toolbar-title>
    <v-spacer></v-spacer>

    <v-tooltip left>
      <v-btn slot="activator" icon dark :loading="syncing" @click="syncBtnClicked">
        <v-icon :style="conflict ? {color: 'red'} : {}">cloud_upload</v-icon>
      </v-btn>
      <span>{{ tooltip }}<dynamic-time v-if="!tooltip" v-model="lastUpdated"></dynamic-time></span>
    </v-tooltip>
    <v-toolbar-items class="hidden-sm-and-down">
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
            </v-list-tile-action>
            <v-list-tile-content>
              {{ __('ui_about') }}
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile @click="dialog = true">
            <v-list-tile-action>
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
              <v-icon>fas fa-exclamation-circle</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              {{ __('ui_create_issue') }}
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
  <v-content>
    <v-container>
      <router-view></router-view>
    </v-container>
  </v-content>
  <v-footer>
    <v-spacer></v-spacer>
    <span>
      Made with <i class="fa fa-heart throb" style="color:#d43f57"></i> by <a style="color:black; text-decoration: none;" href="https://www.cnwangjie.com/" target="_blank">WangJie</a>
    </span>
    <v-spacer></v-spacer>
  </v-footer>
  <v-dialog v-model="dialog" max-width="700px">
    <v-card>

        <v-tabs
          color="cyan"
          dark
          grow
          slider-color="yellow"
        >
          <v-tab key="export">{{ __('ui_export') }}</v-tab>
          <v-tab key="import">{{ __('ui_import') }}</v-tab>
          <v-tab-item key="export">
            <v-card flat>
              <v-card-text>
                <v-text-field
                  multi-line
                  autofocus
                  auto-grow
                  v-model="exportData"
                ></v-text-field>
                <v-btn @click="exp(true)">{{ __('ui_export_comp') }}</v-btn>
                <v-btn @click="exp(false)">{{ __('ui_export_json') }}</v-btn>
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item key="import">
            <v-card flat>
              <v-card-text>
                <v-text-field
                  multi-line
                  v-model="importData"
                ></v-text-field>
                <v-btn @click="imp(true)">{{ __('ui_import_comp') }}</v-btn>
                <v-btn @click="imp(false)">{{ __('ui_import_json') }}</v-btn>
              </v-card-text>
            </v-card>
          </v-tab-item>
        </v-tabs>

    </v-card>
  </v-dialog>

  <v-snackbar
    :timeout="2000"
    bottom
    v-model="snackbar"
  >
    {{ snackbarMsg }}
  </v-snackbar>
</v-app>
</template>
<script>
import _ from 'lodash'
import __ from '@/common/i18n'
import list from '@/common/list'
import storage from '@/common/storage'
import browser from 'webextension-polyfill'
import dynamicTime from '@/component/DynamicTime'

if (DEBUG) window.browser = browser

import gdrive from '@/common/service/gdrive'
import * as gt from '@/common/service/gdrive'
window.gdrive = gdrive
window.gt = gt

export default {
  data() {
    return {
      dialog: false,
      exportData: '',
      importData: '',
      snackbar: false,
      snackbarMsg: '',
      processing: false,
      nightmode: false,
      syncing: false,
      lastUpdated: NaN,
      conflict: false,
    }
  },
  components: {
    dynamicTime,
  },
  computed: {
    tooltip() {
      return this.syncing ? __('ui_syncing')
        : this.conflict ? __('ui_conflict')
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
    async init() {
      chrome.runtime.onMessage.addListener(async msg => {
        console.log(msg)
        if (msg.uploadImmediate) {
          this.syncing = true
        } else if (msg.uploaded) {
          this.syncing = false
          this.lastUpdated = Date.now()
          if (!_.isEmpty(msg.uploaded.conflict)) this.conflict = true
        }
      })
      this.switchNightMode()
    },
    async syncBtnClicked() {
      /**
       * sync btn:
       * click: normally manually upload; if there is conflict will go to options page
       * tooltip: normally display update time and update status if conflict display 'exist conflict'
       * icon: normally display upload icon or loading icon if conflict display red icon
       */
      if (this.conflict) this.$router.go('/app/options')
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
    async exp(comp) {
      if (this.processing) {
        this.snackbarMsg = __('ui_main_processing')
        this.snackbar = true
      }
      this.processing = true
      try {
        const lists = await storage.getLists()
        if (comp) {
          this.exportData = lists.map(list => {
            return list.tabs.map(tab => {
              return tab.url + ' | ' + tab.title
            }).join('\n')
          }).join('\n\n')
        } else {
          this.exportData = JSON.stringify(lists.map(i => _.pick(i, ['tabs', 'title', 'time'])))
        }
      } catch (e) {
        this.snackbarMsg = __('ui_main_error_occured')
        this.snackbar = true
      } finally {
        this.snackbarMsg = __('ui_main_successed')
        this.snackbar = true
        this.processing = false
      }
    },
    async imp(comp) {
      if (this.processing) {
        this.snackbarMsg = __('ui_main_processing')
        this.snackbar = true
      }
      this.processing = true
      try {
        let lists
        if (comp) {
          lists = this.importData.split('\n\n')
            .filter(i => i).map(i => {
              return i.split('\n')
                .filter(i => i)
                .map(j => j.split('|').map(k => k.trim()))
                .map(j => ({ url: j[0], title: j[1] }))
            }).map(i => {
              return list.createNewTabList({tabs: i})
            })
        } else {
          lists = JSON.parse(this.importData).map(i => list.createNewTabList(i))
        }
        await storage.setLists((await storage.getLists()).concat(lists))
      } catch (e) {
        this.snackbarMsg = __('ui_main_error_occured')
        this.snackbar = true
      } finally {
        this.snackbarMsg = __('ui_main_successed')
        this.snackbar = true
        this.processing = false
      }
    }
  }
}
</script>
