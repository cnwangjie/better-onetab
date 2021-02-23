<template>
<div>
  <v-layout>
    <v-flex xs12 sm6 offset-sm3>
      <v-card>
        <v-card-title>
          <v-btn flat icon @click="$router.go(-1)">
            <v-icon>arrow_back</v-icon>
          </v-btn>
          <h2>{{ __('ui_sync_setting') }}</h2>
          <v-spacer></v-spacer>
        </v-card-title>
        <v-card-text>

          <v-list>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title :style="{ height: '30px' }">
                  {{ __('ui_boss') }}
                  <v-tooltip top>
                    <v-chip slot="activator" outline color="red" small :style="{ margin: 0 }">BETA</v-chip>
                    <span>{{ __('ui_beta_warn') }}</span>
                  </v-tooltip>
                </v-list-tile-title>
                <v-list-tile-sub-title>
                  {{ bossSubtitle }}
                </v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn v-if="hasToken" depressed small color="error" @click="turnOff">{{ __('ui_turn_off') }}</v-btn>
              </v-list-tile-action>
            </v-list-tile>
          </v-list>

          <v-btn v-if="hasToken" block color="success" :href="apiUrl + '/info'" target="_blank">
            {{ __('ui_manage_account') }}
          </v-btn>

          <v-btn v-if="!hasToken" block color="success" :href="apiUrl + '/login'" target="_blank">
            {{ __('ui_login') }}
          </v-btn>

        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</div>
</template>

<script>
import __ from '@/common/i18n'
import {SYNC_SERVICE_URL} from '@/common/constants'
import {formatTime} from '@/common/utils'
import boss from '@/common/service/boss'
import browser from 'webextension-polyfill'
import {mapState, mapActions} from 'vuex'

export default {
  data() {
    return {
      uid: '',
      apiUrl: SYNC_SERVICE_URL,
    }
  },
  created() {
    this.init()
  },
  computed: {
    ...mapState(['hasToken']),
    bossSubtitle() {
      if (this.uid) return __('ui_logged_uid') + ' ' + this.uid
      return __('ui_not_login')
    },
  },
  methods: {
    __,
    formatTime,
    ...mapActions(['checkToken']),
    async loadUID() {
      await this.checkToken()
      if (!this.hasToken) return
      const {uid} = await boss.getInfo()
      this.uid = uid
    },
    init() {
      this.loadUID()
      browser.runtime.onMessage.addListener(({logged}) => {
        this.uid = logged.uid
      })
    },
    async turnOff() {
      this.uid = ''
      await boss.removeToken()
      await this.checkToken()
    }
  }
}
</script>
