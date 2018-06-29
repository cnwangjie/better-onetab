<template>
  <ul :id="dataId" :class="{ gclearfix: true, 'ext-list': true, dinginess: dataDinginess }" :locked="dataLocked">
    <li 
      v-for="item in dataList"
      :data-id="item.id"
      :class="{ hover: item.isHover}"
      :style="item.showIconBg"
      :locked="item.isLocked"
      :searched="item.isSearched"
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
        this.$parent.onoff && this.$parent.onoff(item)
      },
      showMenu(item) {
        this.$parent.showMenu && this.$parent.showMenu(item)
      },
      enter(item) {
        this.$parent.enter && this.$parent.enter(item)
      },
      leave(item) {
        this.$parent.leave && this.$parent.leave(item)
      }
    }
  }
</script>

<style>
  .ext-list{
    will-change: contents;
  }
  .ext-list li {
    width: 50px;
    height: 50px;
    float: left;
    list-style: none;
    margin: 13px;
    border-radius: 2px;
    background-size: 50px 50px;
    background-position: center;
    background-repeat: no-repeat;
    position: relative;

    -webkit-transition: .2s ease-in-out;
    transition: .2s ease-in-out;

    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
  .ext-list li.hover {
    -webkit-filter: grayscale(0) !important;
    filter: grayscale(0) !important;
    opacity: 1 !important;
    transform: scale(1.3);
    -webkit-transform: scale(1.3);
  }

  /* 是否应用 */
  .ext-list li i{
    display: none;
  }
  .ext-list li[data-mark] i{
    display: block;

    position: absolute;
    bottom: -2px;
    right: -4px;
    z-index: 999;

    height: 16px;
    line-height: 15px;
    width: 29px;
    padding: 0 2px;

    font-size: 12px;
    color: #fff;
    text-align: center;

    border-radius: 10px;
    box-shadow: 0px 0px 0px 1px #fff;
    background: #5c5d6e;
    -webkit-transform: scale(0.7);transform: scale(0.7);
  }

  .ext-list li[locked]::after {
    position: absolute;
    top: 1px;
    right: 1px;
    z-index: 999;
    content: "";
    display: block;
    height: 6px;
    width: 6px;
    border-radius: 10px;
    border: 3px solid #5c5e6f;
    box-shadow: 0px 0px 0px 1px #fff;
    background: #46d5fe;

    animation-name: lockedAnim;
    -webkit-animation-name: lockedAnim;
    animation-timing-function: ease-in-out;
    -webkit-animation-timing-function: ease-in-out;
    animation-duration: 400ms;
    -webkit-animation-duration: 400ms;
    animation-direction: alternate;
    -webkit-animation-direction: alternate;
    animation-iteration-count: 2;
    -webkit-animation-iteration-count: 2;
  }
  @keyframes lockedAnim {
    0%{
      transform: scale(1);
      -webkit-transform: scale(1);
    }
    50%{
      transform: scale(1.4);
      -webkit-transform: scale(1.4);
    }
    100%{
      transform: scale(1);
      -webkit-transform: scale(1);
    }
  }
  @-webkit-keyframes lockedAnim {
    0%{
      transform: scale(1);
      -webkit-transform: scale(1);
    }
    50%{
      transform: scale(1.4);
      -webkit-transform: scale(1.4);
    }
    100%{
      transform: scale(1);
      -webkit-transform: scale(1);
    }
  }
</style>