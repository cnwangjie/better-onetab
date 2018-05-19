<template>
<v-app>
  <v-toolbar
    color="primary"
  >
    <v-toolbar-title class="white--text">OneTab</v-toolbar-title>
    <v-spacer></v-spacer>

    <v-toolbar-items class="hidden-sm-and-down">
      <v-btn flat dark @click="dialog = true">
        {{ __('ui_export_import') }}
      </v-btn>
      <v-btn flat dark exact :to="'/app/'">
        {{ __('ui_tab_list') }}
      </v-btn>
      <v-btn flat dark exact :to="'/app/options'">
        <v-icon dark>fas fa-cog</v-icon>
      </v-btn>
      <v-btn flat dark href="https://github.com/cnwangjie/better-onetab">
        <v-icon dark>fab fa-github</v-icon>
      </v-btn>
    </v-toolbar-items>
  </v-toolbar>
  <v-content>
    <v-container>
      <router-view></router-view>
    </v-container>
  </v-content>
  <v-dialog v-model="dialog" max-width="700px">
    <v-card>

        <v-tabs
          color="cyan"
          dark
          grow
          slider-color="yellow"
        >
          <v-tab key="export">{{ __('ui_export') }}</v-tab>
          <v-tab key="import">{{ __('ui_import') }}</v-tab>
          <v-tab-item key="export">
            <v-card flat>
              <v-card-text>
                <v-text-field
                  multi-line
                  v-model="exportData"
                ></v-text-field>
                <v-btn @click="exp(true)">{{ __('ui_export_comp') }}</v-btn>
                <v-btn @click="exp(false)">{{ __('ui_export_json') }}</v-btn>
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item key="import">
            <v-card flat>
              <v-card-text>
                <v-text-field
                  multi-line
                  v-model="importData"
                ></v-text-field>
                <v-btn @click="imp(true)">{{ __('ui_import_comp') }}</v-btn>
                <v-btn @click="imp(false)">{{ __('ui_import_json') }}</v-btn>
              </v-card-text>
            </v-card>
          </v-tab-item>
        </v-tabs>

    </v-card>
  </v-dialog>
</v-app>
</template>
<script>
import _ from 'lodash'
import __ from '@/common/i18n'
import list from '@/common/list'
import storage from '@/common/storage'
export default {
  data() {
    return {
      dialog: false,
      exportData: '',
      importData: '',
    }
  },
  methods: {
    __,
    async exp(comp) {
      const lists = await storage.getLists()
      if (comp) {
        this.exportData = lists.map(list => {
          return list.tabs.map(tab => {
            return tab.url + ' | ' + tab.title
          }).join('\n')
        }).join('\n\n')
      } else {
        this.exportData = JSON.stringify(lists.map(i => _.pick(i, ['tabs', 'title', 'time'])))
      }
    },
    async imp(comp) {
      let lists
      if (comp) {
        lists = this.importData.split('\n\n')
          .filter(i => i).map(i => {
            return i.split('\n')
              .filter(i => i)
              .map(j => j.split('|').map(k => k.trim()))
              .map(j => ({ url: j[0], title: j[1] }))
          }).map(i => {
            return list.createNewTabList({tabs: i})
          })
      } else {
        lists = JSON.parse(this.importData).map(i => list.createNewTabList(i))
      }
      return storage.setLists((await storage.getLists()).concat(lists))
    }
  }
}
</script>
