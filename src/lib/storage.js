/**
 * 将之前记录在localStorage本地的数据迁移至同步存储中
 */
if(window.localStorage && localStorage.getItem("sync") !== "true"){
	var i = -1;
	var obj = {};
	while (i++, localStorage.key(i)) {
		var key = localStorage.key(i);
		var value = localStorage.getItem(key);
		var value_obj = value;
		if(value){
			try{
				value_obj = JSON.parse(value);
			}catch (error){}
			obj[key] = value_obj;
		}
	}
	chrome.storage.sync.set(obj, function(){});
	localStorage.clear();

	localStorage.setItem("sync", "true");
}


/**
 * Chrome远程数据存储器
 */
window["Storage"] = null;
chrome.storage.sync.get(function(obj) {
	window["Storage"] = {

		// 异步取出所有数据缓存至内存对象中
		allStorageObj: obj,

		// 获取
		get: function(key){
			return this.allStorageObj[key];
		},

		// 设置
		set: function(key, value){
			this.allStorageObj[key] = value;
			chrome.storage.sync.set(this.allStorageObj, function(){});
		},

		// 删除
		remove: function(key){
			delete this.allStorageObj[key];
			chrome.storage.sync.remove(key, function(){});
		}
	}
});


/**
 * 提前将扩展数据读取出来
 */
window["Extension"] = null;
chrome.management.getAll(function(obj){
	window["Extension"] = obj;
});


/**
 * 任务订阅处理器，当订阅的参数有值后就执行回调
 * @param {*} checker，必须是挂在window下的key字符串值
 * @param {*} callback 
 */
window.SubTask = function(checker, callback){
	// 绘制定时器
	var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
	var cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame;

	var initDataID = null;
	var init = function(){
		if(window[checker]){
			callback && callback(window[checker]);
		}else{
			initDataID = requestAnimationFrame(init);
		}
	}
	init();
}


// 将老版本的内容进行归类分组
// SubTask("Storage", function(Storage){
// 	const groupInfo = {
// 		'默认分组': ['aomjjhallfgjeglblehebfpbcfeobpgk']
// 	}
// })
