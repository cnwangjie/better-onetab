import * as Extension from "./extension"
let that = null


/**
 * 初始化方法
 */
function init(t) {
  // 指向vm对象
  that = t

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
      name: item.isLocked ? that.i18n.rightLock_unlock : that.i18n.rightLock_lock,
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
      name: that.i18n.rightOption,
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
      name: that.i18n.rightUninstall,
      handle: () => {
        hideMenu()
        Extension.uninstall(item)
      },
      disabled: false
    },
    {
      name: that.i18n.rightHomepage,
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
        name: that.i18n.rightAppLaunch,
        handle: () => {
          hideMenu()
          chrome.management.launchApp(item.id, function(){})
        },
        disabled: false
      })
    }

    const itemEle = document.querySelector(`[data-id=${item.id}]`)
    const color = item.showColor
    const showGap = 10
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

    that.rightMenu = {
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
  that.rightMenu.show = false
}


/**
 * 进入扩展图标时
 */
// function enterMenu(item) {
  
// }

export { init, showMenu }