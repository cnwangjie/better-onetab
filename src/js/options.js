(function(){


	/**
	 * [showTips 显示提示]
	 */
	var __tips = $('#_TOOLS_STATUS__');
	function showTips(text){
		if(text){
			__tips.html(text).css({
				'opacity' : '1',
				'top' : '0px'
			});
			setTimeout(function(){
				__tips.css({
					'opacity' : '0',
					'top' : '-38px'
				});
			},1000);
		}
	}



	/**
	 * [选择扩展显示的列数]
	 */
	var setColumnTimer = null,
		setColumnShow = $('#js-sel-column-show'),
		setColumnRange = $('#js-sel-column');
	function setColumn(num){
		localStorage.setItem("_showColumn_", num);
		setColumnShow.html(num)
		if(setColumnTimer){
			clearTimeout(setColumnTimer);
			setColumnTimer = null;
		}
		setColumnTimer = setTimeout(function(){
			showTips('设置成功!');
		}, 600)
	}
	setColumnRange.on("input chnage", function(){
		setColumn($(this).val());
	});
	var _column_ = localStorage.getItem("_showColumn_");
	if(_column_){
		setColumnRange.val(_column_);
		setColumnShow.html(_column_)
	}



	/**
	 * [清除rank存储数据]
	 */
	$('#js-clear-rank').click(function(){
		localStorage.removeItem('_rankList_');
		showTips('已清除!');
	})

	chrome.management.getAll(function(list){
		var listArr = [];
		var listArrLocked = getPluginsByLocked();
		for (var i = 0; i < list.length; i++) {
			var obj = list[i];

			// console.log(obj);

			// 将当前扩展排除在外
			if(obj.id === chrome.app.getDetails().id || obj.type === "theme"){
				continue;
			}


			// 统一处理图标
			var img = "";
			if(obj.icons){
				img = obj.icons[obj.icons.length-1].url;
			}

			// 查看是否已经被锁定
			var lockAttr = "";
			if(listArrLocked){
				if(listArrLocked[obj.id] == "1"){
					lockAttr = "locked";
				}
			}

			var objStr = '<li data-id="'+ obj.id +'" title="'+ obj.name +'" '+lockAttr+'>\
								<img src="'+ img +'" alt="'+ obj.name +'">\
							</li>';

			// 插入到队列中
			listArr.push(objStr);
		};
		$('#_PLUGINS_LIST_').html(listArr.join(""));
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
	 * 点击扩展，进行解锁与锁定
	 * @param  {[type]} ){		var t             [description]
	 * @return {[type]}          [description]
	 */
	$('#_PLUGINS_LIST_').on("click", "li", function(){
		var t = $(this);
		var id = t.data('id');

		// 取出存储的锁定id列表
		var idListObj = getPluginsByLocked();

		// 判断当前扩展是否进行了加锁
		if(t.attr("locked") === undefined){	// 当前未被加锁
			t.attr("locked", "");
			idListObj[id] = "1";
		}else{
			t.removeAttr("locked");
			delete idListObj[id];
		}

		// 存储加锁内容
		localStorage.setItem("_lockList_", JSON.stringify(idListObj));
	})



	/**
	 * [选择图标右击操作]
	 * @return {[type]} [description]
	 */
	var rightClickStorage = localStorage.getItem("_rightClick_") || "uninstall";
	$("#js-rightclick").val(rightClickStorage).change(function(){
		var val = $(this).val();
		// 存储右击选项内容
		localStorage.setItem("_rightClick_", val);
		showTips('设置成功!');
	})


})();
