<template>
<div>

<v-menu
  :value="value"
  :position-x="x"
  :position-y="y"
  min-width="200"
  absolute
  offset-y
>
  <v-list dense>
    <!-- <v-subheader>{{ __('ui_move_to') }}</v-subheader> -->
    <v-menu offset-x open-on-hover>
      <v-list-tile @click.stop="$emit('click', 'init')" slot="activator">
        <v-list-tile-action>
          <v-icon small>move_to_inbox</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          {{ __('ui_move_to') }}
        </v-list-tile-content>
        <v-list-tile-action>
          <v-icon :style="{transform: 'rotate(-90deg)'}">arrow_drop_down</v-icon>
        </v-list-tile-action>
      </v-list-tile>
      <v-list dense>
        <v-list-tile
          v-for="list in titledList"
          :key="list.index"
          @click.stop="$emit('click', 'moveSelectedItemsTo', list.index)"
          :color="list.color"
        >
          <v-list-tile-title>{{ list.title }}</v-list-tile-title>
        </v-list-tile>
        <v-list-tile @click.stop="$emit('click', 'moveSelectedItemsTo', -1)">
          <v-list-tile-title>
            <v-icon small>create_new_folder</v-icon>
            {{ __('ui_a_new_list') }}
          </v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>

    <v-divider class="my-1"></v-divider>

    <v-list-tile @click.stop="$emit('click', 'openSelectedItems')">
      <v-list-tile-action>
        <v-icon small>open_in_browser</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        {{ __('ui_open') }}
      </v-list-tile-content>
    </v-list-tile>

    <v-list-tile @click.stop="$emit('click', 'duplicateSelectedItems')">
      <v-list-tile-action>
        <v-icon small>content_copy</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        {{ __('ui_duplicate') }}
      </v-list-tile-content>
    </v-list-tile>

    <v-list-tile @click.stop="$emit('click', 'copyLinksOfSelectedItems')">
      <v-list-tile-action>
        <v-icon small>link</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        {{ __('ui_copy_link') }}
      </v-list-tile-content>
    </v-list-tile>

    <v-list-tile @click.stop="$emit('click', 'copyTitleOfSelectedItems')">
      <v-list-tile-action>
        <v-icon small>title</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        {{ __('ui_copy_title') }}
      </v-list-tile-content>
    </v-list-tile>

    <v-divider class="my-1"></v-divider>

    <v-list-tile @click.stop="$emit('click', 'removeSelectedItems')">
      <v-list-tile-action>
        <v-icon small>delete</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        {{ __('ui_remove') }}
      </v-list-tile-content>
    </v-list-tile>
  </v-list>
</v-menu>

</div>
</template>

<script>
import { mapGetters } from 'vuex'
import __ from '@/common/i18n'

export default {
  data() {
    return {
      x: NaN, y: NaN, // menu position
    }
  },
  computed: {
    ...mapGetters(['titledList']),
  },
  props: {
    value: Boolean,
  },
  methods: {
    __,
  },
}
</script>
