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
        chrome.management.getAll(function(list) {
            var showListArr = [];
            var hideListArr = [];
            for (var i = 0; i < list.length; i++) {
                var obj = list[i];

                // console.log(obj);

                // 将当前扩展排除在外
                if (obj.id === chrome.app.getDetails().id || obj.type === "theme") {
                    continue;
                }


                // 统一处理图标
                var img = "";
                if (obj.icons) {
                    img = obj.icons[obj.icons.length - 1].url;
                }

                var objStr = '<li data-id="' + obj.id + '" title="' + obj.name + '" data-optionurl="'+ obj.optionsUrl +'" alt="' + obj.name + '" style="background-image:url('+ img +')"></li>';

                // 根据扩展的状态，分别插入到不同的队列中
                if (obj.enabled === false) {
                    hideListArr.push(objStr);
                } else {
                    showListArr.push(objStr);
                }

            }


            if(!localStorage.getItem("_switch_rank_sort_")){
                showListArr.sort(function(b, a) {
                    return RankStorage.get($(a).data("id")) - RankStorage.get($(b).data("id"));
                });
                hideListArr.sort(function(b, a) {
                    return RankStorage.get($(a).data("id")) - RankStorage.get($(b).data("id"));
                });
            }


            showList.html(showListArr.join(""));
            hideList.html(hideListArr.join(""));
        });
    }
    // 启动默认执行
    refreshPlugin();

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
            chrome.management.setEnabled(id, isDisabled, function() {
                // 更新两个容器的显示状态
                // refreshPlugin();
            });
        }
    });


	/**
     * [扩展图标鼠标滑过特效]
     */
    wrap.on("mouseenter", "li", function() {
		var t = $(this);
		window["timer_"+t.data('id')] = setTimeout(function(){
        	t.addClass('hover');
		}, 100);
    }).on("mouseleave", "li", function() {
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
        var listArrLocked = getPluginsByLocked();
        var _showList = showList.find('li');
        _showList.each(function(index, ele) {
            var t = $(ele);
            var id = t.data('id');
            if (listArrLocked && listArrLocked[id] == 1) {
                t.attr('locked', "");
                return;
            }
            hideList.append(t);
            chrome.management.setEnabled(id, false, function() {
                // refreshPlugin();
            });
        });

        setTimeout(function() {
            showList.attr('locked', '');
            setTimeout(function() {
                showList.removeAttr('locked');
            }, 800);
        }, 0);
    });


    /**
     * [右击图标功能]
     * @param  {[type]} e){                		return false;   	} [description]
     * @return {[type]}      [description]
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
