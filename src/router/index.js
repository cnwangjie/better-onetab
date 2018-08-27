import Vue from 'vue'
import Router from 'vue-router'
import DetailList from '@/page/DetailList'
import Options from '@/page/Options'
import SyncInfo from '@/page/SyncInfo'
import About from '@/page/About'
import Main from '@/page/Main'
import Popup from '@/page/Popup'

Vue.use(Router)

const router = new Router({
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
          path: 'options/sync',
          component: SyncInfo,
          name: 'syncInfo',
        },
        {
          path: 'options',
          component: Options,
          name: 'options',
        },
        {
          path: 'about',
          component: About,
          name: 'about',
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

if (PRODUCTION) import(
  /* webpackChunkName: "tracker", webpackMode: "lazy" */
  '@/common/tracker'
).then(({tracker}) => {
  tracker()
  router.beforeEach((to, from, next) => {
    ga('set', 'page', to.name)
    ga('send', 'pageview')
    next()
  })
})

export default router
