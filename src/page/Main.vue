<template>
<v-app :dark="nightmode" :class="{'no-transition': opts.disableTransition}">
  <drawer :value="drawer"></drawer>
  <toolbar></toolbar>
  <v-content>
    <v-container>
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </v-container>
  </v-content>
  <v-footer>
    <v-spacer></v-spacer>
    <span>
      Made with <i class="fa fa-heart throb" style="color:#d43f57"></i> by <a style="color:black; text-decoration: none;" href="https://www.cnwangjie.com/" target="_blank">WangJie</a>
    </span>
    <v-spacer></v-spacer>
  </v-footer>
  <snackbar></snackbar>
</v-app>
</template>
<script>
import __ from '@/common/i18n'

import drawer from '@/component/main/Drawer'
import toolbar from '@/component/main/Toolbar'
import snackbar from '@/component/main/Snackbar'

import {mapState, mapActions} from 'vuex'

export default {
  data() {
    return {
      syncing: false,
      lastUpdated: NaN,
      uploadError: null,
    }
  },
  components: {
    drawer,
    toolbar,
    snackbar,
  },
  computed: {
    ...mapState(['drawer', 'nightmode', 'opts']),
  },
  created() {
    this.init()
  },
  methods: {
    __,
    ...mapActions(['loadOptions', 'checkToken', 'loadNightmode', 'loadDrawer', 'switchDrawer']),
    init() {
      this.loadNightmode()
      this.checkToken()
      this.loadDrawer()
      this.loadOptions()
    },
  }
}
</script>
<style>
.no-transition * {
  transition: none !important;
}
</style>
