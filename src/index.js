import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Vuetify from 'vuetify'

Vue.config.productionTip = false
Vue.config.devtools = true
Vue.use(Vuetify)

const app = new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})

if (DEBUG) {
  window.app = app
  import('webextension-polyfill').then(browser => {
    window.browser = browser
  })
  import('@/common/service/gdrive').then(gt => {
    window.gt = gt
    window.gdrive = gt.gdrive
  })
}
