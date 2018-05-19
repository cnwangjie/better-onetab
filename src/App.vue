<template>
<div id="app">
  <router-view></router-view>
</div>
</template>
<script>
import 'vuetify/dist/vuetify.min.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import './assets/css/fontawesome-all.min.css'

export default {
  name: 'app',
  created() {
    if (PRODUCTION) import(
      /* webpackChunkName: "tracker", webpackMode: "lazy" */
      '@/common/tracker'
    ).then(({tracker}) => {
      tracker()
      if (!this.$route.name) return
      ga('set', 'page', this.$route.name)
      ga('send', 'pageview')
    })
  },
}
</script>
<style lang="scss">
</style>

