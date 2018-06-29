<template>
  <div :class="{'switch-btn': true, 'switch-btn-close': closeClass}" @click="changeSwtich"></div>
</template>

<script>
  import * as Storage from "./../lib/storage"
  export default {
    data() {
      return {
        swtichKey: '',
        closeClass: false
      }
    },
    props: {
      dataKey: String
    },
    methods: {
      changeSwtich() {
        this.closeClass = !this.closeClass
        if (this.closeClass) {
          Storage.set(this.swtichKey, 'close')
        } else {
          Storage.remove(this.swtichKey)
        }
      }
    },
    beforeMount() {
      this.swtichKey = `_switch_${this.dataKey}_`
      Storage.getAll().then(storage => {
        if (Storage.get(this.swtichKey) === 'close') {
          this.closeClass = true
        }
      })
    }
  }
</script>

<style>
  /*模拟ios开关*/
  .switch-btn {
    position: relative;

    width: 56px;
    height: 30px;
    line-height: 30px;
    display: inline-block;
    background: #25b75a;
    color: #fff;
    border-radius: 20px;
    border: none;
    font-size: 14px;
    outline: none;
    cursor: pointer;
    border: 1px solid #25b75a;
    margin: 10px 10px 0 0;
    letter-spacing: 1px;
    vertical-align: middle;
  }
  .switch-btn::before {
    display: block;
    content: "";

    position: absolute;
    left: 26px;
    top: 1px;

    width: 28px;
    height: 28px;

    border-radius: 15px;
    background: #fff;
    box-shadow: 1px 1px 2px #5d5d5d;

    -webkit-transition: 0.2s ease-in-out;
    transition: 0.2s ease-in-out;
  }
  .switch-btn.switch-btn-close {
    background: #fff;
    border-color: #e2e2e2;
  }
  .switch-btn.switch-btn-close::before {
    left: 1px;
  }
</style>