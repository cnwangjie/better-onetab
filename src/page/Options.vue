<template>
<div>
  <div>
    <h2>点击图标时的行为</h2>
    <v-radio-group v-model="options.browserAction">
      <v-radio type="radio" label="弹出简单列表" disabled value="popup"></v-radio>
      <v-radio type="radio" label="储存当前选中的标签" value="store-selected"></v-radio>
      <v-radio type="radio" label="储存所有标签" disabled value="store-all"></v-radio>
      <v-radio type="radio" label="显示完整列表" value="show-list"></v-radio>
      <v-radio type="radio" label="无动作" value="none"></v-radio>
    </v-radio-group>
    <h2>直接点击列表中的一项的行为</h2>
    <v-radio-group v-model="options.itemClickAction">
      <v-radio type="radio" label="打开并从列表中删除" value="open-and-remove"></v-radio>
      <v-radio type="radio" label="打开但不从列表中删除" value="open"></v-radio>
      <v-radio type="radio" label="无动作" value="none"></v-radio>
    </v-radio-group>
    <h2>列表项的显示形式</h2>
    <v-radio-group v-model="options.itemDisplay">
      <v-radio type="radio" label="显示标题和链接" value="title-and-url"></v-radio>
      <v-radio type="radio" label="只显示标题" value="title"></v-radio>
      <v-radio type="radio" label="只显示链接" value="url"></v-radio>
    </v-radio-group>
    <h2>云端同步</h2>
    <v-radio-group v-model="options.syncServer">
      <v-radio type="radio" label="使用Google Sync" value="google-sync"></v-radio>
      <v-radio type="radio" label="使用本扩展提供的服务同步" value="idy-sync"></v-radio>
    </v-radio-group>
    <v-switch label="同步设置" v-model="options.syncOptions"></v-switch>
    <v-switch label="同步标签列表" v-model="options.syncList"></v-switch>
  </div>
</div>
</template>
<script>
export default {
  data() {
    return {
      options: {
        browserAction: 'show-list',
        itemClickAction: 'open-and-remove',
        itemDisplay: 'title-and-url',
        syncServer: 'google-sync',
        syncOptions: true,
        syncList: false,
      }
    }
  }
}
</script>
<style lang="scss">
input[type="radio"] {
  margin: 0;
  width: 18px;
  height: 18px;
  line-height: 18px;
}
.selection {
  height: 18px;
  line-height: 18px;
}
</style>
