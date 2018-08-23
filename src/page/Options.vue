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
          </v-card-title>

          <div v-if="conflict">
            <h2>There is a conflict when sync with server.</h2>
            <p>remote lists items</p>
            <p>remote options</p>
          </div>

          <v-card-actions v-if="conflict">
            <v-btn>keep local</v-btn>
            <v-btn>keep remote</v-btn>
            <v-btn>keep both</v-btn>
          </v-card-actions>
        </div>

        <div v-else>
          <v-card-title>
            <h2>{{ __('ui_use_boss') }}</h2>
          </v-card-title>

          <v-card-actions>
            <v-btn color="primary" large @click="auth">{{ __('ui_authorize') }}
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
    async auth() {
      this.bossinfo = await boss.getInfo()
      await browser.storage.local.set({sync_info: this.bossinfo})
      this.loadSyncInfo()
      chrome.runtime.sendMessage({sync: true})
    },
    async init() {
      this.loadOpts()
      this.loadSyncInfo()
      chrome.runtime.onMessage.addListener(msg => {
        if (msg.optionsChangeHandledStatus === 'success') {
          this.snackbar = true
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
