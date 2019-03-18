<template>
<v-card>
  <v-tabs
    color="cyan"
    dark
    grow
    slider-color="yellow"
  >
    <v-tab key="import">{{ __('ui_import') }}</v-tab>
    <v-tab key="export">{{ __('ui_export') }}</v-tab>
    <v-tab-item key="import">
      <v-card flat>
        <v-card-text>
          <v-btn :loading="processing" @click="imp(true)" :disabled="!importData">{{ __('ui_import_comp') }}</v-btn>
          <v-btn :loading="processing" @click="imp(false)" :disabled="!importData">{{ __('ui_import_json') }}</v-btn>
          <input ref="fileSelector" type="file" hidden @change="impFile"></input>
          <v-btn :loading="processing" @click="$refs.fileSelector.click()">
            {{ __('ui_import_from_file') }}
            <v-icon dark right>attach_file</v-icon>
          </v-btn>
          <v-textarea
            autofocus
            clearable
            auto-grow
            v-model="importData"
          ></v-textarea>
        </v-card-text>
      </v-card>
    </v-tab-item>
    <v-tab-item key="export">
      <v-card flat>
        <v-card-text>
          <v-btn @click="exp(true)">{{ __('ui_export_comp') }}</v-btn>
          <v-btn @click="exp(false)">{{ __('ui_export_json') }}</v-btn>
          <v-btn @click="copy" :disabled="!exportData">{{ __('ui_copy') }}</v-btn>
          <v-btn @click="save" :disabled="!exportType">{{ __('ui_save_as_file') }}</v-btn>
          <v-btn
            color="success" @click="saveToGdrive"
            :loading="saving"
          >
            {{ __('ui_save_to_gdrive') }}
            <v-icon drak right>fab fa-google-drive</v-icon>
          </v-btn>
          <v-textarea
            auto-grow
            v-model="exportData"
            readonly
          ></v-textarea>
        </v-card-text>
      </v-card>
    </v-tab-item>
  </v-tabs>


  <v-fab-transition>
    <v-btn v-if="scrollY > 100" color="pink" dark fab fixed bottom right @click="$vuetify.goTo(0)">
      <v-icon>keyboard_arrow_up</v-icon>
    </v-btn>
  </v-fab-transition>

</v-card>
</template>
<script>
import __ from '@/common/i18n'
import exchange from '@/common/exchange'
import {readFile} from '@/common/utils'
import gdrive from '@/common/service/gdrive'
import {mapMutations, mapActions, mapState} from 'vuex'
import {ADD_LIST} from '@/common/constants'
import logger from '@/common/logger'

export default {
  data() {
    return {
      exportData: '',
      importData: '',
      exportType: null,
      processing: false,
      file: null,
      saving: false,
    }
  },
  computed: {
    ...mapState(['scrollY']),
  },
  methods: {
    __,
    ...mapMutations([ADD_LIST]),
    ...mapActions(['showSnackbar']),
    async exp(comp) {
      if (this.processing) return this.showSnackbar(__('ui_main_processing'))
      this.processing = true
      try {
        this.exportData = await exchange.exportToText(comp)
        this.exportType = comp ? exchange.types.TEXT : exchange.types.JSON
        this.showSnackbar(__('ui_main_succeeded'))
        if (PRODUCTION) ga('send', 'event', 'IES', 'export', comp)
      } catch (e) {
        logger.error(e)
        this.showSnackbar(__('ui_main_error_occurred'))
        this.exportType = null
      } finally {
        this.processing = false
      }
    },
    async imp(comp) {
      if (this.processing) return this.showSnackbar(__('ui_main_processing'))
      this.processing = true
      try {
        const lists = await exchange.importFromText(comp, this.importData)
        // reverse for keeping the order
        lists.reverse().forEach(list => this[ADD_LIST]([list]))
        this.showSnackbar(__('ui_main_succeeded'))
        this.importData = ''
        this.$router.push('/app/list')
        if (PRODUCTION) ga('send', 'event', 'IES', 'import', comp)
      } catch (e) {
        logger.error(e)
        this.showSnackbar(__('ui_main_error_occurred'))
      } finally {
        this.processing = false
      }
    },
    async impFile(event) {
      const [file] = event.target.files
      // the biggest file size is 1MB & unrestricted file type
      if (file.size > (1 << 20)) return
      const text = await readFile(file)
      this.importData = text
    },
    async copy() {
      if (await this.$copyText(this.exportData)) this.showSnackbar(__('ui_copied'))
    },
    async save() {
      if (this.processing) return this.showSnackbar(__('ui_main_processing'))
      this.processing = true
      try {
        await exchange.exportToFile(this.exportData, this.exportType)
        this.showSnackbar(__('ui_main_succeeded'))
        if (PRODUCTION) ga('send', 'event', 'IES', 'download')
      } catch (e) {
        logger.error(e)
        this.showSnackbar(__('ui_main_error_occurred'))
      } finally {
        this.processing = false
      }
    },
    async saveToGdrive() {
      this.saving = true
      try {
        await gdrive.saveCurrentTabLists()
        this.showSnackbar(__('ui_main_succeeded'))
      } catch (e) {
        logger.error(e)
        this.showSnackbar(__('ui_main_error_occurred'))
        gdrive.clearToken()
      } finally {
        this.saving = false
      }
    },
  }
}
</script>
