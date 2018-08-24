<template>
<div>
  <v-layout>
    <v-flex xs12 sm6 offset-sm3>
      <div v-for="(optionsList, cate) in optionsLists" :key="cate">

        <v-subheader>{{ __('ui_options_' + cate) }}</v-subheader>
        <v-card>
          <v-list>
            <template v-for="(option, optionIndex) in optionsList">
              <v-list-tile>
                <v-list-tile-content>
                  <v-layout wrap style="width:100%">
                    <v-flex xs8>
                      <v-subheader>
                        {{ option.desc }}
                      </v-subheader>
                    </v-flex>
                    <v-flex xs4>
                      <v-select
                        class="select-amend"
                        v-if="option.type === String"
                        :items="option.items"
                        v-model="options[option.name]"
                        label=""
                        item-text="label"
                        item-value="value"
                        @change="optionsChanged(option.name, $event)"
                      ></v-select>
                      <v-switch
                        class="switch-amend"
                        v-if="option.type === Boolean"
                        v-model="options[option.name]"
                        @change="optionsChanged(option.name, $event)"
                      ></v-switch>
                    </v-flex>
                  </v-layout>
                </v-list-tile-content>
              </v-list-tile>
              <v-divider v-if="optionIndex !== optionsList.length - 1"></v-divider>
            </template>
          </v-list>
        </v-card>
        <!-- loop render end -->
      </div>

      <v-subheader>{{ __('ui_options_sync') }}</v-subheader>
      <v-card>
        <div v-if="hasToken">
          <v-card-title>
            <h2>{{ __('ui_logged_uid') }}{{ bossinfo.uid }}</h2>
            <v-btn align="right" small color="error">Deauthorize</v-btn>
          </v-card-title>

          <v-divider></v-divider>
          <v-card-text v-if="conflict">
            <div>
              <h2>{{ __('ui_sync_exists_conflict_header') }}</h2>
              <div v-if="conflict.lists">
                <h3 class="warning--text">{{ __('ui_sync_lists_failed') }}</h3>
                <h3><span class="grey--text">{{ __('ui_sync_remote_time') }}:</span> {{ formatTime(conflict.lists.remote.time) }}</h3>
                <h3><span class="grey--text">{{ __('ui_sync_local_time') }}:</span> {{ formatTime(conflict.lists.local.time) }}</h3>
                <h3>{{ __('ui_sync_lists_item') }}</h3>
                <ul>
                  <li v-for="list, index in conflict.lists.remote.lists" :key="index">
                    {{ list.title || '(untitled list)' }}: {{ list.tabs.length }} tabs
                  </li>
                </ul>
                <v-btn small @click="resolveConflict('lists', 'local')">{{ __('ui_sync_keep_local') }}</v-btn>
                <v-btn small @click="resolveConflict('lists', 'remote')">{{ __('ui_sync_keep_remote') }}</v-btn>
                <v-btn small @click="resolveConflict('lists', 'both')">{{ __('ui_sync_keep_both') }}</v-btn>
              </div>
              <div v-if="conflict.opts">
                <h3 class="warning--text">{{ __('ui_sync_opts_failed') }}</h3>
                <h3><span class="grey--text">{{ __('ui_sync_remote_time') }}:</span> {{ formatTime(conflict.opts.remote.time) }}</h3>
                <h3><span class="grey--text">{{ __('ui_sync_local_time') }}:</span> {{ formatTime(conflict.opts.local.time) }}</h3>
                <h3>{{ __('ui_opts_diff') }}</h3>
                <ul>
                  <li v-for="value, key in conflict.opts" v-if="(key in options) && options[key] !== value" :key="key">
                    {{ key }}: {{ value }}
                  </li>
                </ul>
                <v-btn small @click="resolveConflict('opts', 'local')">{{  __('ui_sync_use_local') }}</v-btn>
                <v-btn small @click="resolveConflict('opts', 'remote')">{{ __('ui_sync_use_remote') }}</v-btn>
              </div>
            </div>
          </v-card-text>
        </div>

        <div v-else>
          <v-card-title>
            <h2>{{ __('ui_use_boss') }}</h2>
          </v-card-title>

          <v-card-actions>
            <v-btn color="primary" large @click="authWithGoogle">{{ __('ui_auth_with_google') }}
              <v-icon dark right>fab fa-google</v-icon>
            </v-btn>
          </v-card-actions>
        </div>
      </v-card>
    </v-flex>
  </v-layout>
  <v-snackbar
    :timeout="2000"
    bottom
    v-model="snackbar"
  >
    {{ __('ui_opt_changes_saved') }}
  </v-snackbar>
</div>
</template>
<script>
import storage from '@/common/storage'
import options from '@/common/options'
import __ from '@/common/i18n'
import _ from 'lodash'
import browser from 'webextension-polyfill'
import {formatTime} from '@/common/utils'
import boss from '@/common/service/boss'

if (DEBUG) window.boss = boss

export default {
  data() {
    return {
      optionsLists: _.groupBy(options.optionsList, 'cate'),
      options: {},
      snackbar: false,
      quotaExceeded: false,
      bossinfo: {},
      hasToken: null,
      conflict: null,
    }
  },
  created() {
    this.init()
  },
  methods: {
    __,
    formatTime,
    optionsChanged: _.debounce(async function (key, value) {
      console.log(1)
      console.log(key, value)
      // when type of option is string options can not be set correctly after first storage.setOptions() called
      await storage.setOptions(this.options)
      await storage.setOptions(this.options)
      console.log(2)
      chrome.runtime.sendMessage({optionsChanged: {[key]: value}})
    }, 100),
    async loadOpts() {
      const opts = await storage.getOptions()
      Object.keys(opts).map(key => {
        this.$set(this.options, key, opts[key])
      })
    },
    async loadSyncInfo() {
      this.hasToken = await boss.hasToken()
      if (this.hasToken) {
        const {sync_info, conflict} = await browser.storage.local.get(['sync_info', 'conflict'])
        if (sync_info && sync_info.uid) {
          this.bossinfo = sync_info
        } else {
          this.bossinfo = await boss.getInfo()
          await browser.storage.local.set({sync_info: this.bossinfo})
        }
        this.conflict = _.isEmpty(conflict) ? null : conflict
      }
    },
    async authWithGoogle() {
      await boss.getToken('google')
      return this.afterFirstAuth()
    },
    async authWithGithub() {
      await boss.getToken('github')
      return this.afterFirstAuth()
    },
    async afterFirstAuth() {
      this.bossinfo = await boss.getInfo()
      await browser.storage.local.set({sync_info: this.bossinfo})
      this.loadSyncInfo()
      chrome.runtime.sendMessage({sync: true})
    },
    async resolveConflict(type, result) {
      chrome.runtime.sendMessage({resolveConflict: {type, result}})
    },
    async init() {
      this.loadOpts()
      this.loadSyncInfo()
      chrome.runtime.onMessage.addListener(msg => {
        if (msg.optionsChangeHandledStatus === 'success') {
          this.snackbar = true
        }
        if (msg.uploaded) {
          this.loadSyncInfo()
        }
      })
      this.quotaExceeded = storage.isQuotaExceeded()
    }
  }
}
</script>
<style lang="scss">
.select-amend {
  padding: 4px 0 0;
}
.switch-amend {
  height: 100%;
  div {
    height: 100%;
  }
}
</style>
