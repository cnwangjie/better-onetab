<template>
  <div id="option">
    <div id="_TOOLS_STATUS__" :class="tips.show ? 'tips show' : 'tips'">{{tips.content}}</div>
    <div class="list">
      <h1>
        <span id="showCols">{{i18n.showCols}}</span>
        <span id="js-sel-column-show">{{showWindowSize}}</span>
      </h1>
      <p>
        <input type="range" class="range-style" min="4" max="9" step="1" :value="showWindowSize" @input="changeWindowSize">
      </p>
    </div>
    <div class="list">
      <h1>
        <span id="iconSize">{{i18n.iconSize}}</span>
        <span id="js-icon-size-show">{{getShowIconSize}}</span>
      </h1>
      <p>
        <input type="range" class="range-style" id="js-icon-size" min="1" max="3" step="1" :value="showIconSize" @input="changeIconSize">
      </p>
    </div>
    <div class="list">
      <h1><span id="speedManageName">{{i18n.speedManageName}}</span></h1>
      <p class="describe" id="speedManageDesc">{{i18n.speedManageDesc}}</p>
      <img src="icon/play-demo.png" id="playDemo">
      <p class="describe" style="margin: 30px 0 0 0;" id="speedManageLock">{{i18n.speedManageLock}}</p>
      <ul id="_PLUGINS_LIST_" class="list-plugins gclearfix"></ul>
    </div>
    <div class="list">
      <h1 id="rankName">{{i18n.rankName}}</h1>
      <ul class="radio-btn">
        <li>
          <label>
            <input type="radio" name="ext_sort" value="name" v-model="sortType" @click="changeSortType('name')">
            <span class="radio-btn-input"></span>
            <span id="sortByName">{{i18n.sortByName}}</span>
          </label>
        </li>
        <li>
          <label>
            <input type="radio" name="ext_sort" value="rank" v-model="sortType" @click="changeSortType('rank')">
            <span class="radio-btn-input"></span>
            <span>{{i18n.sortByRank}}</span>
          </label>
          <button @click="resetRank">{{i18n.rankBtn}}</button>
        </li>
      </ul>
    </div>

    <div class="list">
      <h1>{{i18n.rightMoreName}}</h1>
      <switch-btn data-key="right_more"></switch-btn>
      <p class="describe">{{i18n.rightMoreDesc}}</p>
    </div>
    
    <div class="list">
      <h1>{{i18n.showBadgeName}}</h1>
      <switch-btn data-key="show_badge"></switch-btn>
      <p class="describe">{{i18n.showBadgeDesc}}</p>
    </div>
    
    <div class="list">
      <h1>{{i18n.showExtName}}</h1>
      <switch-btn data-key="show_extname"></switch-btn>
      <p class="describe">{{i18n.showExtNameDesc}}</p>
    </div>

    <div class="list">
      <h1>{{i18n.otherName}}</h1>
      <p class="describe" v-html="i18n.otherDesc"></p>
      <br>
      <p class="describe">{{i18n.otherDonate}}</p>
      <ul id="otherDonateList" class="gclearfix">
        <li>
          <a href="https://www.paypal.me/chevionlu" target="_blank">
            <img src="assets/pay/pay-paypal.png">
          </a>
        </li>
        <li>
          <img src="assets/pay/pay-wx.png">
        </li>
        <li>
          <img src="assets/pay/pay-alipay.png">
        </li>
      </ul>
    </div>
  </div>
</template>


<script>
import getI18n from "./lib/i18n"
import ExtItem from "./components/ExtItem"
import SwitchBtn from "./components/SwitchBtn"
import * as Storage from "./lib/storage"
import * as Extension from "./lib/extension"
import * as Util from "./lib/util"

