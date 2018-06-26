<template>
  <ul :id="dataId" class="gclearfix list" :locked="dataLocked">
    <li 
      v-for="item in dataList"
      :data-id="item.id"
      :data-homepageurl="item.homepageUrl"
      :data-optionurl="item.optionsUrl"
      :data-name="item.name"
      :style="item.showIconBg"
      :locked="item.isLocked"
      :data-mark="item.showMark"
      @mousedown.left.prevent="onoff(item.id, item.enabled)"
      @mousedown.right.prevent="showMenu(item)"
      @mouseenter="enterMenu(item)"
      >
      <i>{{item.showMark}}</i>
    </li>
  </ul>
</template>

<script>
  export default {
    name: 'ExtItem',
    props: {
      dataList: Array,
      dataId: String,
      dataLocked: String
    },
    methods: {
      onoff(id, status) {
        this.$parent.onoff(id, status)
      },
      showMenu(item) {
        this.$parent.showMenu(item)
      },
      enterMenu(item) {
        this.$parent.enterMenu(item)
      }
    }
  }
</script>

<style>
</style>