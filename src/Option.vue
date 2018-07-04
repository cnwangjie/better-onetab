<template>
  <div id="option">
    <!-- Tips -->
    <div id="_TOOLS_STATUS__" :class="tips.show ? 'tips show' : 'tips'">{{tips.content}}</div>

    <!-- 设置显示列数 -->
    <div class="list">
      <h1>
        <span>{{i18n.showCols}}</span>
        <span>{{showWindowSize}}</span>
      </h1>
      <p>
        <input type="range" class="range-style" min="6" max="9" step="1" :value="showWindowSize" @input="changeWindowSize">
      </p>
    </div>

    <!-- 设置图标显示大小 -->
    <div class="list">
      <h1>
        <span>{{i18n.iconSize}}</span>
        <span>{{getShowIconSize}}</span>
      </h1>
      <p>
        <input type="range" class="range-style" min="1" max="3" step="1" :value="showIconSize" @input="changeIconSize">
      </p>
    </div>

    <!-- 配置分组 -->
    <div class="list" id="group">
      <h1><span>{{i18n.optionGroupTitle}}</span></h1>
      <p class="describe">{{i18n.optionGroupDesc}}</p>
      <p class="describe" style="margin: 30px 0 0 0;">{{i18n.optionGroupOperat}}</p>
      <ul class="group-list gclearfix">
        <li v-for="(item, index) in group.list" :class="index === group.index ? 'cur' : ''" @click="selectGroup(index)">
          {{item.name}}
          <i class="group-del" @click.stop="deleteGroup(index)"></i>
          <i class="group-mod" @click.stop="modifyGroup(index)"></i>
        </li>
        <li class="group-add" @click="addGroup">
          <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M939.939489 459.072557 562.339502 459.072557 562.339502 83.519182 462.055494 83.519182 462.055494 459.072557 84.455507 459.072557 84.455507 559.356564 462.055494 559.356564 462.055494 939.003164 562.339502 939.003164 562.339502 559.356564 939.939489 559.356564Z" fill="#636363"></path></svg>
        </li>
      </ul>
      <ext-item :data-list="getAllExtList">
        <template slot="empty">
          <li class="empty" v-if="getAllExtList.length === 0">{{i18n.emptyShowListCon}}</li>
        </template>
      </ext-item>
    </div>
    
    <!-- 设置扩展图标排序 -->
    <div class="list">
      <h1>{{i18n.rankName}}</h1>
      <ul class="radio-btn">
        <li>
          <label>
            <input type="radio" name="ext_sort" value="name" v-model="sortType" @click="changeSortType('name')">
            <span class="radio-btn-input"></span>
            <span>{{i18n.sortByName}}</span>
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

    <!-- 是否开启右键 -->
    <div class="list">
      <h1>{{i18n.rightMoreName}}</h1>
      <switch-btn data-key="right_more"></switch-btn>
      <p class="describe">{{i18n.rightMoreDesc}}</p>
    </div>
    
    <!-- 是否显示角标 -->
    <div class="list">
      <h1>{{i18n.showBadgeName}}</h1>
      <switch-btn data-key="show_badge"></switch-btn>
      <p class="describe">{{i18n.showBadgeDesc}}</p>
    </div>
    
    <!-- 是否显示扩展名称 -->
    <div class="list">
      <h1>{{i18n.showExtName}}</h1>
      <switch-btn data-key="show_extname"></switch-btn>
      <p class="describe">{{i18n.showExtNameDesc}}</p>
    </div>

    <!-- 捐赠 -->
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
    <canvas id="getColorByCanvas" style="display: none;"></canvas>
  </div>
</template>


<script>
import getI18n from "./lib/i18n";
import ExtItem from "./components/ExtItem";
import SwitchBtn from "./components/SwitchBtn";
import * as Storage from "./lib/storage";
import * as Extension from "./lib/extension";

