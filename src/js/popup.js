(function() {
	
	// 显示标题处理
	document.title = chrome.i18n.getMessage("extName")
	
	var showList = $('#showList');
	var hideList = $('#hideList');
	var wrap = $('#wrap');

	var ratio_col = {
		3: 228,
		4: 304,
		5: 380,
		6: 456,
		7: 532,
		8: 608,
		9: 684
	};
	// 设置popup页面宽度
	wrap.width(ratio_col[localStorage.getItem('_showColumn_')]);
	
	var iconSize = localStorage.getItem('_showIconSize_') || 2;
	wrap.addClass("icon-size-" + iconSize);
	

	function refreshPlugin() {
		
		var listArrLocked = getPluginsByLocked();
		
		chrome.management.getAll(function(list) {
			var showListHtmlArr = [];
			// 显示的扩展分为被锁定的和未被锁定的，用于排序调整
			var showAndLockedListHtmlArr = [];
			var hideListHtmlArr = [];
			for (var i = 0; i < list.length; i++) {
				var obj = list[i];

				// 将当前扩展排除在外
				if (obj.id === chrome.app.getDetails().id || obj.type === "theme") {
					continue;
				}

				// 统一处理图标
				var img = "";
				if (obj.icons) {
					img = obj.icons[obj.icons.length - 1].url;
				}

				var locked = "";
				if (listArrLocked && listArrLocked[obj.id] == 1) {
					locked = "locked"
				}

				var objStr = '<li data-id="' + obj.id + '" data-optionurl="'+ obj.optionsUrl +'" data-name="' + obj.shortName + '" style="background-image:url('+ img +')" '+locked+'></li>';

				// 根据扩展的状态，分别插入到不同的队列中
				if (obj.enabled === false) {
					hideListHtmlArr.push(objStr);
				} else {
					if(locked === "locked"){
						showAndLockedListHtmlArr.unshift(objStr);
					}else{
						showListHtmlArr.push(objStr);
					}
				}

			}

			if(!localStorage.getItem("_switch_rank_sort_")){
				showListHtmlArr.sort(function(b, a) {
					return RankStorage.get($(a).data("id")) - RankStorage.get($(b).data("id"));
				});
				hideListHtmlArr.sort(function(b, a) {
					return RankStorage.get($(a).data("id")) - RankStorage.get($(b).data("id"));
				});
			}
			
			// 合并被锁定+未锁定的，始终让被锁定的扩展在前面
			var showListAllArr = showAndLockedListHtmlArr.concat(showListHtmlArr);

			showList.html(showListAllArr.join(""));
			if(hideListHtmlArr.length === 0){
				showList.addClass("hideListIsNull");
				if(showListAllArr.length === 0){
					wrap.addClass("allListIsEmpty");
				}
			}
			hideList.html(hideListHtmlArr.join(""));
			
			setTimeout(function(){
				$("body").css("background", "#fff");
				wrap.height(wrap.height()+1)
			}, 200);
			
			// 角标处理
			addIconBadge()
		});
	}
	// 启动默认执行
	refreshPlugin();
	
	
	/**
	 * [addIconBadge 给扩展图标添加角标，针对未加锁需要平时关闭的]
	 * @param {[type]} showListIdArr [description]
	 */
	function addIconBadge(){
		if(!localStorage.getItem("_switch_show_badge_")){
			var lockedListObj = getPluginsByLocked();
			var unlockCount = 0;
			
			$("#showList li").each(function(index, item){
				var id = $(item).data("id");
				if(lockedListObj[id] !== "1"){
					unlockCount++;
				}
			})
			
			if(unlockCount === 0){
				chrome.browserAction.setBadgeText({text: ""});
			}else{
				chrome.browserAction.setBadgeBackgroundColor({color: "#f44336"})
				chrome.browserAction.setBadgeText({text: unlockCount+""});
			}
		}
	}


	var RankStorage = {
		// 存储标识
		_key: "_rankList_",
		_getLocalStorage: function() {
			var storageStr = localStorage.getItem(this._key),
				storageObj = null;
			if (storageStr) {
				storageObj = JSON.parse(storageStr);
				return storageObj;
			} else {
				return {};
			}
		},
		_setLocalStorage: function(obj) {
			localStorage.setItem(this._key, JSON.stringify(obj));
		},

		// 通过id获取该扩展的rank值
		get: function(id) {
			var storageObj = this._getLocalStorage();
			if (storageObj && storageObj[id]) {
				return parseInt(storageObj[id]);
			} else {
				return 0;
			}
		},

		// 调用该方法默认给扩展的rank+1
		setRank: function(id) {
			var storageObj = this._getLocalStorage();
			if (storageObj) {
				var rank = storageObj[id];
				if (rank) {
					storageObj[id] = parseInt(storageObj[id]) + 1;
				} else {
					storageObj[id] = 1;
				}
				this._setLocalStorage(storageObj);
			}
		}
	};

	/**
	 * [扩展图标点击]
	 */
	wrap.on('click', 'li', function() {
		var t = $(this),
			id = t.data('id'),
			// 当前状态被禁用，通过点击后开启
			isDisabled = t.closest('#hideList').length === 1;

		if (id) {
			if (isDisabled) {
				showList.append(t);
				RankStorage.setRank(id);
			} else {
				hideList.append(t);
			}
			
			if(hideList.find("li").length === 0){
				showList.addClass("hideListIsNull");
			}else{
				showList.removeClass("hideListIsNull");
			}
			
			chrome.management.setEnabled(id, isDisabled, function() {
				// 更新两个容器的显示状态
				// refreshPlugin();
			});
		}
		
		// 针对角标的处理
		addIconBadge();
	});


	/**
	 * [扩展图标鼠标滑过特效]
	 */
	var $extName = $('#extName');
	var isShowExtName = localStorage.getItem("_switch_show_extname_") !== "close";
	// 根据图标大小，设置间距的阀值
	var extNameXDistance = {
		"1": 16,
		"2": 20,
		"3": 24
	}
	wrap.on("mouseenter", "li", function() {
		var t = $(this);
		
		if(isShowExtName){
			// 处理该扩展的内容和位置
			var t_offset = t.offset();
			var extNameXStart = t_offset.left + 50 - 10;
			var extNameXEnd = extNameXStart + extNameXDistance[iconSize];
			var extWidth = $extName.html(t.attr("data-name")).outerWidth();
			// 判断显示扩展名称后是否会超过页面边界		
			if($("body").width() < extWidth + extNameXEnd){
				extNameXStart = t_offset.left - extWidth + 10;
				extNameXEnd = extNameXStart - extNameXDistance[iconSize];
			}
			// 设置动画前的位置
			$extName.css({
				"top": t_offset.top + 15,
				"left": extNameXStart
			})
		}
		
		window["timer_"+t.data('id')] = setTimeout(function(){
			t.addClass('hover');
			
			// 为扩展名称添加动画属性，并设置最终的显示位置
			if(isShowExtName){
				$extName.addClass("extName-anim").css({
					"left": extNameXEnd,
					"opacity": 1
				});
			}
			
		}, 100);
	}).on("mouseleave", "li", function() {
		
		// 初始化扩展名称
		if(isShowExtName){
			$extName.removeClass("extName-anim").attr("style", "").empty();
		}
		
	   var t = $(this);
	   t.removeClass('hover');
	   clearTimeout(window["timer_"+t.data('id')]);
   });


	/**
	 * [getPluginsByLocked 取出存储的锁定id列表]
	 * @return {[type]} [description]
	 */
	function getPluginsByLocked() {
		var idListStorage = localStorage.getItem("_lockList_");

		if (idListStorage) {
			return JSON.parse(idListStorage);
		} else {
			return null;
		}
	}

	/**
	 * [一键关闭全部扩展]
	 */
	$('body').on('dblclick', function() {
		var _showList = showList.find('li');
		_showList.each(function(index, ele) {
			var t = $(ele);
			var id = t.data('id');
			if (t.attr("locked") === "") {
				return;
			}
			hideList.append(t);
			chrome.management.setEnabled(id, false, function() {
				// refreshPlugin();
			});
		});

		// 去掉角标
		chrome.browserAction.setBadgeText({text:""})
		
	});


	/**
	 * [右击图标功能]
	 * @param  {[type]} e){return false;} [description]
	 * @return {[type]} [description]
	 */
	if(!localStorage.getItem("_switch_right_click_")){
		var operRightClick = localStorage.getItem("_rightClick_") || "uninstall";
		$(document).on("mousedown", "#hideList>li, #showList>li", function(e) {
			if (e.button === 2) {
				// 卸载扩展
				if(operRightClick == 'uninstall'){
					chrome.management.uninstall($(this).data("id"), function() {
						refreshPlugin();
					});
				}else if(operRightClick == 'lock'){

				}else if(operRightClick == 'option'){
					var url = $(this).data('optionurl');
					if(url){
						window.open(url)
					}
				}
			}
		});
	}
	$(document).on("contextmenu", function(e) {
		// e.preventDefault();
		return false;
	});
})();
