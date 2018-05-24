Better-Onetab
======

### 一个更好的 OneTab 扩展

OneTab 的标签储存和标签分组功能是一个非常实用的功能，但是OneTab扩展还缺少一些诸如简易列表，只储存选中的标签等功能。由于开发时间久远长期无人更新，并且也不开源，所有也没办法为 OneTab 增加新的功能，所以这里又做了一个更好的 (Better-Onetab) 扩展。相比于 OneTab 拥有更美观的界面以及更多的功能。

### 功能

[想要更多功能？在这里告诉我吧](https://github.com/cnwangjie/better-onetab/issues/new)

 - [x] 基本的标签储存分组功能
 - [x] 设置标签列表的标题
 - [x] 弹出式的简易列表
 - [x] 固定标签列表
 - [x] 键盘快捷键
 - [x] 自定义的设置
 - [x] 通过拖拽操作来重新排列标签
 - [x] 数据和选项的同步
 - [x] 导入及导出
 - [x] 将储存的标签加入浏览器历史中
 - [x] 国际化支持 (当前只有英语和中文)
 - [ ] 同步服务器 (chrome 提供的同步配额太少了)

### 安装

从 [Google 扩展商店](https://chrome.google.com/webstore/detail/better-onetab/eookhngofldnbnidjlbkeecljkfpmfpg) 安装。

从 [release page](https://github.com/cnwangjie/better-onetab/releases) 下载 .crx 文件并将它拖拽至 chrome 的扩展管理页面。

### 开发

0. Clone 这个仓库
0. 安装依赖 (使用 `yarn` 命令)
0. 自动重新加载 (使用 `yarn dev` 命令)
0. 点击 `加载已解压的扩展程序` 按钮并选择 `./dist` 目录
0. 编译并打包 (使用 `yarn build` 命令)

### 许可

MIT LICENSE