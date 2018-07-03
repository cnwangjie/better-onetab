import * as Extension from './extension'
import * as Storage from './storage'

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
    resetHandle()
    cancelSearch()
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
  let adviseMaxWidth = null
  let left = 0
  let right = 0
  let top = 0

  // 计算横向边距
  let rightSideSpace = bodyWidth - extSize - extLeft - showGap
  let leftSideSpace = extLeft - showGap
  if (rightSideSpace > item.showMaxWidth || leftSideSpace < rightSideSpace) {
    left  = `${extLeft + extSize + showGap}px`
    right = 'unset'
    adviseMaxWidth = rightSideSpace - 10
  } else {
    atLeft = true
    adviseMaxWidth = leftSideSpace - 10
    left = 'unset'
    right = `${bodyWidth - extLeft + showGap}px`
  }

  // 计算上边距
  if (info.height > extSize) {
    top = `${extTop - (info.height - extSize) / 2}px`
  } else {
    top = `${extTop + (extSize - info.height) / 2}px`
  }

  // console.table({
  //   extSize, extLeft, extTop, showMaxWidth: item.showMaxWidth, rightSideSpace, leftSideSpace, atLeft, adviseMaxWidth, left, right, top
  // })

  return {
    left,
    right,
    top,
    atLeft,
    adviseMaxWidth
  }
}


/**
 * 显示右键菜单
 */
function showMenu(item) {
  hideMenu()
  setTimeout(() => {
    hideName()

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
      right: position.right,
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
  vm.extName.content = item.shortName

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
      right: position.right,
      top: position.top,
      backgroundColor: item.showColor,
      content: item.name,
      adviseMaxWidth: position.adviseMaxWidth
    }
  }, 0);
}
function hideName() {
  vm.extName = {
    show: false,
    left: 0,
    right: 'unset',
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
  vm.$data.ext.extList.forEach(item => {
    item.isHover = false
  })
  vm.$data.ext.enabledExtListDinginess = false
  vm.$data.ext.disabledExtListDinginess = false
}


/**
 * 进入扩展图标时
 */
function enter(item) {
  if (!item.isHover) {
    if (vm.searcher.doing && !item.isSearched) {
      return
    }
    resetHandle()
    item['hoverTimer'] = setTimeout(() => {
      item.isHover = true
      vm.$data.ext[item.enabled ? 'enabledExtListDinginess' : 'disabledExtListDinginess'] = true
      showName(item)
    }, 200)
  }
}
// 离开
function leave(item) {
  if (vm.$data.rightMenu.showClass.trim()) {

  } else {
    if (item['hoverTimer']) {
      clearTimeout(item['hoverTimer'])
    }
    resetHandle()
  }
}


/**
 * 搜索功能
 */
function search() {
  let text = vm.searcher.text.trim().replace(/\s{2,}/g, " ").toLowerCase()
  if (text) {
    setTimeout(() => {
      vm.searcher.doing = true
      let queryArr = text.split(/\s/)
      vm.ext.extList.forEach(item => {
        let extInfo = (item.name+item.description).toLowerCase()
        let isSearched = queryArr.some(q => extInfo.includes(q))
        item['isSearched'] = isSearched
      }, 0)
    })
  } else {
    vm.searcher.doing = false
    vm.ext.extList.forEach(item => {
      if (item['isSearched']) {
        item['isSearched'] = false
      }
    })
  }
}
function cancelSearch() {
  vm.searcher = {
    doing: false,
    text: ''
  }
}

// 开启关闭扩展
function onoff(item) {
  // 防止Hover延迟在点击后生效
  clearTimeout(item['hoverTimer'])
  
  Extension.onoff(item)
  resetHandle()
}
// 重置
function clear() {
  Extension.clear()
}


/**
 * 分组
 */
function showGroup() {
  vm.group.show = true
}
function hideGroup() {
  vm.group.show = false
}
function changeGroup(index) {
  vm.group.index = index
  vm.group.show = false

  setTimeout(() => {
    let lockObj = vm.group.list[index].lock
    vm.ext.extList.forEach(item => {
      // 开启状态
      if (item.enabled && !lockObj[item.id]) {
        chrome.management.setEnabled(item.id, false)
        item.enabled = false
      } else if (!item.enabled && lockObj[item.id]) {
        chrome.management.setEnabled(item.id, true)
        item.enabled = true
      }
    })
    Storage.set('_group_', vm.group)
  }, 50)
}
function setGroup() {
  vm.group.show = false
  chrome.tabs.create({
    'url': `${chrome.app.getDetails().options_page}#group`
  })
}


export {
  init,
  showMenu,
  enter,
  leave,
  showName,
  search,
  onoff,
  clear,
  cancelSearch,
  showGroup,
  hideGroup,
  changeGroup,
  setGroup 
}
