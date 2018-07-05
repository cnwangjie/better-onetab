<template>
  <div id="popup" :data-lan="language" :class="'icon-size-' + showIconSize" :style="'width:' + getShowWindowSize + 'px'">
    <div id="wrap" :searching="searcher.doing" v-if="ext.extList.length > 0">
      <div id="search">
        <div id="searchBox">
          <input type="text" class="searchInput searcher" v-model="searcher.text" :placeholder="i18n.searcherPlaceholder" @input="search" v-focus @mouseenter="focus">
          <svg width="24px" height="24px" class="searchEmpty" viewBox="0 0 24 24" @mousedown="cancelSearch">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
          </svg>
          <svg width="20px" height="20px" class="serachIco" viewBox="0 0 20 20">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
          </svg>
        </div>
        <button :class="'searchItem searchInput btn btn-reset' + (ext.iconBadgeAnim ? ' anim' : '')" @click="clear" :title="i18n.closeAllBtn"></button>
        <div id="group" class="searchItem" @mouseenter="showGroup" @mouseleave="hideGroup">
          <button class="searchInput btn btn-group">{{group.list[groupIndex].name}}</button>
          <ul id="group-list" v-show="groupShow">
            <li v-for="(item, index) in group.list" @click="changeGroup(index)" :title="item.name">{{item.name}}</li>
            <li @click="setGroup" class="setting"></li>
          </ul>
        </div>
      </div>
      <ext-item :data-dinginess="ext.enabledExtListDinginess" :data-list="getEnbledExtList" data-id="showList" data-locked="locked">
        <template slot="empty">
          <li class="empty" v-if="getEnbledExtList.length === 0">{{i18n.emptyShowListCon}}</li>
        </template>
      </ext-item>
      <ext-item :data-dinginess="ext.disabledExtListDinginess" :data-list="getDisabledExtList" data-id="hideList"></ext-item>
    </div>

    <!-- 所有扩展都为空，进行提示 -->
    <div id="allEmptyTips" v-if="ext.allEmpty">
      <span class="title">{{i18n.tipsTitle}}</span>
      <span class="desc">
        <span class="con">{{i18n.tipsCon}}</span>
        <a :href="chromeStore" target="_blank" @click="goChromeStore">{{i18n.tipsUrl}}</a>
      </span>
    </div>

    <label id="extName" :class="[extName.showClass]" :style="{ left: extName.left, right: extName.right, top: extName.top, background: extName.backgroundColor, 'max-width': extName.adviseMaxWidth + 'px'}">
      {{extName.content}}
    </label>
    <div id="rightMenu" :class="[rightMenu.showClass]" :style="{ left: rightMenu.left, right: rightMenu.right, top: rightMenu.top, background: rightMenu.backgroundColor}">
      <ul>
        <li v-for="item in rightMenu.content" @click="item.handle" :disabled="item.disabled">{{item.name}}</li>
      </ul>
    </div>
    <canvas id="getColorByCanvas" style="display: none;"></canvas>
  </div>
</template>


<script>
import getI18n from './lib/i18n'
import ExtItem from "./components/ExtItem"
import * as Storage from './lib/storage'
import * as Extension from "./lib/extension"
import * as Util from "./lib/util"
import * as Rank from "./lib/rank"

