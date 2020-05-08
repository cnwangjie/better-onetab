<template>
<div>
  <v-layout>
    <v-flex xs12 sm6 offset-sm3>
      <v-card>
        <v-list>

          <v-list-tile avatar>
            <v-list-tile-avatar tile>
              <img src="~@/assets/icons/icon_128.png">
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title>Better-onetab</v-list-tile-title>
              <v-list-tile-sub-title>
                <span>Version: {{ version }}</span>
                <strong v-if="!!update" :style="{ color: 'green' }">v{{ update }} Has Available!</strong>
                <span v-else>(Already the latest version)</span>
              </v-list-tile-sub-title>

            </v-list-tile-content>


            <v-list-tile-action>
              <v-btn v-if="!!update" color="success" v-on:click="reload">Update</v-btn>
            </v-list-tile-action>
          </v-list-tile>

        </v-list>
      </v-card>
      <v-subheader>Change Logs</v-subheader>
      <v-btn flat block href="https://github.com/cnwangjie/better-onetab/blob/master/CHANGELOG.md">Click to view the whole change logs</v-btn>
    </v-flex>
  </v-layout>
</div>
</template>
<script>
import __ from '@/common/i18n'

export default {
  data() {
    return {
      version: '',
      update: '',
    }
  },
  created() {
    this.init()
  },
  methods: {
    __,
    init() {
      const manifest = chrome.runtime.getManifest()
      this.version = manifest.version
      chrome.runtime.getBackgroundPage(background => {
        this.update = background.update || ''
      })
    },
    reload() {
      chrome.runtime.reload()
    },
  }
}
</script>
<style lang="scss">
</style>
