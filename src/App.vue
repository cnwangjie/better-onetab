<template>
<div id="app">
  <router-view></router-view>
</div>
</template>
<script>
import 'vuetify/dist/vuetify.min.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import fontawesome from '@fortawesome/fontawesome'
import solid from '@fortawesome/fontawesome-free-solid'
import brands from '@fortawesome/fontawesome-free-brands'
fontawesome.library.add(solid, brands)
export default {
  name: 'app',
}
</script>
<style lang="scss">
</style>

