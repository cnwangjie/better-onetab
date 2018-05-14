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
                  <v-flex xs4>
                    <v-subheader>{{ option.desc }}</v-subheader>
                  </v-flex>
                  <v-flex xs4></v-flex>
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
    Changes saved!
  </v-snackbar>
</div>
</template>
<script>
import storage from '@/common/storage'
import options from '@/common/options'

export default {
  data() {
    return {
      optionsList: options.optionsList,
      options: {},
      snackbar: false,
    }
  },
  created() {
    this.init()
  },
  methods: {
    optionsChanged(key, value) {
      storage.setOptions(this.options)
    },
    async init() {
      this.options = await storage.getOptions()
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
