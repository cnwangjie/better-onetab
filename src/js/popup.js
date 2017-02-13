(function() {
	
	// 显示标题处理
	document.title = chrome.i18n.getMessage("extName")
	
	// 国际化处理
	$("#tips").attr("data-lan", chrome.i18n.getMessage("@@ui_locale"));
	$("#tips .title").html(chrome.i18n.getMessage("tipsTitle"));
	$("#tips .con").html(chrome.i18n.getMessage("tipsCon"));
	$("#rightMenu li.option").html(chrome.i18n.getMessage("rightOption"))
	$("#rightMenu li.uninstall").html(chrome.i18n.getMessage("rightUninstall"))
	$("#rightMenu li.homepage").html(chrome.i18n.getMessage("rightHomepage"))
	
	var tips_url = $("#tips .url");
	tips_url.html(chrome.i18n.getMessage("tipsUrl"));
	// 设置访问Google应用商店的语言
	tips_url.attr("href", tips_url.attr("href") + chrome.i18n.getMessage("@@ui_locale"));
	
	var showList = $('#showList');
	var hideList = $('#hideList');
	var wrap = $('#wrap');
	var isShowExtName = localStorage.getItem("_switch_show_extname_") !== "close";
	var isDisabledRightclick = localStorage.getItem("_switch_right_more_") !== "close";
	var $extName = $('#extName');
	var $rightMenu = $("#rightMenu");

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
				
				var className = "";
				
				if(!obj.icons || obj.icons.length == 0){
					className = "noicon"
				}

				var objStr = '<li class="'+ className +'" data-id="' + obj.id + '" data-homepageurl="' + obj.homepageUrl + '" data-optionurl="'+ obj.optionsUrl +'" data-name="' + obj.shortName + '" style="background-image:url('+ img +')" '+locked+'></li>';
				
				// 配置中是否显示名称，是则需要计算平均色
				// 用最小尺寸的图标进行计算
				if(isShowExtName && obj.icons && obj.icons.length > 0){
					(function(img, obj){
						setTimeout(function(){
							getColor(img, obj.id);
						}, 0);
					})(obj.icons[0].url, obj);
				}

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
				$("body").css("background-color", "#fff");
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
				if(lockedListObj && lockedListObj[id] !== "1"){
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
	wrap.on('click', 'li', function(e) {
		e.preventDefault();
		e.stopPropagation();
		
		var t = $(this),
			id = t.data('id'),
			// 当前状态被禁用，通过点击后开启
			isDisabled = t.closest('#hideList').length === 1;

		if (id) {
			
			t.removeClass("hover");
			
			if (isDisabled) {
				showList.append(t);
				RankStorage.setRank(id);
			} else {
				hideList.append(t);
			}
			
			t.attr("data-leftClick", (new Date)*1);
			
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
	
	
	function initExtNameAndRightClick(){
		var rightLI = $("[data-right]");
		
		// 点击获取后，取消之前的右键菜单和hover状态
		if(rightLI.length > 0){
			// 右键菜单效果初始化
			rightLI.removeAttr("data-right").removeClass("hover");
			$rightMenu.removeAttr("style");
			// 暗淡遮罩初始化
			$(".dinginess").removeClass("dinginess");
		}
		
		// 扩展名称初始化
		$extName.removeClass("extName-anim").attr("style", "").empty();
	}
	$("body").on("click", function(){
		initExtNameAndRightClick();
	})


	/**
	 * [扩展图标鼠标滑过特效]
	 */
	// 根据图标大小，设置间距的阀值
	var extNameXDistance = {
		"1": 14,
		"2": 18,
		"3": 24
	}
	wrap.on("mouseenter", "li", function() {
		var t = $(this),
			id = t.attr("data-id");
		
		var rightLI = $("[data-right]"),
			rightLIID = rightLI.attr("data-id");
		
		// 判断是否进入的和正在显示右键菜单的是同一个扩展
		if(id === rightLIID){
			return false;
		}
		// 进入其它扩展后，取消之前的右键菜单和hover状态
		if(rightLI.length > 0){
			rightLI.removeAttr("data-right").removeClass("hover");
			$rightMenu.removeAttr("style");
			
			// 取消另外一个列表的“暗淡”状态
			var otherList = t.closest("#showList").length > 0 ? $("#hideList") : $("#showList");
			otherList.removeClass("dinginess");
		}
		
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
			if(extColor[id]){
				$extName.css("background-color", extColor[id].color);
			}
			$extName.css({
				"top": t_offset.top + 15,
				"left": extNameXStart
			})
		}
		
		var list = t.closest(".list");
		clearTimeout(window["timer_disable_dinginess_" + list.attr("id")]);
		
		window["timer_"+t.data('id')] = setTimeout(function(){
			
			// 为了防止连接点击（不构成双击）
			if((new Date)*1 < (t.attr("data-leftclick")*1 + 200)){
				return;
			}
			
			t.addClass('hover');
			
			// 为扩展名称添加动画属性，并设置最终的显示位置
			if(isShowExtName){
				list.addClass("dinginess");
				$extName.addClass("extName-anim").css({
					"left": extNameXEnd,
					"opacity": 1
				});
			}
			
		}, 100);
	}).on("mouseleave", "li", function() {
		var t = $(this),
			list = t.closest(".list");
		
		// 判断是否打开了右键菜单
		if(t.attr("data-right") != undefined){
			return false;
		}
		
		// 初始化扩展名称
		if(isShowExtName){
			window["timer_disable_dinginess_" + list.attr("id")] = setTimeout(function(){
				list.removeClass("dinginess");
			}, 300)
			$extName.removeClass("extName-anim").attr("style", "").empty();
		}
		
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
	 * [在扩展图标上右击打开扩展功能]
	 * @param  {[type]} e) {		if        (e.button [description]
	 * @return {[type]}    [description]
	 */
	$(document).on("mousedown", "#hideList>li, #showList>li", function(e) {
		var t = $(this),
			id = t.data("id"),
			isLocked = t.attr("locked") != undefined,
			optionUrl = t.data("optionurl"),
			homepageUrl = t.data("homepageurl"),
			curRightEle = $('[data-right]');
			
		if(curRightEle.length > 0 && curRightEle.data("id") === id){
			initExtNameAndRightClick();
		}
			
		if (e.button === 2 && t.hasClass("hover") && isDisabledRightclick) {
			// 隐藏扩展名称
			$extName.removeClass("extName-anim").attr("style", "").empty();
			// 添加右键扩展标识
			t.attr("data-right", "");
			
			// 处理该扩展的内容和位置
			var t_offset = t.offset();
			var extNameXStart = t_offset.left + 0.15*50 + 50 - 10;
			var extNameXEnd = extNameXStart + extNameXDistance[iconSize];
			var rightMenuWidth = $rightMenu.outerWidth();
			// 判断显示扩展名称后是否会超过页面边界
			if($("body").width() < rightMenuWidth + extNameXEnd){
				extNameXStart = t_offset.left - rightMenuWidth + 10;
				extNameXEnd = extNameXStart - extNameXDistance[iconSize];
			}
			
			// 设置动画前的位置
			if(extColor[t.attr("data-id")]){
				$rightMenu.css("background-color", extColor[t.attr("data-id")].color);
			}
			$rightMenu.css({
				"top": t_offset.top + (50*1.3-52)/2,
				"left": extNameXStart
			}).show();
			
			if(isLocked){
				$rightMenu.find("li.lock").attr("locked", "");
			}else{
				$rightMenu.find("li.lock").removeAttr("locked");
			}
			if(!!$.trim(optionUrl)){
				$rightMenu.find("li.option").removeAttr("disabled");
			}else{
				$rightMenu.find("li.option").attr("disabled", "");
			}
			
			if(!!$.trim(homepageUrl)){
				$rightMenu.find("li.homepage").removeAttr("disabled");
			}else{
				$rightMenu.find("li.homepage").attr("disabled", "");
			}
			
			setTimeout(function(){
				$rightMenu.css({
					"left": extNameXEnd,
					"opacity": 1
				})
			}, 0)
			
		}
	});
	$(document).on("contextmenu", function(e) {
		return false;
	});
	
	
	$("#rightMenu").on("click", "li", function(e){
		e.preventDefault();
		e.stopPropagation()
		var t = $(this),
			li = $("[data-right]"),
			id = li.attr("data-id");
		
		initExtNameAndRightClick();
		
		switch(t.attr("class")){
			case "lock":
				// 取出存储的锁定id列表
				var idListObj = getPluginsByLocked();
				// 判断当前扩展是否进行了加锁
				if(t.attr("locked") === undefined){	// 当前未被加锁
					li.attr("locked", "");
					idListObj[id] = "1";
				}else{
					li.removeAttr("locked");
					delete idListObj[id];
				}
				// 存储加锁内容
				localStorage.setItem("_lockList_", JSON.stringify(idListObj));
				break;
			case "option":
				if(t.attr("disabled") === undefined){
					chrome.tabs.create({
						"url": li.data("optionurl")
					});
				}
				break;
			case "homepage":
				if(t.attr("disabled") === undefined){
					chrome.tabs.create({
						"url": li.data("homepageurl")
					});
				}
				break;
			case "uninstall":
				chrome.management.uninstall(id, function(){});
				break;
			default:
				break;
		}
	});
	
	
	/**
	 * [getPluginsByLocked 取出存储的锁定id列表]
	 * @return {[type]} [description]
	 */
	function getPluginsByLocked(){
		var idListStorage = localStorage.getItem("_lockList_");

		if(idListStorage){
			return JSON.parse(idListStorage);
		}else{
			return {};
		}
	}
	
	
	/**
	 * [getColor 获取扩展图标的平均色值，用于扩展名称显示的底色]
	 * @param  {[type]} imgUrl [图标url]
	 * @param  {[type]} ele    [得到的色值放在Attr上]
	 * @return {[type]}        [description]
	 */
	var extColor = {};
	function getColor(imgUrl, extId){
		function getImageColor(img) {
			var canvas = document.getElementById("getColorByCanvas");
			canvas.width = img.width;
			canvas.height = img.height;
		  
			var context = canvas.getContext("2d");
		  
			context.drawImage(img, 0, 0);
		  
			// 获取像素数据
			var data = context.getImageData(0, 0, img.width, img.height).data;
			
		  	var r = 0;
		  	var g = 0;
		  	var b = 0;
		  	
		  	// 浅色阀值
		  	var lightColor = 180;
		  	
			var substantialColor = 1000;
		  
			// 取所有像素的平均值
			for (var row = 0; row < img.height; row++) {
				for (var col = 0; col < img.width; col++) {
					var r1 = data[((img.width * row) + col) * 4];
					var g1 = data[((img.width * row) + col) * 4 + 1];
					var b1 = data[((img.width * row) + col) * 4 + 2];
					
					// 获取图片有效色值位置
					if(r1 != 255 && g1 != 255 && b1 != 255){
						if(col < substantialColor){
							substantialColor = col;
						}
					}
					
					if(!(r1 > lightColor && g1 > lightColor && b1 > lightColor)){
						r += r1;
						g += g1;
						b += b1;
					}
				}
			}
		  
			// 求取平均值
			r /= (img.width * img.height);
			g /= (img.width * img.height);
			b /= (img.width * img.height);
		  
			// 将最终的值取整
			r = Math.round(r);
			g = Math.round(g);
			b = Math.round(b);
		  
		  	var newColor = "rgb(" + r + "," + g + "," + b + ")";
		  	if(r > lightColor && g > lightColor && b > lightColor){
				newColor = "#5c5e6f";
		  	}
		  	
		  	// 判断出是否为白色空图
		  	if(substantialColor === 1000){
		  		setTimeout(function(){
		  			$("[data-id="+extId+"]").addClass("noicon");
		  		}, 0);
		  	}
		  	
			return {
				color: newColor,
				substantial: substantialColor
			};
		}
		
		var img = new Image();
		img.crossOrigin = "Anonymous";
		img.src = imgUrl;
		
		img.onload = function(){
			var obj = getImageColor(img);
			extColor[extId] = obj;
		}
	}
})();