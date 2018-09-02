<template>
<div>

  <v-dialog v-model="show" max-width="700px">
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
                  autofocus
                  auto-grow
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

  <v-snackbar
    :timeout="2000"
    bottom
    v-model="snackbar"
  >
    {{ snackbarMsg }}
  </v-snackbar>
</div>
</template>
<script>
import _ from 'lodash'
import __ from '@/common/i18n'
import list from '@/common/list'
import storage from '@/common/storage'

export default {
  data() {
    return {
      show: false,
      exportData: '',
      importData: '',
      snackbar: false,
      snackbarMsg: '',
      processing: false,
    }
  },
  methods: {
    __,
    async exp(comp) {
      if (this.processing) {
        this.snackbarMsg = __('ui_main_processing')
        this.snackbar = true
      }
      this.processing = true
      try {
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
        this.snackbarMsg = __('ui_main_successed')
      } catch (e) {
        console.error(e)
        this.snackbarMsg = __('ui_main_error_occured')
      } finally {
        this.snackbar = true
        this.processing = false
      }
    },
    async imp(comp) {
      if (this.processing) {
        this.snackbarMsg = __('ui_main_processing')
        this.snackbar = true
      }
      this.processing = true
      try {
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
        const currentList = await storage.getLists()
        await storage.setLists(_.concat(lists, currentList))
        this.snackbarMsg = __('ui_main_successed')
        this.show = false
      } catch (e) {
        console.error(e)
        this.snackbarMsg = __('ui_main_error_occured')
      } finally {
        this.snackbar = true
        this.processing = false
      }
    },
  }
}
</script>
