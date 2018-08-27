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
        <v-list>
          <v-list-tile>
            <v-list-tile-content>
              <v-subheader>
                Sync <v-chip outline color="red" small>BETA</v-chip>
              </v-subheader>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-btn icon ripple :to="'/app/options/sync'">
                <v-icon color="grey lighten-1">arrow_forward</v-icon>
              </v-btn>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
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

export default {
  data() {
    return {
      optionsLists: _.groupBy(options.optionsList, 'cate'),
      options: {},
      snackbar: false,
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
    async init() {
      this.loadOpts()
      chrome.runtime.onMessage.addListener(msg => {
        if (msg.optionsChangeHandledStatus === 'success') {
          this.snackbar = true
        }
      })
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
