<template>
<div>
  <v-layout>
    <v-flex xs12 sm6 offset-sm3>
      <v-subheader>Options</v-subheader>
      <v-card>
        <v-list>
          <template v-for="(option, optionIndex) in optionsList">
            <v-list-tile>
              <v-list-tile-content>
                <v-layout wrap style="width:100%">
                  <v-flex xs8>
                    <v-subheader>
                      {{ option.desc }}
                      <strong v-if="option.name === 'syncList' && quotaExceeded" :style="{color: 'red', paddingLeft: '8px'}">quota exceeded!</strong>
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

export default {
  data() {
    return {
      optionsList: options.optionsList,
      options: {},
      snackbar: false,
      quotaExceeded: false,
    }
  },
  created() {
    this.init()
  },
  methods: {
    __,
    async optionsChanged(key, value) {
      console.log(1)
      console.log(key, value)
      // when type of option is string options can not be set correctly after first storage.setOptions() called
      await storage.setOptions(this.options)
      await storage.setOptions(this.options)
      console.log(2)
      chrome.runtime.sendMessage({optionsChanged: {[key]: value}})
    },
    async init() {
      const opts = await storage.getOptions()
      Object.keys(opts).map(key => {
        this.$set(this.options, key, opts[key])
      })
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
