<template>
  <div id="popup">
    <div id="wrap">
      <div id="search">
        <div id="searchBox">
          <input type="text" class="searchInput searcher js-searcher" :placeholder="i18n.searcherPlaceholder">
          <svg width="24px" height="24px" class="searchEmpty js-search-empty" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
          </svg>
          <svg width="20px" height="20px" class="serachIco" viewBox="0 0 20 20">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
          </svg>
        </div>
        <button class="searchItem searchInput btn btn-reset js-dblclick-btn">{{i18n.closeAllBtn}}</button>
        <div id="group" class="searchItem">
          <button class="searchInput btn btn-group">{{i18n.defaultGroupName}}</button>
          <ul id="group-list">
            <li>娱乐</li>
            <li>工作</li>
            <li>配置分组</li>
          </ul>
        </div>
      </div>

      <ext-item :data-list="enabledExtList" data-id="showList" data-locked="locked"></ext-item>
      <ext-item :data-list="disabledExtList" data-id="hideList"></ext-item>
      
      <div id="tips">
        <span class="title">{{i18n.tipsTitle}}</span>
        <span class="desc"><span class="con">{{i18n.tipsCon}}</span><a href="https://chrome.google.com/webstore/category/extensions?hl=" target="_blank" class="url">{{i18n.tipsUrl}}</a></span>
      </div>
    </div>
    <label id="extName"></label>
    <div id="rightMenu" :class="{ showMenu: rightMenu.show }" :style="{ left: rightMenu.left + 'px', top: rightMenu.top + 'px', background: rightMenu.backgroundColor}">
      <ul>
        <li v-for="item in rightMenu.content" @click="item.handle" :disabled="item.disabled">{{item.name}}</li>
      </ul>
    </div>
    <canvas id="getColorByCanvas" style="display: none;"></canvas>
  </div>
</template>


<script>
import getI18n from './lib/i18n'
import ExtItem from "./components/ExtItem";
// import * as Storage from './lib/storage'
import * as Extension from "./lib/extension"
import * as Util from "./lib/util"

export default {
  data() {
    return {
      // 国际化对象
      i18n: getI18n(),
      // storage: null,
      enabledExtList: [],
      disabledExtList: [],
      allExtColor: {},
      rightMenu: {
        show: false,
        left: 0,
        top: 0,
        backgroundColor: '#000',
        content: []
      }
    }
  },
  components: {
    ExtItem
  },
  computed: {
    // isShowExtName: () => this.storage._switch_show_extname_ !== 'close',
    // isDisabledRightclick: () => this.storage._switch_right_more_ !== 'close',
    // iconSize: () => this.storage._showIconSize_ || 2
  },
  methods: {
    // 启用禁用扩展
    onoff(item) {
      Extension.onoff(item)
    },
    // 显示右键菜单
    showMenu(item) {
      Util.showMenu(item)
    },
    enter(item) {
      Util.enter(item)
    },
    leave(item) {
      Util.leave(item)
    }
  },
  beforeCreate() {
    
    // 获取所有扩展
    Extension.getAll().then(res => {
      this.enabledExtList = res.enabledList
      this.disabledExtList = res.disabledList
      this.allExtColor = res.allColor
    })

    // 初始化相关
    Util.init(this)
  }
}
</script>



