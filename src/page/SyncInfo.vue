<template>
<div>
  <v-layout>
    <v-flex xs12 sm6 offset-sm3>
      <v-card>
        <v-card-title>
          <v-btn flat icon @click="$router.go(-1)">
            <v-icon>arrow_back</v-icon>
          </v-btn>
          <h2>sync setting</h2>
          <v-spacer></v-spacer>
        </v-card-title>
        <v-card-text>


          <v-alert
            :value="syncError"
            color="error"
            icon="warning"
            outline
          >
            Sync Error
          </v-alert>

          <v-list>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title>
                  Better-Onetab Sync Server (unlimited storage)
                </v-list-tile-title>
                <v-list-tile-sub-title>
                  {{ bossSubtitle }}
                </v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn v-if="hasToken" depressed small color="error" @click="deauth">Turn off</v-btn>
              </v-list-tile-action>
            </v-list-tile>

            <v-list-tile avatar>
              <v-list-tile-avatar>
                <v-icon>fab fa-google</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title>
                  Google
                </v-list-tile-title>
                <v-list-tile-sub-title>
                  {{ googleSubtitle }}
                </v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn v-if="!bossinfo.googleName" outline color="success" @click="auth('google')">{{ __('ui_auth') }}</v-btn>
              </v-list-tile-action>
            </v-list-tile>
            <v-divider></v-divider>
            <v-list-tile avatar>
              <v-list-tile-avatar>
                <v-icon>fab fa-github</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title>
                  Github
                </v-list-tile-title>
                <v-list-tile-sub-title>
                  {{ githubSubtitle }}
                </v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn v-if="!bossinfo.githubName" outline color="success" @click="auth('github')">{{ __('ui_auth') }}</v-btn>
              </v-list-tile-action>
            </v-list-tile>
          </v-list>


          <div v-if="conflict">
            <v-divider></v-divider>
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
                <li v-for="value, key in conflict.opts" :key="key">
                  {{ key }}: {{ value }}
                </li>
              </ul>
              <v-btn small @click="resolveConflict('opts', 'local')">{{  __('ui_sync_use_local') }}</v-btn>
              <v-btn small @click="resolveConflict('opts', 'remote')">{{ __('ui_sync_use_remote') }}</v-btn>
            </div>
          </div>

        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</div>
</template>

<script>
import __ from '@/common/i18n'
import {formatTime, one} from '@/common/utils'
import boss from '@/common/service/boss'
import browser from 'webextension-polyfill'

if (DEBUG) window.boss = boss

export default {
  data() {
    return {
      bossinfo: {},
      hasToken: null,
      conflict: null,
      logging: false,
      syncError: null,
    }
  },
  created() {
    this.init()
  },
  computed: {
    bossSubtitle() {
      if (this.hasToken) return __('ui_logged_uid') + ' ' + this.bossinfo.uid
      return __('ui_not_login')
    },
    googleSubtitle() {
      if (this.bossinfo.googleName) return __('ui_sync_authed_with') + ' ' + this.bossinfo.googleName
      return __('ui_unauth')
    },
    githubSubtitle() {
      if (this.bossinfo.githubName) return __('ui_sync_authed_with') + ' ' + this.bossinfo.githubName
      return __('ui_unauth')
    },
  },
  methods: {
    __,
    async init() {
      this.loadSyncInfo()
      browser.runtime.onMessage.addListener(msg => {
        if (msg.uploaded) {
          this.loadSyncInfo()
        }
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
    async afterFirstAuth() {
      this.bossinfo = await boss.getInfo()
      await browser.storage.local.set({sync_info: this.bossinfo})
      this.loadSyncInfo()
      chrome.runtime.sendMessage({forceDownload: true})
    },
    async resolveConflict(type, result) {
      chrome.runtime.sendMessage({resolveConflict: {type, result}})
    },
    auth: one(async function (auth) {
      this.logging = true
      try {
        await boss.getToken(auth)
        await this.afterFirstAuth()
      } catch (e) {
        console.error(e)
        this.syncError = e
      } finally {
        this.logging = false
      }
    }),
    async deauth() {
      chrome.storage.local.remove(['boss_token', 'sync_info'])
      this.hasToken = null
      this.bossinfo = {}
    },

  }
}
</script>
