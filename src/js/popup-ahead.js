(function(){
	
	// 设置列数与宽度映射
	var ratio_col = {
		4: 344,
		5: 420,
		6: 496,
		7: 572,
		8: 648,
		9: 724
	};

	window.SubTask("Storage", function(obj) {
		
		// 设置popup页面宽度
		document.documentElement.style = "width: " + ratio_col[obj.get("_showColumn_") || 7] + "px;"
		
		// 设置图标尺寸
		var iconSize = obj.get("_showIconSize_") || 2;
		document.documentElement.classList.add("icon-size-" + iconSize);
	})
})();