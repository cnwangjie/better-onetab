<template>
<div>
  <v-layout>
    <v-flex xs12 sm6 offset-sm3>
      <div v-for="(optionsList, cate) in optionsLists" :key="cate">

        <v-subheader>{{ __('ui_options_' + cate) }}</v-subheader>
        <v-card>
          <v-list>
            <template v-for="(option, optionIndex) in optionsList">
              <v-list-tile :key="optionIndex" class="free-height">
                <v-list-tile-content>
                  <v-layout wrap row align-center style="width:100%">
                    <v-flex xs8>
                      <v-subheader style="height: 100%; padding:10px 16px;">
                        {{ option.desc }}
                        <v-tooltip top v-if="isNew(option)">
                          <v-chip slot="activator" outline color="red" small>NEW</v-chip>
                          <span>{{ __('ui_new_warn') }}</span>
                        </v-tooltip>
                      </v-subheader>
                    </v-flex>
                    <v-flex xs4 class="text-xs-right" align-center>
                      <v-select
                        dense
                        class="select-amend"
                        v-if="option.type === String"
                        :items="option.items"
                        :value="opts[option.name]"
                        label=""
                        item-text="label"
                        item-value="value"
                        @change="optionsChanged(option.name, $event)"
                        :disabled="option.deps && !opts[option.deps]"
                      ></v-select>
                      <v-switch
                        class="d-inline-flex"
                        color="primary"
                        v-if="option.type === Boolean"
                        v-model="opts[option.name]"
                        @change="optionsChanged(option.name, $event)"
                        :disabled="option.deps && !opts[option.deps]"
                      ></v-switch>
                    </v-flex>
                  </v-layout>
                </v-list-tile-content>
              </v-list-tile>
              <v-divider v-if="optionIndex !== optionsList.length - 1" :key="optionIndex"></v-divider>
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
                Sync
                <v-tooltip top>
                  <v-chip slot="activator" outline color="red" small>BETA</v-chip>
                  <span>{{ __('ui_beta_warn') }}</span>
                </v-tooltip>
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
import {mapState, mapMutations} from 'vuex'

const currentVersion = browser.runtime.getManifest().version

export default {
  data() {
    return {
      optionsLists: _.groupBy(options.optionsList, 'cate'),
      snackbar: false,
    }
  },
  computed: {
    ...mapState(['opts']),
  },
  created() {
    this.init()
  },
  methods: {
    __,
    formatTime,
    ...mapMutations(['setOption']),
    isNew(option) {
      return option.new && currentVersion.startsWith(option.new)
    },
    emitChanges: _.debounce(async function emitChanges(key, value) {
      console.log(1)
      console.log(key, value)
      // when type of option is string options can not be set correctly after first storage.setOptions() called
      await storage.setOptions(this.opts) // eslint-disable-line
      await storage.setOptions(this.opts) // eslint-disable-line
      console.log(2)
      chrome.runtime.sendMessage({optionsChanged: {[key]: value}})
    }, 100),
    optionsChanged(key, value) {
      this.setOption({[key]: value})
      this.emitChanges(key, value)
    },
    init() {
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

.free-height > .v-list__tile {
  height: initial;
  min-height: 48px;
  padding: 0 4px;
}
</style>
