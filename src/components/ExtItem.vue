<template>
  <ul :id="dataId" :class="{ gclearfix: true, list: true, dinginess: dataDinginess }" :locked="dataLocked">
    <li 
      v-for="item in dataList"
      :data-id="item.id"
      :class="{ hover: item.isHover }"
      :style="item.showIconBg"
      :locked="item.isLocked"
      @mousedown.left.prevent="onoff(item)"
      @mousedown.right.prevent="showMenu(item)"
      @mouseenter="enter(item)"
      @mouseleave="leave(item)"
      >
      <i>{{item.showType}}</i>
    </li>
  </ul>
</template>

<script>
  export default {
    name: 'ExtItem',
    props: {
      dataList: Array,
      dataId: String,
      dataLocked: String,
      dataDinginess: Boolean
    },
    methods: {
      onoff(item) {
        this.$parent.onoff(item)
      },
      showMenu(item) {
        this.$parent.showMenu(item)
      },
      enter(item) {
        this.$parent.enter(item)
      },
      leave(item) {
        this.$parent.leave(item)
      }
    }
  }
</script>

<style>
</style>