import * as Extension from "./extension"
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
 * 显示右键菜单
 */
function showMenu(item) {
  hideMenu()
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

    const itemEle = document.querySelector(`[data-id=${item.id}]`)
    const color = item.showColor
    const showGap = 20
    const rightMenuWidth = 150
    const rightMenuHeight = 52

    const extSize = itemEle.offsetHeight
    const bodyWidth = document.body.offsetWidth
    let extLeft = itemEle.offsetLeft
    let extTop = itemEle.offsetTop

    // 计算左边距
    if (bodyWidth - extSize - extLeft - showGap > rightMenuWidth) {
      extLeft = extLeft + extSize + showGap
    } else {
      extLeft = extLeft - rightMenuWidth - showGap
    }

    // 计算上边距
    if (rightMenuHeight > extSize) {
      extTop = extTop - (rightMenuHeight - extSize) / 2
    } else {
      extTop = extTop + (extSize - rightMenuHeight) / 2
    }

    vm.rightMenu = {
      show: true,
      left: extLeft,
      top: extTop,
      backgroundColor: color,
      content
    }
  }, 0);
}


/**
 * 隐藏右键菜单
 */
function hideMenu() {
  vm.rightMenu.show = false
}


/**
 * 初始化页面所有的操作
 */
function resetHandle(params) {
  
  // 关闭右键菜单
  hideMenu()

  // 关闭Hover
  vm.$data.enabledExtList.forEach(item => {
    item.isHover = false
  })
  vm.$data.disabledExtList.forEach(item => {
    item.isHover = false
  })
}


/**
 * 进入扩展图标时
 */
function enter(item) {
  resetHandle()
  item['hoverTimer'] = setTimeout(() => {
    item.isHover = true
  }, 100)
}
// 离开
function leave(item) {
  if (item['hoverTimer']) {
    clearTimeout(item['hoverTimer'])
  }
  item.isHover = false
}

export { init, showMenu, enter, leave }