export default {
  data() {
    return {
      // 国际化对象
      i18n: getI18n(),
      chromeStore: `https://chrome.google.com/webstore/category/extensions?hl=${chrome.i18n.getUILanguage()}`,
      language: chrome.i18n.getUILanguage(),
      ext: {
        extList: [],
        enabledExtListDinginess: false,
        disabledExtListDinginess: false,
        iconBadgeAnim: false,
        allEmpty: false
      },
      allExtColor: {},
      rightMenu: {
        showClass: '',
        left: 0,
        top: 0,
        backgroundColor: '#000',
        content: []
      },
      extName: {
        showClass: '',
        left: 0,
        right: 'unset',
        top: 0,
        backgroundColor: '#000',
        content: '',
        adviseMaxWidth: 200
      },
      searcher: {
        doing: false,
        text: ''
      },
      group: {
        list: [{
          name: '',
          lock: {}
        }]
      },
      groupIndex: 0,
      groupShow: false,
      showIconSize: 2,
      showWindowSize: 6,
      orderHandle: function() {}
    }
  },
  watch: {
    groupIndex: (val, oldVal) => {
      localStorage.setItem("_groupIndex_", val)
    }
  },
  components: {
    ExtItem
  },
  computed: {
    getEnbledExtList() {
      let list = this.ext.extList.filter(item => {
        if (item.enabled) {
          if (this.group.list[this.groupIndex].lock[item.id]) {
            item.isLocked = true
          } else {
            item.isLocked = false
          }
          return true
        }
      })
      return list.sort(this.orderHandle)
    },
    getDisabledExtList() {
      let list = this.ext.extList.filter(item => {
        if (!item.enabled) {
          if (this.group.list[this.groupIndex].lock[item.id]) {
            item.isLocked = true
          } else {
            item.isLocked = false
          }
          return true
        }
      })
      return list.sort(this.orderHandle)
    },
    getShowWindowSize() {
      const WindowSizeByColum = {
        6: 496,
        7: 572,
        8: 648,
        9: 724
      }
      return WindowSizeByColum[this.showWindowSize] || WindowSizeByColum['7']
    }
  },
  methods: {
    focus(e) {
      e.target.focus()
    },
    // 启用禁用扩展
    extClick(item) {
      Rank.set(item.id)
      Util.onoff(item)
    },
    clear() {
      Util.clear()
    },
    // 显示右键菜单
    extRClick(item) {
      Util.showMenu(item)
    },
    extEnter(item) {
      Util.enter(item)
    },
    extLeave(item) {
      Util.leave(item)
    },
    search() {
      Util.search()
    },
    cancelSearch() {
      Util.cancelSearch()
    },
    showGroup() {
      Util.showGroup()
    },
    hideGroup() {
      Util.hideGroup()
    },
    changeGroup(index) {
      Util.changeGroup(index)
    },
    setGroup() {
      Util.setGroup()
    },
    goChromeStore(e) {
      chrome.tabs.create({
        'url': e.target.href
      })
    }
  },
  beforeCreate() {

    // 对象外置，用于调试
    window.vm = this

    Storage.getAll().then(storage => {

      // 显示初始化：图标大小、宽度等
      let showWindowSize = Storage.get('_showColumn_')
      if (showWindowSize) {
        this.showWindowSize = showWindowSize
      }
      let showIconSize = Storage.get('_showIconSize_')
      if (showIconSize) {
        this.showIconSize = showIconSize
      }

      // [Init]增加分组功能，兼容老版本问题
      let oldLockObj = Storage.get('_lockList_')
      let group = Storage.get('_group_')
      if (!group) {
        group = {
          list: [
            {
              'name': this.i18n.defaultGroupName,
              'lock': oldLockObj || {}
            }
          ]
        }
        Storage.set('_group_', group)
        Storage.remove('_lockList_')
      }
      this.group = group
      this.groupIndex = Number.parseInt(localStorage.getItem("_groupIndex_")) || 0

      // 排序方法初始化
      this.orderHandle = Extension.orderHandle(storage)

      // 获取所有扩展
      Extension.getAll({needColor: true}).then(res => {
        if (res && res.length === 0) {
          this.ext.allEmpty = true
        } else {
          this.ext.extList = res
        }
        Extension.addIconBadge()
      })
    })

    // 初始化相关
    Util.init(this)
  },
  directives: {
    focus: {
      // 指令的定义
      inserted: function (el) {
        el.focus()
      }
    }
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

  #popup{
    position: relative;
    min-width: 496px;
    min-height: 300px;
  }
  /* #popup::after{
    position: absolute;
    z-index: 1;
    width: 50px;
    height: 50px;
    left: 50%;
    top: 50%;
    content: '';
    transform: translate3d(-50%, -50%, 0);
    -webkit-transform: translate3d(-50%, -50%, 0);
    background-repeat: no-repeat;
    background-position: center;
    background-image: url('data:image/svg+xml;charset=UTF-8,<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M513.652405 117.787423c-16.209027 0-29.350001 13.139017-29.350001 29.35v733.751974c0 16.210984 13.140974 29.350001 29.350001 29.35s29.350001-13.139017 29.350001-29.35V147.137423c0-16.209027-13.140974-29.350001-29.350001-29.35zM352.769398 248.829306h-0.039133c-0.397203-15.86074-13.352294-28.604511-29.310868-28.604511s-28.913664 12.741814-29.310867 28.604511h-0.025437v0.48134c-0.001957 0.08805-0.013697 0.174143-0.013696 0.26415s0.01174 0.1761 0.013696 0.26415V778.459851c0 16.210984 13.140974 29.350001 29.350001 29.350001s29.350001-13.139017 29.350001-29.350001c0-0.090007-0.013697-0.1761-0.013697-0.266107V248.829306zM733.22563 248.829306h-0.039133c-0.397203-15.86074-13.352294-28.604511-29.310868-28.604511s-28.913664 12.741814-29.310867 28.604511h-0.025437v0.48134c-0.001957 0.08805-0.013697 0.174143-0.013696 0.26415s0.01174 0.1761 0.013696 0.26415V778.459851c0 16.210984 13.140974 29.350001 29.350001 29.350001s29.350001-13.139017 29.350001-29.350001c0-0.090007-0.013697-0.1761-0.013697-0.266107V248.829306zM133.090513 337.436958c-16.209027 0-29.350001 13.139017-29.350001 29.35v294.145707c0 16.210984 13.140974 29.350001 29.350001 29.350001s29.350001-13.139017 29.350001-29.350001v-294.145707c0-16.210984-13.140974-29.350001-29.350001-29.35zM894.092984 337.436958c-16.20707 0-29.350001 13.139017-29.350001 29.35v294.145707c0 16.210984 13.14293 29.350001 29.350001 29.350001 16.210984 0 29.350001-13.139017 29.35-29.350001v-294.145707c0-16.210984-13.139017-29.350001-29.35-29.35z" fill="#c7c7c7"></path></svg>');
  } */
  #wrap {
    position: relative;
    min-height: 125px;
    padding: 20px;
    box-sizing: border-box;
    background-color: #fff;
    z-index: 2;
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
    padding: 0 40px 0 36px;
    font-size: 16px;
    background: #f5f5f5;
    border-left: 4px solid #f5f5f5;
    color: #212121;
  }
  #search .searcher:focus{
    color: #616161;
    border-left-color: #40c4ff;
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
    width: 50px;
    position: relative;
  }
  #search .btn-reset::before{
    position: absolute;
    width: 20px;
    height: 20px;
    left: 50%;
    top: 50%;
    content: '';
    transform: translate3d(-50%, -50%, 0);
    -webkit-transform: translate3d(-50%, -50%, 0);
    background-size: 90%;
    background-repeat: no-repeat;
    background-position: center;
    background-image: url('data:image/svg+xml;charset=UTF-8,<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M31.981112 0.604423v1023.395577" fill="#aaa9a9"></path><path d="M63.962224 0.604423v1023.395577" fill="#aaa9a9"></path><path d="M95.943335 0.604423v1023.395577" fill="#aaa9a9"></path><path d="M127.924447 0.604423v1023.395577" fill="#aaa9a9"></path><path d="M159.905559 0.604423v1023.395577" fill="#aaa9a9"></path><path d="M191.886671 0.604423v1023.395577" fill="#aaa9a9"></path><path d="M223.867782 0.604423v1023.395577" fill="#aaa9a9"></path><path d="M255.848894 0.604423v1023.395577" fill="#aaa9a9"></path><path d="M287.830006 0.604423v1023.395577" fill="#aaa9a9"></path><path d="M319.811118 0.604423v1023.395577" fill="#aaa9a9"></path><path d="M351.79223 0.604423v1023.395577" fill="#aaa9a9"></path><path d="M383.773341 0.604423v1023.395577" fill="#aaa9a9"></path><path d="M415.754453 0.604423v1023.395577" fill="#aaa9a9"></path><path d="M447.735565 0.604423v1023.395577" fill="#aaa9a9"></path><path d="M479.716677 0.604423v1023.395577" fill="#aaa9a9"></path><path d="M511.697788 0.604423v1023.395577" fill="#aaa9a9"></path><path d="M543.6789 0.604423v1023.395577" fill="#aaa9a9"></path><path d="M575.660012 0.604423v1023.395577" fill="#aaa9a9"></path><path d="M607.641124 0.604423v1023.395577" fill="#aaa9a9"></path><path d="M639.622236 0.604423v1023.395577" fill="#aaa9a9"></path><path d="M671.603347 0.604423v1023.395577" fill="#aaa9a9"></path><path d="M703.584459 0.604423v1023.395577" fill="#aaa9a9"></path><path d="M735.565571 0.604423v1023.395577" fill="#aaa9a9"></path><path d="M767.546683 0.604423v1023.395577" fill="#aaa9a9"></path><path d="M799.527795 0.604423v1023.395577" fill="#aaa9a9"></path><path d="M831.508906 0.604423v1023.395577" fill="#aaa9a9"></path><path d="M863.490018 0.604423v1023.395577" fill="#aaa9a9"></path><path d="M895.47113 0.604423v1023.395577" fill="#aaa9a9"></path><path d="M927.452242 0.604423v1023.395577" fill="#aaa9a9"></path><path d="M959.433353 0.604423v1023.395577" fill="#aaa9a9"></path><path d="M991.414465 0.604423v1023.395577M0 32.585535h1023.395577" fill="#aaa9a9"></path><path d="M0 64.566647h1023.395577" fill="#aaa9a9"></path><path d="M0 96.547758h1023.395577" fill="#aaa9a9"></path><path d="M0 128.52887h1023.395577" fill="#aaa9a9"></path><path d="M0 160.509982h1023.395577" fill="#aaa9a9"></path><path d="M0 192.491094h1023.395577" fill="#aaa9a9"></path><path d="M0 224.472205h1023.395577" fill="#aaa9a9"></path><path d="M0 256.453317h1023.395577" fill="#aaa9a9"></path><path d="M0 288.434429h1023.395577" fill="#aaa9a9"></path><path d="M0 320.415541h1023.395577" fill="#aaa9a9"></path><path d="M0 352.396653h1023.395577" fill="#aaa9a9"></path><path d="M0 384.377764h1023.395577" fill="#aaa9a9"></path><path d="M0 416.358876h1023.395577" fill="#aaa9a9"></path><path d="M0 448.339988h1023.395577" fill="#aaa9a9"></path><path d="M0 480.3211h1023.395577" fill="#aaa9a9"></path><path d="M0 512.302212h1023.395577" fill="#aaa9a9"></path><path d="M0 544.283323h1023.395577" fill="#aaa9a9"></path><path d="M0 576.264435h1023.395577" fill="#aaa9a9"></path><path d="M0 608.245547h1023.395577" fill="#aaa9a9"></path><path d="M0 640.226659h1023.395577" fill="#aaa9a9"></path><path d="M0 672.20777h1023.395577" fill="#aaa9a9"></path><path d="M0 704.188882h1023.395577" fill="#aaa9a9"></path><path d="M0 736.169994h1023.395577" fill="#aaa9a9"></path><path d="M0 768.151106h1023.395577" fill="#aaa9a9"></path><path d="M0 800.132218h1023.395577" fill="#aaa9a9"></path><path d="M0 832.113329h1023.395577" fill="#aaa9a9"></path><path d="M0 864.094441h1023.395577" fill="#aaa9a9"></path><path d="M0 896.075553h1023.395577" fill="#aaa9a9"></path><path d="M0 928.056665h1023.395577" fill="#aaa9a9"></path><path d="M0 960.037776h1023.395577" fill="#aaa9a9"></path><path d="M0 992.018888h1023.395577" fill="#aaa9a9"></path><path d="M805.924017 134.925093C716.376904 45.37798 607.641124 0.604423 486.112899 0.604423c-115.132002-6.396222-223.867782 38.377334-307.018673 115.132002v-63.962223c0-6.396222 0-6.396222-6.396222-6.396222H115.132002c-6.396222 0-6.396222 0-6.396222 19.188667v172.698003c6.396222 6.396222 6.396222 12.792445 19.188667 12.792445l179.094226-6.396222s6.396222 0 6.396222-6.396223V179.698649c0-6.396222 0-6.396222-6.396222-6.396222h-63.962223c147.113114-134.320669 370.980897-121.528225 511.697788 19.188667 147.113114 147.113114 147.113114 390.169564 0 530.886455-147.113114 147.113114-383.773341 147.113114-530.886456 0-31.981112-25.584889-51.169779-57.566001-70.358445-89.547113l-76.754669 25.58489c25.584889 44.773556 51.169779 89.547113 89.547113 127.924447 89.547113 89.547113 198.282893 134.320669 326.20734 134.320669 121.528225-6.396222 236.660227-51.169779 326.207341-134.320669s134.320669-204.679115 134.320669-319.811118C946.640909 333.207986 895.47113 224.472205 805.924017 134.925093z" fill="#aaa9a9"></path><path d="M607.641124 461.132433c0 52.986706-42.954631 95.943335-95.943336 95.943335s-95.943335-42.954631-95.943335-95.943335 42.954631-95.943335 95.943335-95.943336 95.943335 42.954631 95.943336 95.943336z" fill="#aaa9a9"></path></svg>');
  }
  #search .btn-reset:hover::before{
    background-image: url('data:image/svg+xml;charset=UTF-8,<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M31.981112 0.604423v1023.395577" fill="#fff"></path><path d="M63.962224 0.604423v1023.395577" fill="#fff"></path><path d="M95.943335 0.604423v1023.395577" fill="#fff"></path><path d="M127.924447 0.604423v1023.395577" fill="#fff"></path><path d="M159.905559 0.604423v1023.395577" fill="#fff"></path><path d="M191.886671 0.604423v1023.395577" fill="#fff"></path><path d="M223.867782 0.604423v1023.395577" fill="#fff"></path><path d="M255.848894 0.604423v1023.395577" fill="#fff"></path><path d="M287.830006 0.604423v1023.395577" fill="#fff"></path><path d="M319.811118 0.604423v1023.395577" fill="#fff"></path><path d="M351.79223 0.604423v1023.395577" fill="#fff"></path><path d="M383.773341 0.604423v1023.395577" fill="#fff"></path><path d="M415.754453 0.604423v1023.395577" fill="#fff"></path><path d="M447.735565 0.604423v1023.395577" fill="#fff"></path><path d="M479.716677 0.604423v1023.395577" fill="#fff"></path><path d="M511.697788 0.604423v1023.395577" fill="#fff"></path><path d="M543.6789 0.604423v1023.395577" fill="#fff"></path><path d="M575.660012 0.604423v1023.395577" fill="#fff"></path><path d="M607.641124 0.604423v1023.395577" fill="#fff"></path><path d="M639.622236 0.604423v1023.395577" fill="#fff"></path><path d="M671.603347 0.604423v1023.395577" fill="#fff"></path><path d="M703.584459 0.604423v1023.395577" fill="#fff"></path><path d="M735.565571 0.604423v1023.395577" fill="#fff"></path><path d="M767.546683 0.604423v1023.395577" fill="#fff"></path><path d="M799.527795 0.604423v1023.395577" fill="#fff"></path><path d="M831.508906 0.604423v1023.395577" fill="#fff"></path><path d="M863.490018 0.604423v1023.395577" fill="#fff"></path><path d="M895.47113 0.604423v1023.395577" fill="#fff"></path><path d="M927.452242 0.604423v1023.395577" fill="#fff"></path><path d="M959.433353 0.604423v1023.395577" fill="#fff"></path><path d="M991.414465 0.604423v1023.395577M0 32.585535h1023.395577" fill="#fff"></path><path d="M0 64.566647h1023.395577" fill="#fff"></path><path d="M0 96.547758h1023.395577" fill="#fff"></path><path d="M0 128.52887h1023.395577" fill="#fff"></path><path d="M0 160.509982h1023.395577" fill="#fff"></path><path d="M0 192.491094h1023.395577" fill="#fff"></path><path d="M0 224.472205h1023.395577" fill="#fff"></path><path d="M0 256.453317h1023.395577" fill="#fff"></path><path d="M0 288.434429h1023.395577" fill="#fff"></path><path d="M0 320.415541h1023.395577" fill="#fff"></path><path d="M0 352.396653h1023.395577" fill="#fff"></path><path d="M0 384.377764h1023.395577" fill="#fff"></path><path d="M0 416.358876h1023.395577" fill="#fff"></path><path d="M0 448.339988h1023.395577" fill="#fff"></path><path d="M0 480.3211h1023.395577" fill="#fff"></path><path d="M0 512.302212h1023.395577" fill="#fff"></path><path d="M0 544.283323h1023.395577" fill="#fff"></path><path d="M0 576.264435h1023.395577" fill="#fff"></path><path d="M0 608.245547h1023.395577" fill="#fff"></path><path d="M0 640.226659h1023.395577" fill="#fff"></path><path d="M0 672.20777h1023.395577" fill="#fff"></path><path d="M0 704.188882h1023.395577" fill="#fff"></path><path d="M0 736.169994h1023.395577" fill="#fff"></path><path d="M0 768.151106h1023.395577" fill="#fff"></path><path d="M0 800.132218h1023.395577" fill="#fff"></path><path d="M0 832.113329h1023.395577" fill="#fff"></path><path d="M0 864.094441h1023.395577" fill="#fff"></path><path d="M0 896.075553h1023.395577" fill="#fff"></path><path d="M0 928.056665h1023.395577" fill="#fff"></path><path d="M0 960.037776h1023.395577" fill="#fff"></path><path d="M0 992.018888h1023.395577" fill="#fff"></path><path d="M805.924017 134.925093C716.376904 45.37798 607.641124 0.604423 486.112899 0.604423c-115.132002-6.396222-223.867782 38.377334-307.018673 115.132002v-63.962223c0-6.396222 0-6.396222-6.396222-6.396222H115.132002c-6.396222 0-6.396222 0-6.396222 19.188667v172.698003c6.396222 6.396222 6.396222 12.792445 19.188667 12.792445l179.094226-6.396222s6.396222 0 6.396222-6.396223V179.698649c0-6.396222 0-6.396222-6.396222-6.396222h-63.962223c147.113114-134.320669 370.980897-121.528225 511.697788 19.188667 147.113114 147.113114 147.113114 390.169564 0 530.886455-147.113114 147.113114-383.773341 147.113114-530.886456 0-31.981112-25.584889-51.169779-57.566001-70.358445-89.547113l-76.754669 25.58489c25.584889 44.773556 51.169779 89.547113 89.547113 127.924447 89.547113 89.547113 198.282893 134.320669 326.20734 134.320669 121.528225-6.396222 236.660227-51.169779 326.207341-134.320669s134.320669-204.679115 134.320669-319.811118C946.640909 333.207986 895.47113 224.472205 805.924017 134.925093z" fill="#fff"></path><path d="M607.641124 461.132433c0 52.986706-42.954631 95.943335-95.943336 95.943335s-95.943335-42.954631-95.943335-95.943335 42.954631-95.943335 95.943335-95.943336 95.943335 42.954631 95.943336 95.943336z" fill="#fff"></path></svg>');
  }
  #search .btn-reset.anim::before,
  #search .btn-reset:hover::before{
    animation-name: resetTips;
    -webkit-animation-name: resetTips;
    animation-timing-function: ease-in-out;
    -webkit-animation-timing-function: ease-in-out;
    animation-duration: 2s;
    -webkit-animation-duration: 2s;
    animation-fill-mode: forwards;
    -webkit-animation-fill-mode: forwards;
    animation-iteration-count: infinite;
    -webkit-animation-iteration-count: infinite;
    transform-origin: 0 0;
    -webkit-transform-origin: 0 0;
  }
  @keyframes resetTips {
    0%{
      transform: rotate(0deg) translate3d(-50%, -50%, 0);
    }
    50%{
      transform: rotate(-360deg) translate3d(-50%, -50%, 0);
    }
  }
  @-webkit-keyframes resetTips {
    0%{
      -webkit-transform: rotate(0deg) translate3d(-50%, -50%, 0);
    }
    50%{
      -webkit-transform: rotate(-360deg) translate3d(-50%, -50%, 0);
    }
  }

  #search .btn-group{
    min-width: 104px;
    background-image: url('data:image/svg+xml;charset=UTF-8,<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M511.999488 634.683157 132.797004 255.480672l-66.916039 66.916039 446.1175 446.122617 446.1175-446.122617-66.916039-66.916039L511.999488 634.683157zM511.999488 634.683157" fill="#a9a9a9"></path></svg>');
    background-repeat: no-repeat;
    background-size: 14px;
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
    position: absolute;
    width: 100%;
    left: 0;
    top: 100%;
    z-index: 999;
    list-style: none;
  }
  #search #group-list li{
    position: relative;
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
  #search #group-list li.setting::before{
    position: absolute;
    width: 20px;
    height: 20px;
    left: 50%;
    top: 50%;
    content: '';
    transform: translate3d(-50%, -50%, 0);
    -webkit-transform: translate3d(-50%, -50%, 0);
    background-size: 90%;
    background-repeat: no-repeat;
    background-position: center;
    background-image: url('data:image/svg+xml;charset=UTF-8,<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M977.92 433.92l-44.8 0c-20.48 0-44.8-15.36-49.92-35.84l-25.6-65.28c-10.24-20.48-5.12-44.8 10.24-60.16l30.72-30.72c15.36-15.36 15.36-39.68 0-55.04l-55.04-55.04c-15.36-15.36-39.68-15.36-55.04 0l-30.72 30.72c-15.36 15.36-39.68 20.48-60.16 10.24l-65.28-25.6c-20.48-5.12-35.84-30.72-35.84-49.92L596.48 52.48c0-25.6-20.48-39.68-39.68-39.68l-75.52 0c-25.6 0-39.68 20.48-39.68 39.68L441.6 102.4c0 20.48-15.36 44.8-35.84 49.92l-65.28 25.6c-20.48 10.24-44.8 5.12-60.16-10.24L238.08 128c-15.36-15.36-39.68-15.36-55.04 0l-55.04 55.04c-15.36 15.36-15.36 39.68 0 55.04l30.72 30.72c15.36 15.36 20.48 39.68 10.24 60.16l-25.6 65.28c-5.12 20.48-30.72 35.84-49.92 35.84L46.08 430.08c-25.6 0-39.68 20.48-39.68 39.68l0 75.52c0 25.6 20.48 39.68 39.68 39.68l44.8 0c20.48 0 44.8 15.36 49.92 35.84l25.6 65.28c10.24 20.48 5.12 44.8-10.24 60.16l-30.72 30.72c-15.36 15.36-15.36 39.68 0 55.04l55.04 55.04c15.36 15.36 39.68 15.36 55.04 0l30.72-30.72c15.36-15.36 39.68-20.48 60.16-10.24l65.28 25.6c20.48 5.12 35.84 30.72 35.84 49.92L427.52 972.8c0 25.6 20.48 39.68 39.68 39.68l75.52 0c25.6 0 39.68-20.48 39.68-39.68l0-44.8c0-20.48 15.36-44.8 35.84-49.92l65.28-25.6c20.48-10.24 44.8-5.12 60.16 10.24l30.72 30.72c15.36 15.36 39.68 15.36 55.04 0l55.04-55.04c15.36-15.36 15.36-39.68 0-55.04l-30.72-30.72c-15.36-15.36-20.48-39.68-10.24-60.16l25.6-65.28c5.12-20.48 30.72-35.84 49.92-35.84l44.8 0c25.6 0 39.68-20.48 39.68-39.68l10.24 0 0-75.52C1017.6 449.28 997.12 433.92 977.92 433.92zM514.56 701.44c-104.96 0-190.72-85.76-190.72-190.72s85.76-190.72 190.72-190.72c104.96 0 190.72 85.76 190.72 190.72S619.52 701.44 514.56 701.44z" fill="#636363"></path></svg>');
  }
  #search #group-list li.setting:hover:before{
    background-image: url('data:image/svg+xml;charset=UTF-8,<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M977.92 433.92l-44.8 0c-20.48 0-44.8-15.36-49.92-35.84l-25.6-65.28c-10.24-20.48-5.12-44.8 10.24-60.16l30.72-30.72c15.36-15.36 15.36-39.68 0-55.04l-55.04-55.04c-15.36-15.36-39.68-15.36-55.04 0l-30.72 30.72c-15.36 15.36-39.68 20.48-60.16 10.24l-65.28-25.6c-20.48-5.12-35.84-30.72-35.84-49.92L596.48 52.48c0-25.6-20.48-39.68-39.68-39.68l-75.52 0c-25.6 0-39.68 20.48-39.68 39.68L441.6 102.4c0 20.48-15.36 44.8-35.84 49.92l-65.28 25.6c-20.48 10.24-44.8 5.12-60.16-10.24L238.08 128c-15.36-15.36-39.68-15.36-55.04 0l-55.04 55.04c-15.36 15.36-15.36 39.68 0 55.04l30.72 30.72c15.36 15.36 20.48 39.68 10.24 60.16l-25.6 65.28c-5.12 20.48-30.72 35.84-49.92 35.84L46.08 430.08c-25.6 0-39.68 20.48-39.68 39.68l0 75.52c0 25.6 20.48 39.68 39.68 39.68l44.8 0c20.48 0 44.8 15.36 49.92 35.84l25.6 65.28c10.24 20.48 5.12 44.8-10.24 60.16l-30.72 30.72c-15.36 15.36-15.36 39.68 0 55.04l55.04 55.04c15.36 15.36 39.68 15.36 55.04 0l30.72-30.72c15.36-15.36 39.68-20.48 60.16-10.24l65.28 25.6c20.48 5.12 35.84 30.72 35.84 49.92L427.52 972.8c0 25.6 20.48 39.68 39.68 39.68l75.52 0c25.6 0 39.68-20.48 39.68-39.68l0-44.8c0-20.48 15.36-44.8 35.84-49.92l65.28-25.6c20.48-10.24 44.8-5.12 60.16 10.24l30.72 30.72c15.36 15.36 39.68 15.36 55.04 0l55.04-55.04c15.36-15.36 15.36-39.68 0-55.04l-30.72-30.72c-15.36-15.36-20.48-39.68-10.24-60.16l25.6-65.28c5.12-20.48 30.72-35.84 49.92-35.84l44.8 0c25.6 0 39.68-20.48 39.68-39.68l10.24 0 0-75.52C1017.6 449.28 997.12 433.92 977.92 433.92zM514.56 701.44c-104.96 0-190.72-85.76-190.72-190.72s85.76-190.72 190.72-190.72c104.96 0 190.72 85.76 190.72 190.72S619.52 701.44 514.56 701.44z" fill="#fff"></path></svg>');
  }

  #wrap[searching] .ext-list li{
    opacity: .1 !important;
    -webkit-filter: grayscale(1);
    filter: grayscale(1);
  }
  #wrap[searching] #search .searchEmpty{
    display: block;
  }

  #wrap[searching] .ext-list li[searched]::before{
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
  #wrap[searching] .ext-list li[searched]{
    -webkit-filter: grayscale(0) !important;
    filter: grayscale(0) !important;
    opacity: 1 !important;
  }
  #wrap[searching] #search .searcher{
    border-left-color: #5c5e6f;
  }
  .icon-size-3 .ext-list li[data-mark] i{
    right: -7px;
  }

  .dinginess li{
    opacity: .2 !important;
  }

  .icon-size-1 .ext-list li{
    background-size: 38px;
  }
  .icon-size-2 .ext-list li{
    background-size: 44px;
  }
  .icon-size-3 .ext-list li{
    background-size: 50px;
  }
  .icon-size-3 .ext-list li[locked]::after{
    top: -3px;
    right: -3px;
  }

  #showList {
    border-bottom: 2px dotted #E6E6E6;
    padding: 0 0 10px 0;
    margin: 0 0 10px 0;
  }

  #showList .empty{
    float: unset;
    display: block;
    width: 97%;
    height: 56px;
    line-height: 56px;
    margin: 40px auto 20px auto;

    font-size: 20px;
    font-weight: 200;
    color: #bbb;
    text-align: center;

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

  #allEmptyTips{
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 99;
    background-color: #fff;
  }
  #allEmptyTips .title{
    display: block;
    font-size: 2.2em;
    text-align: center;
    line-height: 54px;
    color: #c7c7c7;
  }
  #allEmptyTips .desc{
    display: block;
    font-size: 1.1em;
    text-align: center;
    height: 20px;
    line-height: 20px;
    color: #d8d8d8;
  }
  #allEmptyTips .desc a{
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
    height: 24px;
    line-height: 24px;
    font-size: 14px;
    color: #fff;
    text-transform: capitalize;
    white-space: nowrap;

    padding: 0 6px;
    border: none;
    border-radius: 2px;
    background-color: #5c5e6f;
    opacity: 0;

    overflow: hidden;
    text-overflow: ellipsis;
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
  [data-lan=ru] #rightMenu{
    width: 210px;
  }
  #rightMenu ul{
    width: 100%;
    height: 100%;
  }
  #rightMenu ul li{
    height: 26px;
    line-height: 26px;
    width: 50%;
    float: left;

    font-size: 12px;
    color: #fff;
    text-align: center;
    list-style: none;
    cursor: default;
    box-shadow: inset 0px 0px 0px 0.1px #fff;
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

  .showInfoRight{
    display: block !important;
    animation: moveShowInfoRight .2s ease-in-out forwards;
    -webkit-animation: moveShowInfoRight .2s ease-in-out forwards;
  }
  @keyframes moveShowInfoRight {
    from {
      transform: translate3d(-20px, 0, 0);
      opacity: 0;
    }
    to {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }
  }
  @-webkit-keyframes moveShowInfoRight {
    from {
      -webkit-transform: translate3d(-20px, 0, 0);
      opacity: 0;
    }
    to {
      -webkit-transform: translate3d(0, 0, 0);
      opacity: 1;
    }
  }
  .showInfoLeft{
    display: block !important;
    animation: moveShowInfoLeft .2s ease-in-out forwards;
    -webkit-animation: moveShowInfoLeft .2s ease-in-out forwards;
  }
  @keyframes moveShowInfoLeft {
    from {
      transform: translate3d(20px, 0, 0);
      opacity: 0;
    }
    to {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }
  }
  @-webkit-keyframes moveShowInfoLeft {
    from {
      -webkit-transform: translate3d(20px, 0, 0);
      opacity: 0;
    }
    to {
      -webkit-transform: translate3d(0, 0, 0);
      opacity: 1;
    }
  }
</style>
