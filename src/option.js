import Vue from 'vue'
import App from './Option.vue'

let vm = new Vue({
  el: '#app',
  render: h => h(App)
})

// 禁用页面缩放
chrome.tabs.getCurrent(function(obj){
  chrome.tabs.getZoomSettings(obj.id, function(settingObj){
    if(settingObj.mode !== "disabled"){
      chrome.tabs.setZoom(1);
      chrome.tabs.setZoomSettings(obj.id, {"mode": "disabled"}, function(){})
    }
  })
})