export default {
  data() {
    return {
      // 国际化对象
      i18n: getI18n(),
      enabledExtList: [],
      enabledExtListDinginess: false,
      disabledExtList: [],
      disabledExtListDinginess: false,
      extName: {
        showClass: "",
        left: 0,
        right: "unset",
        top: 0,
        backgroundColor: "#000",
        content: "",
        adviseMaxWidth: 200
      },
      group: {
        index: 0,
        list: [
          {
            name: "",
            lock: {}
          }
        ],
        show: false
      },
      showIconSize: 2,
      showWindowSize: 6,
      tips: {
        show: false,
        content: ''
      },
      sortType: 'name'
    }
  },
  components: {
    ExtItem,
    SwitchBtn
  },
  computed: {
    getShowWindowSize() {
      const WindowSizeByColum = {
        6: 496,
        7: 572,
        8: 648,
        9: 724
      };
      return WindowSizeByColum[this.showWindowSize] || WindowSizeByColum["6"];
    },
    getShowIconSize() {
      const IconSizeShowText = {
				1: this.i18n.sizeSmall,
				2: this.i18n.sizeNormal,
				3: this.i18n.sizeBig
      }
      return IconSizeShowText[this.showIconSize]
    }
  },
  
  methods: {
    resetRank(e){
      Storage.remove('_rankList_')
      this.showTips(this.i18n['tipResetRank'])
    },
    changeWindowSize(e) {
      let newSize = e.target.value
      this.showWindowSize = newSize
      Storage.set("_showColumn_", newSize)
    },
    changeIconSize(e) {
      let newSize = e.target.value
      this.showIconSize = newSize
      Storage.set("_showIconSize_", newSize)
    },
    changeSortType(value) {
      if (this.sortType !== value) {
        this.sortType = value
        Storage.set('_radio_ext_sort_', value)
      }
    },
    // 提示组件
    showTips(text){
      let that = this
      if(text){
        that.tips.show = true
        that.tips.content = text
        setTimeout(function(){
          that.tips.show = false
          that.tips.content = ''
        },1000)
      }
    }
  },

  beforeCreate() {
    // 对象外置，用于调试
    window.__vm__ = this;
  },

  // 初始化
  beforeMount() {
    document.title = `${this.i18n["optionName"]} - ${this.i18n["extName"]}`
    Storage.getAll().then(storage => {
      if (Storage.get('_radio_ext_sort_') === 'rank') {
        this.sortType = 'rank'
      }
    })
  }
}
</script>



<style>
.gclearfix:after {
  display: block;
  clear: both;
  visibility: hidden;
  height: 0;
  content: "";
}
.gclearfix {
  zoom: 1;
}
* {
  padding: 0;
  margin: 0;
  font-family: arial, sans-serif;
  text-rendering: geometricPrecision;
  -webkit-user-select: none;
  user-select: none;
}
[data-lan^="zh_"] * {
  font-family: "Lantinghei SC", "Open Sans", Arial, "Hiragino Sans GB",
    "Microsoft YaHei", "STHeiti", "WenQuanYi Micro Hei", SimSun, sans-serif;
}
body {
  padding: 20px;
}
button,
select {
  width: 80px;
  height: 30px;
  line-height: 30px;
  display: inline-block;
  background: #25b75a;
  color: #fff;
  border-radius: 2px;
  border: none;
  font-size: 14px;
  outline: none;
  cursor: pointer;
  border: 1px solid #439e64;
  margin: 10px 10px 0 0;
  letter-spacing: 1px;
  vertical-align: middle;
}
button:hover,
select:hover {
  background: #1fab52;
}
.list {
  background: #efefef;
  margin: 30px 20px;
  padding: 20px;
  border-radius: 2px;
  -webkit-transition: 0.3s ease-in-out;
  transition: 0.3s ease-in-out;
}
.list h1 {
  font-size: 26px;
  font-weight: normal;
  line-height: 48px;
}

