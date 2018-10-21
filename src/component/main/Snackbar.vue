<template>
<v-snackbar
  :timeout="2000"
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