export default {
  data() {
    return {
      // 国际化对象
      i18n: getI18n(),
      extList: [],
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
      showWindowSize: 7,
      tips: {
        show: false,
        content: ""
      },
      sortType: "name"
    };
  },
  components: {
    ExtItem,
    SwitchBtn
  },
  computed: {
    getAllExtList() {
      return this.extList.map(item => {
        if (this.group.list[this.group.index].lock[item.id]) {
          item.isLocked = true
        } else {
          item.isLocked = false
        }
        return item
      })
    },
    getShowWindowSize() {
      const WindowSizeByColum = {
        6: 496,
        7: 572,
        8: 648,
        9: 724
      }
      // 默认情况下是6列
      return WindowSizeByColum[this.showWindowSize] || WindowSizeByColum["6"]
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
    modifyGroup(index) {
      this.group.index = index

      let that = this
      setTimeout(() => {
        var newName = prompt(this.i18n.optionGroupModifyName) || 'New Group'
        if (newName.trim()) {
          this.group.list[index].name = newName
          Storage.set('_group_', that.group)
        }
      }, 100)
    },
    deleteGroup(index) {
      this.group.index = index
      
      let that = this
      setTimeout(() => {
        if (confirm(this.i18n.optionGroupDelete)) {
          if (that.group.list.length === 1) {
            this.showTips(this.i18n.optionGroupDeleteAtLeaseOne)
          } else {
            that.group.index = index - 1 < 0 ? 0 : index - 1
            that.group.list.splice(index, 1)
            Storage.set('_group_', that.group)
          }
        }
      }, 100);
    },
    selectGroup(index) {
      this.group.index = index
    },
    extClick(item) {
      let listObj = this.group.list[this.group.index]
      if (item.isLocked) {
        delete listObj.lock[item.id]
      } else {
        listObj.lock[item.id] = 1
      }
      this.group.list.splice(this.group.index, 1, listObj)
      Storage.set('_group_', this.group)
      this.showTips(this.i18n.tipSetSuc)
    },
    addGroup() {
      this.group.list.push({
        name: this.i18n.newGroupName,
        lock: {}
      })
      this.group.index = this.group.list.length - 1
      Storage.set('_group_', this.group)
    },
    // 重置点击生成的rank
    resetRank(e) {
      Storage.remove("_rankList_")
      this.showTips(this.i18n.tipResetRank)
    },

    // 更改扩展显示列数
    changeWindowSize(e) {
      let newSize = e.target.value
      this.showWindowSize = newSize
      Storage.set("_showColumn_", newSize)
      this.showTips(this.i18n.tipSetSuc)
    },

    // 更改显示图标大小
    changeIconSize(e) {
      let newSize = e.target.value
      this.showIconSize = newSize
      Storage.set("_showIconSize_", newSize)
      this.showTips(this.i18n.tipSetSuc)
    },

    // 更改扩展排序
    changeSortType(value) {
      if (this.sortType !== value) {
        this.sortType = value;
        Storage.set("_radio_ext_sort_", value)
        this.showTips(this.i18n.tipSetSuc)
      }
    },

    // 提示组件
    showTips: (function() {
      let timer = null
      return function(text, timenum = 1500) {
        if (text) {
          clearTimeout(timer)
          window.vm.tips.show = true
          window.vm.tips.content = text
          timer = setTimeout(function() {
            window.vm.tips.show = false
            setTimeout(() => {
              window.vm.tips.content = ""
            }, 100)
          }, timenum)
        }
      }
    })()
  },

  // 初始化
  beforeMount() {
    // 设置标题
    document.title = `${this.i18n["optionName"]} - ${this.i18n["extName"]}`;

    window.vm = this

    Promise.all([Storage.getAll(), Extension.getAll({needColor: true})]).then((res) => {
      let storage = res[0]

      // 初始化排序数据
      if (Storage.get('_radio_ext_sort_') === "rank") {
        this.sortType = "rank"
      }

      // 初始化扩展显示列数
      let columSize = Storage.get('_showColumn_')
      if (columSize) {
        this.showWindowSize = columSize
      }

      // 初始化扩展图标显示大小
      let extIconSize = Storage.get('_showIconSize_')
      if (extIconSize) {
        this.showIconSize = extIconSize
      }

      // [Init]增加分组功能，兼容老版本问题
      let oldLockObj = Storage.get('_lockList_')
      let group = Storage.get('_group_')
      if (oldLockObj || !group) {
        group = {
          index: 0,
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

      this.extList = res[1]

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
}
body {
  text-rendering: geometricPrecision;
  -webkit-user-select: none;
  user-select: none;
  padding: 20px;
  /* font-family: "Lantinghei SC", "Open Sans", Arial, "Hiragino Sans GB", "Microsoft YaHei", "STHeiti", "WenQuanYi Micro Hei", SimSun, sans-serif; */
  font-family: arial, sans-serif;
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
  font-size: 20px;
  position: fixed;
  top: 0;
  left: 50%;
  z-index: 9999999;
  transition: 0.2s;
  -webkit-transition: 0.2s;
  opacity: 0;
  cursor: pointer;
  height: 36px;
  line-height: 35px;
  background: #25b75a;
  border: 1px solid #439e64;
  transform: translate3d(-50%, -100%, 0);
  -webkit-transform: translate3d(-50%, -100%, 0);
}
.tips.show {
  opacity: 1;
  transform: translate3d(-50%, 0, 0);
  -webkit-transform: translate3d(-50%, 0, 0);
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

.group-list{
  margin-top: 20px;
  margin-bottom: -1px;
}
.group-list li{
  position: relative;
  float: left;
  cursor: pointer;
  list-style: none;
  height: 40px;
  line-height: 40px;
  min-width: 100px;
  text-align: center;
  padding: 0 60px 0 7px;
  background-color: #e0e0e0;
  margin: 0 10px 0 0;
  border: 1px solid #ccc;
  border-radius: 2px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.group-list li:hover{
  background-color: #eaeaea;
}
.group-list li.cur{
  background-color: #fff;
  border-bottom-color: #fff;
}
.group-list .group-mod,
.group-list .group-del{
  position: absolute;
  width: 16px;
  height: 16px;
  top: 50%;
  content: '';
  transform: translate3d(0, -50%, 0);
  -webkit-transform: translate3d(0, -50%, 0);
  background-size: 90%;
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 2px;
  border: 1px solid #bdbdbd;
}
.group-list .group-mod:hover,
.group-list .group-del:hover{
  border-color: #636363;
}
.group-list .group-mod{
  right: 35px;
  background-image: url('data:image/svg+xml;charset=UTF-8,<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M879.04 323.36l-176.8-176.768a64.032 64.032 0 0 0-90.464 0.224l-67.36 67.392 44.864 44.64 0.96-0.192h0.032l176.64 176.576 30.304 30.4 14.848 14.88 66.72-66.72a64 64 0 0 0 0.224-90.432M325.888 815.36l-13.6-13.632-88.32-88.64-14.08-14.144-40.704-43.392L160 645.76v156.128c0 35.136 28.576 63.68 63.68 63.68h154.208l-11.648-11.2-40.352-38.976zM545.024 303.872l-45.248-45.056L179.616 578.976l45.248 45.248 176.544 176.704 45.184 45.024 318.976-318.976-43.936-46.496z" fill="#636363"></path></svg>');
}
.group-list .group-del{
  right: 10px;
  background-image: url('data:image/svg+xml;charset=UTF-8,<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M832 288h-128V202.624C704 182.016 687.232 160 640.128 160h-256.256C336.768 160 320 182.016 320 202.624V288H192a32 32 0 0 0 0 64h224l192 0.032V352h224a32 32 0 0 0 0-64zM384 448a32 32 0 0 1 64 0v210.528a32 32 0 0 1-64 0V448z m192 0a32 32 0 0 1 64 0v210.528a32 32 0 0 1-64 0V448z m32-47.136H224v399.104c0 20.672 9.984 38.848 25.184 50.56 10.784 8.32 24.16 13.472 38.848 13.472h447.936c14.688 0 28.064-5.152 38.88-13.472 15.168-11.712 25.152-29.888 25.152-50.56V400.864h-192z" fill="#636363"></path></svg>');
}

.group-list .group-add{
  position: relative;
  width: 40px;
  padding: 0;
}
.group-list .group-add svg{
  position: absolute;
  width: 60%;
  height: 60%;
  left: 50%;
  top: 50%;
  transform: translate3d(-50%, -50%, 0);
}
.ext-list{
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 2px;
  padding: 10px;
}
.ext-list li:not([locked]){
  opacity: .4 !important;
  -webkit-filter: grayscale(1);
  filter: grayscale(1);
}
.ext-list li.empty{
  width: 100%;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  text-align: center;
  line-height: 50px;
}

.range-style {
  width: 260px;
  height: 4px;
  background: rgba(37, 183, 90, 0.8);
  border: 1px solid #439e64;
  border-radius: 4px;
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
  box-shadow: 0 0 6px #666;
  -webkit-box-shadow: 0 0 6px #666;
  border-radius: 14px;
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
