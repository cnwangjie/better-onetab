<template>
<v-snackbar
  :timeout="0"
  bottom
  v-model="snackbar.status"
>
  {{ snackbar.msg }}
</v-snackbar>
</template>
<script>
import {mapState} from 'vuex'

export default {
  computed: {
    ...mapState(['snackbar']),
  }
}
</script>