.list .list-plugins {
  list-style: none;
  margin: 20px 0 0 0;
}
.list .list-plugins li {
  height: 40px;
  width: 40px;
  float: left;
  margin: 0 20px 20px 0;
}
.list .list-plugins li[locked] {
  position: relative;
}
.list .list-plugins li[locked] img {
  opacity: 0.3;
  -webkit-filter: grayscale(1);
  filter: grayscale(1);
}
.list .list-plugins li[locked]:after {
  position: absolute;
  top: -3px;
  right: -3px;
  z-index: 999;
  content: "";
  display: block;
  height: 6px;
  width: 6px;
  border-radius: 10px;
  border: 3px solid #5c5e6f;
  box-shadow: 0px 0px 0px 1px #fff;
  background: #46d5fe;
}
.list .list-plugins li img {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.tips {
  font-family: MicrosoftYahei;
  color: rgb(255, 255, 255);
  padding: 0px 20px;
  text-align: center;
  width: 250px;
  font-size: 20px;
  position: fixed;
  top: -38px;
  left: 50%;
  margin-left: -125px;
  z-index: 9999999;
  transition: 0.2s;
  -webkit-transition: 0.2s;
  opacity: 0;
  cursor: pointer;
  height: 36px;
  line-height: 36px;
  background: #25b75a;
  border: 1px solid #439e64;
}
.tips.show {
  opacity: 1;
  top: 0;
}
[data-lan="ja"] .tips {
  width: 300px;
  margin-left: -150px;
}
ul li {
  font-size: 16px;
  line-height: 30px;
  color: #636363;
  margin: 0 0 0 18px;
}
p.describe {
  font-size: 16px;
  margin: 20px 0 0 0;
  color: #636363;
}
p.describe a {
  font-weight: bold;
  color: #25b75a;
}
p.describe img {
  border-radius: 2px;
  border: 1px solid #dcdcdc;
}
ul li em {
  background: #e2e2e2;
  border-radius: 4px;
  font-style: normal;
  padding: 1px 4px;
  margin: 0 3px;
}

.range-style {
  width: 260px;
  height: 4px;
  background: rgba(37, 183, 90, 0.8);
  border: 1px solid #439e64;
  -webkit-border-radius: 4px;
  -webkit-appearance: none !important;
  outline: none;
  margin: 10px 0 0 0;
}

.range-style::-webkit-slider-thumb {
  width: 24px;
  height: 24px;
  cursor: pointer;

  background: -webkit-gradient(
    linear,
    left top,
    left bottom,
    from(#fff),
    to(#ccc)
  );

  border: 1px solid #666;
  -webkit-box-shadow: 0 0 6px #666;
  -webkit-border-radius: 14px;
  -webkit-appearance: none !important;
}


.radio-btn li {
  list-style: none;
  height: 40px;
  line-height: 40px;
  vertical-align: middle;
  margin: 0;
}
.radio-btn li label {
  display: inline-block;
  position: relative;
  padding: 0 0 0 38px;
  cursor: pointer;
}
.radio-btn li label input[type="radio"] {
  display: none;
}
.radio-btn li label .radio-btn-input {
  position: absolute;
  left: 0;
  top: 5px;

  display: block;

  width: 30px;
  height: 30px;
  line-height: 30px;
  border-radius: 30px;

  background-repeat: no-repeat;
  background-size: 20px;
  background-position: center;
  background-color: #dcdcdc;
  background-image: url('data:image/svg+xml;charset=UTF-8,<svg width="13px" height="8px" viewBox="0 0 13 8" version="1.1" xmlns="http://www.w3.org/2000/svg"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-4.000000, -7.000000)" stroke="#FFFFFF"><polyline id="Check" points="5 11.5 6.90087891 13.4008789 8.5 15 16.5 7"></polyline></g></g></svg>');

  -webkit-transition: 0.3s ease-in-out;
  transition: 0.3s ease-in-out;
}
.radio-btn li input[type="radio"]:checked + .radio-btn-input {
  background-color: #25b75a;

  -webkit-animation: 0.4s switch-radio;
  animation: 0.4s switch-radio;
}
@-webkit-keyframes switch-radio {
  from {
    -webkit-transform: scale(1);
  }
  50% {
    -webkit-transform: scale(0.8);
  }
  80% {
    -webkit-transform: scale(1.1);
  }
  to {
    -webkit-transform: scale(1);
  }
}
@keyframes switch-radio {
  from {
    transform: scale(1);
  }
  50% {
    transform: scale(0.8);
  }
  80% {
    transform: scale(1.1);
  }
  to {
    transform: scale(1);
  }
}
.radio-btn li button {
  margin: 0 0 0 10px;
}

#playDemo {
  border: 3px solid #d2d2d2;
  border-radius: 6px;
  margin: 10px 0 0 0;
  width: 200px;
  cursor: pointer;

  -webkit-transition: 0.3s ease-in-out;
  transition: 0.3s ease-in-out;
}

#otherDonateList {
  margin: 20px 0;
}
#otherDonateList li {
  list-style: none;
  float: left;
  width: 160px;
  height: 195px;
  margin: 0 20px 0 0;
  border-radius: 4px;
  overflow: hidden;
}
#otherDonateList li img {
  width: 100%;
}
</style>
