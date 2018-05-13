import Vue from 'vue'
import Router from 'vue-router'
import DetailList from '@/page/DetailList'
import Options from '@/page/Options'
import Main from '@/page/Main'
import Popup from '@/page/Popup'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/popup',
      component: Popup,
      name: 'popup',
    },
    {
      path: '/app',
      component: Main,
      children: [
        {
          path: 'options',
          component: Options,
          name: 'options',
        },
        {
          path: '*',
          component: DetailList,
          name: 'detailList',
        },
      ],
    },
  ]
})