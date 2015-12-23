(function(){
    // 扩展被禁用时触发
    chrome.management.onDisabled.addListener(function(extension){
        _updateExtentionStatus();
    });

    // 扩展被启用时触发
    chrome.management.onEnabled.addListener(function(extension){
        _updateExtentionStatus();
    });

    // 扩展被安装时触发
    chrome.management.onInstalled.addListener(function(extension){
        _updateExtentionStatus();
    });

    // 扩展被卸载时触发
    chrome.management.onUninstalled.addListener(function(id){
        _updateExtentionStatus();
    });

    /**
     * [updateExtentionStatus 扩展发生变化后，更新“扩展管理器”的图标状态]
     * @return {[type]} [description]
     */
    function _updateExtentionStatus(){
        chrome.management.getAll(function(extensionList){

            var lockObj = JSON.parse(localStorage.getItem('_lockList_'));

            var isClean = extensionList.some(function(extension){
                if(extension.enabled === true && extension.id !== chrome.app.getDetails().id && extension.type !== "theme"){
                    if(lockObj){
                        if(lockObj[extension.id] != 1){
                            return true;
                        }
                    }else{
                        return true;
                    }
                }
            });

            // console.log(isClean?"需要清理":"不需要");

            if(isClean){
                chrome.browserAction.setIcon({
                    path: "/icon/browser_action_clean_icon.png"
                });
                chrome.browserAction.setTitle({
                    title: "可以闪电关闭临时开启的扩展啦^_~"
                });
            }else{
                chrome.browserAction.setIcon({
                    path: "/icon/browser_action_icon.png"
                });
                chrome.browserAction.setTitle({
                    title: "扩展管理器"
                });
            }

        });
    }
})();