<style>
  * {
    padding: 0;
    margin: 0;
  }

  body {
    -webkit-user-select: none;
    position: relative;
  }

  ::-webkit-scrollbar {
    width: 1px;
  }

  ::-webkit-scrollbar-thumb {
    background: #D8D8D8;
  }

  .gclearfix {
    zoom: 1;
  }

  .gclearfix::after {
    clear: both;
    content: '';
    display: block;
    height: 0;
    visibility: hidden;
  }

  html{
    min-width: 344px;
    max-width: 724px;
  }
  #popup{
    position: relative;
  }
  #wrap {
    min-height: 125px;
    padding: 20px;
    box-sizing: border-box;
    position: relative;
  }
  .allListIsEmpty #search{
    display: none;
  }
  #search{
    display: -webkit-box;display: -ms-flexbox;display: flex;
    width: 100%;
    height: 40px;
    margin-bottom: 20px;
    box-sizing: border-box;
  }
  #search .searchInput{
    height: 100%;
    box-sizing: border-box;
    border: none;
    outline: none;
    border-radius: 1px;
    -webkit-transition: .4s ease-in-out;
    transition: .4s ease-in-out;
  }
  #search .searchItem{
    -webkit-box-flex: 0;-ms-flex-positive: 0;flex-grow: 0;
    position: relative;
    margin-left: 3px;
  }
  #search #searchBox{
    -webkit-box-flex: 1;-ms-flex-positive: 1;flex-grow: 1;
    height: 100%;
    position: relative;
  }
  #search .searcher{
    width: 100%;
    line-height: 1em;
    padding: 0 10px 0 36px;
    font-size: 16px;
    background: #f5f5f5;
    border-left: 5px solid #f5f5f5;
    color: #212121;
  }
  #search .searcher:focus{
    color: #616161;
    border-left-color: #40c4ff;
    /* box-shadow: rgba(0, 0, 0, 0.117647) 0px 1px 6px, rgba(0, 0, 0, 0.117647) 0px 1px 4px; */
  }
  #search .searchEmpty{
    fill: rgba(0,0,0,0.54);
    position: absolute;
    right: 10px;
    top: 50%;
    -webkit-transform: translateY(-50%);
    transform: translateY(-50%);
    cursor: pointer;
    display: none;
  }
  #search .searchEmpty:active{
    fill: #000;
  }
  #search .serachIco{
    fill: #a9a9a9;
    position: absolute;
    left: 11px;
    top: 50%;
    -webkit-transform: translateY(-50%);
    transform: translateY(-50%);
  }
  #search .btn{
    height: 100%;
    font-size: 16px;
    cursor: pointer;
    color: #aaa9a9;
    text-align: center;
    background-color: #f5f5f5;
    padding: 0 12px;
  }
  #search .btn:hover{
    color: #fff;
    background-color: #40c4ff;
  }
  #search .btn:active{
    transition: none;
    color: #fff;
    background-color: #5c5e6f;
  }
  #search .btn-reset{
    /* background-repeat: no-repeat;
    background-size: 16px;
    background-position: center right 10px; */
  }
  #search .btn-group{
    background-image: url('data:image/svg+xml;charset=UTF-8,<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M511.999488 634.683157 132.797004 255.480672l-66.916039 66.916039 446.1175 446.122617 446.1175-446.122617-66.916039-66.916039L511.999488 634.683157zM511.999488 634.683157" fill="#a9a9a9"></path></svg>');
    background-repeat: no-repeat;
    background-size: 16px;
    background-position: center right 10px;
    padding: 0 27px 0 12px;
  }
  #search .btn-group:hover{
    background-image: url('data:image/svg+xml;charset=UTF-8,<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M511.999488 634.683157 132.797004 255.480672l-66.916039 66.916039 446.1175 446.122617 446.1175-446.122617-66.916039-66.916039L511.999488 634.683157zM511.999488 634.683157" fill="#fff"></path></svg>');
  }
  .group-show-list #group-list{
    display: block !important;
  }
  #search #group-list{
    display: none;
    position: absolute;
    width: 100%;
    left: 0;
    top: 100%;
    z-index: 999;
    list-style: none;
  }
  #search #group-list li{
    height: 40px;
    line-height: 40px;
    font-size: 16px;
    text-align: center;
    color: #aaa9a9;
    padding: 0 12px;
    background-color: #f5f5f5;
    border-top: 1px solid #E0E0EB;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
  }
  #search #group-list li:hover{
    color: #fff;
    background-color: #40c4ff;
  }
  #search #group-list li:active{
    transition: none;
    color: #fff;
    background-color: #5c5e6f;
  }

  #wrap[searching] .list li{
    opacity: .1 !important;
    -webkit-filter: grayscale(1);
    filter: grayscale(1);
  }
  #wrap[searching] #search .searchEmpty{
    display: block;
  }

  #wrap[searching] .list li[searched]::before{
    display: block;
    content: "";
    height: 6px;
    width: 6px;
    position: absolute;
    bottom: -10px;
    left: 50%;
    background: #d8d8d8;
    z-index: 0;
    border-radius: 6px;
    -webkit-transform: translateX(-50%);
    transform: translateX(-50%);
  }
  #wrap[searching] .list li[searched]{
    -webkit-filter: grayscale(0) !important;
    filter: grayscale(0) !important;
    opacity: 1 !important;
  }
  #wrap[searching] #search .searcher{
    border-left-color: #5c5e6f;
  }

  .list li {
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
  .list li.hover {
    -webkit-filter: grayscale(0) !important;
    filter: grayscale(0) !important;
    opacity: 1 !important;
    transform: scale(1.3);
    -webkit-transform: scale(1.3);
  }

  /* 是否应用 */
  .list li i{
    display: none;
  }
  .list li[data-mark] i{
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
  html.icon-size-3 .list li[data-mark] i{
    right: -7px;
  }

  .list li[locked]::after {
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

  .dinginess li{
    opacity: .2 !important;
  }

  html.icon-size-1 .list li{
    background-size: 38px;
  }
  html.icon-size-2 .list li{
    background-size: 44px;
  }
  html.icon-size-3 .list li{
    background-size: 50px;
  }
  html.icon-size-3 .list li[locked]::after{
    top: -3px;
    right: -3px;
  }

  #showList {
    border-bottom: 2px dotted #E6E6E6;
    padding: 0 0 10px 0;
    margin: 0 0 10px 0;
  }

  #showList:empty::before{
    display: block;
    width: 97%;
    height: 56px;
    line-height: 56px;
    margin: 0 auto 20px auto;
    outline: 2px dotted #E6E6E6;

    font-size: 20px;
    font-weight: 200;
    color: #bbb;
    text-align: center;

    content: "__MSG_emptyShowListCon__";
    opacity: 0;

    animation-name: showEmptyTips;
    -webkit-animation-name: showEmptyTips;
    animation-delay: 250ms;
    -webkit-animation-delay: 250ms;
    animation-timing-function: ease-in-out;
    -webkit-animation-timing-function: ease-in-out;
    animation-duration: 200ms;
    -webkit-animation-duration: 200ms;
    animation-fill-mode: forwards;
    -webkit-animation-fill-mode: forwards;
  }
  @keyframes showEmptyTips {
    from{
      opacity: 0;
    }
    to{
      opacity: 1;
    }
  }
  @-webkit-keyframes showEmptyTips {
    from{
      opacity: 0;
    }
    to{
      opacity: 1;
    }
  }

  #showList[locked] li {
    position: relative;
  }

  #showList[locked] li img {
    opacity: .6;
    -webkit-filter: grayscale(1);
    filter: grayscale(1);
  }

  #hideList li {
    opacity: .5;
    -webkit-filter: grayscale(1);
    filter: grayscale(1);
  }
  #showList.hideListIsNull, #showList:empty{
    border-bottom: none;
    padding: 0;
    margin: 0;
  }

  .allListIsEmpty #showList:empty{
    display: none;
  }
  .allListIsEmpty #tips{
    display: block;
  }
  #tips{
    display: none;
    margin: 40px auto;
  }
  #tips .title{
    display: block;
    font-size: 1.9em;
    text-align: center;
    line-height: 54px;
    color: #c7c7c7;
  }
  [data-lan^=zh_] #tips .title{
    font-size: 2.4em;
  }
  #tips .desc{
    display: block;
    font-size: 1.1em;
    text-align: center;
    height: 20px;
    line-height: 20px;
    color: #d8d8d8;
  }
  #tips .desc a{
    margin: 0 0 0 2px;
    color: #c7e8d3;
    font-weight: bold;
    text-decoration: underline;
    outline: none;
  }

  #extName{
    position: absolute;
    top: 0;
    left: 0;
    z-index: 6;

    box-sizing: border-box;
    height: 22px;
    line-height: 22px;
    font-size: 14px;
    color: #fff;
    text-transform: capitalize;
    white-space: nowrap;

    padding: 0 7px;
    border: none;
    border-radius: 2px;
    background-color: #5c5e6f;
    opacity: 0;
  }
  .extName-anim{
    -webkit-transition: .2s ease-in-out;
    transition: .2s ease-in-out;
  }

  #rightMenu{
    display: none;

    position: absolute;
    top: 0;
    left: 0;
    z-index: 6;

    height: 52px;
    width: 150px;
    border-radius: 2px;
    overflow: hidden;

    opacity: 0;
    background-color: #efefef;

    -webkit-transition: .2s ease-in-out;
    transition: .2s ease-in-out;
  }
  #rightMenu.showMenu{
    display: block !important;
    animation: moveShowMenu .1s ease-in-out forwards;
    -webkit-animation: moveShowMenu .1s ease-in-out forwards;
  }
  @keyframes moveShowMenu {
    from {
      transform: translateX(-10px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @-webkit-keyframes moveShowMenu {
    from {
      -webkit-transform: translateX(-10px);
      opacity: 0;
    }
    to {
      -webkit-transform: translateX(0);
      opacity: 1;
    }
  }
  [data-lan=ru] #rightMenu{
    width: 200px;
  }
  #rightMenu ul{
    width: 100%;
    height: 100%;
  }
  #rightMenu ul li{
    height: 26px;
    line-height: 26px;
    width: 75px;
    float: left;

    font-size: 12px;
    color: #fff;
    text-align: center;
    list-style: none;
    cursor: default;
    box-shadow: inset 0px 0px 0px 0.1px #fff;
  }
  [data-lan=ru] #rightMenu ul li{
    width: 100px;
  }
  #rightMenu ul li:hover{
    background-color: red;
  }
  #rightMenu ul li[disabled]{
    opacity: .4;
  }
  #rightMenu ul li[disabled]:hover{
    background: none;
  }
</style>
