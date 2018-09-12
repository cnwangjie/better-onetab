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
            :value="alert.status"
            :color="alert.status"
            :icon="alert.status === 'success' ? 'check_circle' : 'warning'"
            outline
            transition="fade-transition"
          >
            {{ alert && alert.msg ? alert.msg : '' }}
          </v-alert>

          <v-list>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title>
                  {{ __('ui_boss') }}
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
                <v-btn
                  v-if="!bossinfo.googleName"
                  outline
                  color="success"
                  @click="auth('google')"
                  :loading="logging"
                >{{ __('ui_auth') }}</v-btn>
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
                <v-btn
                  v-if="!bossinfo.githubName"
                  outline
                  color="success"
                  @click="auth('github')"
                  :loading="logging"
                >{{ __('ui_auth') }}</v-btn>
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

          <v-divider></v-divider>

          <v-list>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title>
                  {{ __('ui_save_to_gdrive') }}
                </v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn
                  depressed small color="success" @click="saveToGdrive"
                  :loading="saving">
                  {{ __('ui_save_immediately') }}
                </v-btn>
              </v-list-tile-action>
            </v-list-tile>

            <!-- <v-list-tile>
              <v-list-tile-content>
                <v-layout wrap style="width:100%">
                  <v-flex xs8>
                    <v-subheader>
                      Timed upload
                    </v-subheader>
                  </v-flex>
                  <v-flex xs4>
                    <v-select
                      class="select-amend"
                      :items="uploadTimerItems"
                      v-model="uploadTimerSelected"
                      label=""
                      item-text=""
                      item-value="value"
                      @change=""
                    ></v-select>
                  </v-flex>
                </v-layout>
              </v-list-tile-content>
            </v-list-tile> -->
          </v-list>

        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</div>
</template>

<script>
import _ from 'lodash'
import __ from '@/common/i18n'
import {formatTime, one} from '@/common/utils'
import boss from '@/common/service/boss'
import gdrive from '@/common/service/gdrive'
import browser from 'webextension-polyfill'
import {mapState, mapActions, mapMutations} from 'vuex';

if (DEBUG) window.boss = boss

export default {
  data() {
    return {
      bossinfo: {},
      logging: false,
      alert: { status: '', msg: '' },
      uploadTimerItems: ['never', 'daily', 'hourly', 'onchange'],
      uploadTimerSelected: null,
      saving: false,
    }
  },
  created() {
    this.init()
  },
  computed: {
    ...mapState(['hasToken', 'conflict']),
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
    formatTime,
    ...mapMutations(['setToken']),
    ...mapActions(['checkToken', 'loadConflict']),
    async init() {
      await this.loadSyncInfo()
      browser.runtime.onMessage.addListener(async msg => {
        if (msg.uploaded) {
          await this.loadSyncInfo()
        }
      })
    },
    async loadSyncInfo() {
      await this.checkToken()
      if (this.hasToken) {
        const {sync_info} = await browser.storage.local.get(['sync_info'])
        if (sync_info && sync_info.uid) {
          this.bossinfo = sync_info
        } else {
          this.bossinfo = await boss.getInfo()
          await browser.storage.local.set({sync_info: this.bossinfo})
        }
        await this.loadConflict()
      }
    },
    async afterFirstAuth() {
      console.log('[info]: after finish auth')
      this.bossinfo = await boss.getInfo()
      await browser.storage.local.set({sync_info: this.bossinfo})
      await this.loadSyncInfo()
      const localInfo = await browser.storage.local.get(['listsUpdatedAt', 'optsUpdatedAt'])
      const {lists} = await browser.storage.local.get(['lists'])
      // if never uploaded but there are lists in the local making a conflict first
      if (_.isEmpty(localInfo) && !_.isEmpty(lists)) chrome.runtime.sendMessage({uploadImmediate: true})
      else chrome.runtime.sendMessage({forceDownload: true})
    },
    async resolveConflict(type, result) {
      chrome.runtime.sendMessage({resolveConflict: {type, result}})
    },
    async auth(auth) {
      if (this.logging) return
      this.logging = true
      try {
        await boss.getToken(auth)
        await this.afterFirstAuth()
        this.alert = { status: 'success', msg: 'success' }
      } catch (e) {
        console.error(e)
        this.alert = { status: 'error', msg: e.message }
      } finally {
        this.logging = false
      }
    },
    async deauth() {
      chrome.storage.local.remove(['boss_token', 'sync_info'])
      this.setToken(false)
      this.bossinfo = {}
    },
    saveToGdrive: one(async function () {
      this.saving = true
      try {
        await gdrive.saveCurrentTabLists()
        this.alert = { status: 'success', msg: 'success' }
      } catch (e) {
        console.error(e)
        this.alert = { status: 'error', msg: e.result.error.message }
        gdrive.clearToken()
      } finally {
        this.saving = false
      }
    }),
  }
}
</script>
