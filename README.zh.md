<p align="center">
  <img src="https://user-images.githubusercontent.com/36993664/44917039-f208ad80-ad3f-11e8-85e9-e29489f0ffb4.png">
</p>

<p align="center">
<a href="https://circleci.com/gh/cnwangjie/better-onetab"><img src="https://img.shields.io/circleci/project/github/cnwangjie/better-onetab/master.svg?style=flat-square" alt="CircleCI"></a>
<a href="https://chrome.google.com/webstore/detail/better-onetab/eookhngofldnbnidjlbkeecljkfpmfpg"><img src="https://img.shields.io/chrome-web-store/v/eookhngofldnbnidjlbkeecljkfpmfpg.svg?style=flat-square" alt="Chrome Web Store"></a>
<a href="https://addons.mozilla.org/firefox/addon/better-onetab/"><img src="https://img.shields.io/amo/v/better-onetab.svg?style=flat-square" alt="Mozilla Add-ons"></a>
<img src="https://img.shields.io/github/license/cnwangjie/better-onetab.svg?style=flat-square" alt="GitHub">
<img src="https://img.shields.io/github/last-commit/cnwangjie/better-onetab.svg?style=flat-square" alt="GitHub last commit">
<a href="https://gitter.im/better-onetab/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge"><img src="https://img.shields.io/gitter/room/better-onetab/Lobby.svg?style=flat-square" alt="Join the chat at https://gitter.im/better-onetab/Lobby"></a>
</p>

### 一个更好的 OneTab 扩展

OneTab 的标签页储存和标签页分组功能是一个非常实用的功能，但是 OneTab 扩展还缺少一些诸如简易列表，只储存选中的标签页等功能。由于开发时间久远且长期无人更新，并且也不开源，所以也没办法为 OneTab 增加新的功能，因此这里又做了一个更好的（Better-Onetab）扩展。它比 OneTab 拥有更美观的界面以及更多的功能。

### 功能

[想要更多功能？在这里告诉我吧](https://github.com/cnwangjie/better-onetab/issues/new)

 - [x] OneTab 中的所有基本功能
 - [x] 弹出式的简易列表
 - [x] 固定标签页列表
 - [x] 键盘快捷键
 - [x] 自定义的设置
 - [x] 通过拖拽操作来重新排列标签页
 - [x] 数据和选项的同步
 - [x] 导入及导出
 - [x] 将储存的标签页加入浏览器历史中
 - [x] 国际化支持（当前只有英语和简体中文）

从 [变更日志](./CHANGELOG.md) 中了解更多

### 更新计划

你可以从 [project page](https://github.com/cnwangjie/better-onetab/projects/1) 了解 better onetab 的更新动态，并且可以在 [issues page](https://github.com/cnwangjie/better-onetab/issues) 中留下你的意见。

### 安装

从 [Google 扩展商店](https://chrome.google.com/webstore/detail/better-onetab/eookhngofldnbnidjlbkeecljkfpmfpg) 安装。

从 [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/better-onetab/) 安装 (尚未优化))

从 [releases 页面](https://github.com/cnwangjie/better-onetab/releases) 下载 .crx 文件并将它拖拽至 chrome 的扩展管理页面。

从源码中编译：

### 开发

0. Clone 这个仓库
0. 安装依赖 (使用 `yarn` 命令)
0. 自动重新加载 (使用 `yarn dev` 命令)
0. 点击 `加载已解压的扩展程序` 按钮并选择 `./dist` 目录
0. 编译并打包 (使用 `yarn build` 命令)

### 捐助

开发 Better Onetab 花费了很多时间，并且每月需要为同步服务器支付费用。如果你觉得有所帮助可以通过下面的方式进行捐助。

 - [PayPal](https://paypal.me/wangjie0)
 - [DigitalOcean 邀请链接](https://m.do.co/c/4c053a482508)
 - BTC 1ABQECfxBGLvjZqaxTm1io3CFPbKhMaSQ1
 - ETH 0x43D361928BF8f0a58c977b152dabfF47f68c6767
 - BCC qpqe7kcrc6lhwltd536j26j8gyk4ws3f3uehj5tql8

### 许可

MIT LICENSE
