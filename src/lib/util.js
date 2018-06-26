import * as Extension from "./extension"

// 右键菜单宽度
const RightMenuWidth = 150

// popup页面vue对象
let vm = null


/**
 * 初始化方法
 */
function init(t) {
  // 指向vm对象
  vm = t

  // 屏蔽右键菜单选项
  document.addEventListener('contextmenu', function(e){
    e.preventDefault()
  })

  // 点击空白处清理页面的状态
  document.addEventListener('click', e => {
    e.preventDefault()
    hideMenu()
  })
}


/**
 * 通过扩展获取右键菜单、扩展名称的显示位置
 */
function getPositionByExt(item, info) {
  const itemEle = document.querySelector(`[data-id=${item.id}]`)
  const showGap = 16

  const extSize = itemEle.offsetHeight
  const bodyWidth = document.querySelector('#popup').offsetWidth
  let extLeft = itemEle.offsetLeft
  let extTop = itemEle.offsetTop
  let atLeft = false

  // 计算左边距
  if (bodyWidth - extSize - extLeft - showGap > item.showMaxWidth) {
    extLeft = extLeft + extSize + showGap
  } else {
    atLeft = true
    extLeft = extLeft - info.width - showGap
  }


  // 计算上边距
  if (info.height > extSize) {
    extTop = extTop - (info.height - extSize) / 2
  } else {
    extTop = extTop + (extSize - info.height) / 2
  }

  return {
    left: extLeft,
    top: extTop,
    atLeft
  }
}


/**
 * 显示右键菜单
 */
function showMenu(item) {
  hideMenu()
  hideName()
  setTimeout(() => {
    
    // 右键菜单内容
    let content = [{
      name: item.isLocked ? vm.i18n.rightLock_unlock : vm.i18n.rightLock_lock,
      handle: () => {
        hideMenu()
        if (item.isLocked) {
          Extension.unlock(item)
        } else {
          Extension.lock(item)
        }
      },
      disabled: false
    },
    {
      name: vm.i18n.rightOption,
      handle: () => {
        hideMenu()
        if (item.optionsUrl) {
          chrome.tabs.create({
            'url': item.optionsUrl
          })
        }
      },
      disabled: !item.optionsUrl
    },
    {
      name: vm.i18n.rightUninstall,
      handle: () => {
        hideMenu()
        Extension.uninstall(item)
      },
      disabled: false
    },
    {
      name: vm.i18n.rightHomepage,
      handle: () => {
        hideMenu()
        chrome.tabs.create({
          'url': item.homepageUrl
        })
      },
      disabled: false
    }]
    if (item.isApp) {
      content.splice(1, 1, {
        name: vm.i18n.rightAppLaunch,
        handle: () => {
          hideMenu()
          chrome.management.launchApp(item.id, function(){})
        },
        disabled: false
      })
    }

    let position = getPositionByExt(item, {
      width: RightMenuWidth,
      height: 52
    })

    vm.rightMenu = {
      showClass: position.atLeft ? 'showInfoLeft' : 'showInfoRight',
      left: position.left,
      top: position.top,
      backgroundColor: item.showColor,
      content
    }
  }, 0);
}


/**
 * 隐藏右键菜单
 */
function hideMenu() {
  vm.rightMenu.showClass = ''
}



/**
 * 显示扩展名称
 */
function showName(item) {
  hideName()
  vm.extName.content = item.name

  setTimeout(() => {
    let ele = document.querySelector('#extName')
    item.showMaxWidth = Math.max(RightMenuWidth, ele.offsetWidth)

    let position = getPositionByExt(item, {
      width: ele.offsetWidth,
      height: ele.offsetHeight
    })
  
    vm.extName = {
      showClass: position.atLeft ? 'showInfoLeft' : 'showInfoRight',
      left: position.left,
      top: position.top,
      backgroundColor: item.showColor,
      content: item.name
    }
  }, 0);
}
function hideName() {
  vm.extName = {
    show: false,
    left: 0,
    top: 0,
    content: ''
  }
}


/**
 * 初始化页面所有的操作
 */
function resetHandle(params) {
  
  // 关闭右键菜单
  hideMenu()
  hideName()

  // 关闭Hover
  vm.$data.enabledExtList.forEach(item => {
    item.isHover = false
  })
  vm.$data.disabledExtList.forEach(item => {
    item.isHover = false
  })
  vm.$data.enabledExtListDinginess = false
  vm.$data.disabledExtListDinginess = false
}


/**
 * 进入扩展图标时
 */
function enter(item) {
  item['hoverTimer'] = setTimeout(() => {
    item.isHover = true
    vm.$data[item.enabled ? 'enabledExtListDinginess' : 'disabledExtListDinginess'] = true
    showName(item)
  }, 200)
}
// 离开
function leave(item) {
  if (item['hoverTimer']) {
    clearTimeout(item['hoverTimer'])
  }
  resetHandle()
}

export { init, showMenu, enter, leave, showName }
