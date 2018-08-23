<template>
  <span>{{ formattedTime }}</span>
</template>
<script>
import { formatTime } from '@/common/utils'
export default {
  props: {
    value: [Number, String],
  },
  data() {
    return {
      formattedTime: '',
    }
  },
  created() {
    this.updateTime()
  },
  methods: {
    updateTime() {
      this.formattedTime = formatTime(this.value)
      const msDiff = Math.abs(this.value - Date.now())
      const timeout = msDiff < 60 * 1000 ? 1000
        : msDiff < 3600 * 1000 ? 60 * 1000
        : 1e10
      setTimeout(() => {
        this.updateTime()
      }, timeout)
    }
  },
}
</script>
