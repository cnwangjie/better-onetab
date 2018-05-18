import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Vuetify from 'vuetify'

Vue.config.productionTip = false
Vue.use(Vuetify)

const app = new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})