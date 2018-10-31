<template>
<v-text-field
  solo-inverted
  dark
  flat
  clearable
  hide-details
  label=" Search"
  prepend-inner-icon="search"
  @focus="onFocus"
  @click:clear="onClear"
  @keydown.enter="search"
  v-model="value"
  ref="searchForm"
>
</v-text-field>
</template>
<script>

export default {
  data() {
    return {
      value: '',
    }
  },
  created() {
    this.stringifyQuery()
  },
  watch: {
    '$route.query': 'stringifyQuery',
  },
  methods: {
    stringifyQuery() {
      const {q} = this.$route.query
      this.value = q ? decodeURIComponent(q) : ''
    },
    onFocus() {
      if (this.value === '') this.value = ' '
      if (this.$route.name !== 'search') this.$router.push({name: 'search'})
    },
    onClear() {
      this.value = ''
      this.$refs.searchForm.blur()
      if (this.$route.name === 'search') this.$router.go(-1)
    },
    search() {
      this.$router.replace({name: 'search', query: {q: encodeURIComponent(this.value)}})
    },
  }
}
</script>

