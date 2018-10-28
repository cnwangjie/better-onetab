<template>
<v-toolbar app clipped-left :color="nightmode ? null : 'primary'" :flat="flat" v-scroll="onScroll">
  <v-toolbar-side-icon dark @click="switchDrawer"></v-toolbar-side-icon>
  <v-toolbar-title class="white--text">OneTab</v-toolbar-title>
  <v-spacer></v-spacer>
  <search-form></search-form>
  <v-spacer></v-spacer>

  <v-tooltip left>
    <v-btn slot="activator" icon dark :loading="syncing" :disabled="!hasToken">
      <v-icon :style="conflict ? {color: 'red'} : {}">cloud_upload</v-icon>
    </v-btn>
    <span>{{ tooltip }}<dynamic-time v-if="!tooltip" v-model="lastUpdated"></dynamic-time></span>
  </v-tooltip>
  <v-tooltip left>
    <v-btn slot="activator" icon dark @click="switchNightmode">
      <v-icon>{{ nightmode ? 'brightness_5' : 'brightness_4' }}</v-icon>
    </v-btn>
    <span>{{ __('ui_nightmode') }}</span>
  </v-tooltip>
</v-toolbar>
</template>
<script>
import _ from 'lodash'
import __ from '@/common/i18n'
import searchForm from './SearchForm'
import dynamicTime from '@/component/DynamicTime'
import {mapState, mapActions, mapMutations} from 'vuex'

export default {
  data() {
    return {
      flat: false,
      syncing: false,
    }
  },
  components: {
    searchForm,
    dynamicTime,
  },
  computed: {
    ...mapState(['opts', 'hasToken', 'conflict', 'nightmode']),
    tooltip() {
      return !this.hasToken ? __('ui_not_login') // eslint-disable-line
        : this.syncing ? __('ui_syncing')
        : this.conflict ? __('ui_conflict')
        : this.uploadError ? __('ui_upload_error')
        : isFinite(this.lastUpdated) ? null
        : __('ui_not_sync')
    }
  },
  created() {
    this.init()
  },
  methods: {
    __,
    ...mapActions(['switchNightmode', 'switchDrawer']),
    ...mapMutations(['setConflict']),
    init() {
      window.app = this
      chrome.runtime.onMessage.addListener(msg => {
        console.log(msg)
        if (msg.uploadImmediate || msg.forceDownload) {
          this.syncing = true
        } else if (msg.uploaded || msg.downloaded) {
          this.syncing = false
          const result = msg.uploaded || msg.downloaded
          if (!_.isEmpty(result.conflict)) this.setConflict(result.conflict)
          else if (!_.isEmpty(result.error)) this.uploadError = result.error // eslint-disable-line
          else this.lastUpdated = Date.now()
        }
      })
    },
    onScroll() {
      this.flat = (window.pageYOffset || document.documentElement.scrollTop) === 0
    },
  }
}
</script>
<style scoped>
.v-toolbar {
  transition-delay: 0;
  transition-duration: .25s;
  transition-property: box-shadow;
  transition-timing-function: ease;
}
</style>
