[![img](https://github.com/Difegue/LANraragi/raw/dev/public/favicon.ico)](https://github.com/Difegue/LANraragi/blob/dev/public/favicon.ico)

# LANraragi_cn

用于存档杂志/漫画的开源服务器, 运行在Mojolicious+Redis上。

本项目为同步官网版本并进行汉化, 前几位汉化大佬项目的版本都比较旧 ps:个人追求最新版 感谢几位大佬版本的参考 -WindyCloudCute-

有一些机翻如果不对请提出 [Issues](https://github.com/DreamVoyager/LANraragi_CN/issues)

交流群: 212641253

个人更新内容:

- 修复了添加页面底部返回首页按钮的错误

- 一些插件的汉化(还有些插件未汉化...)
- 优化插件页面, 上传插件按钮文字偏移(有点强迫症)
- 优化首页档案右键文件js报错问题

- 使用root帐户代替koyomi, 解决nas中可能无法挂载文件的错误, 项目主目录更改为/root/lanraragi/

  ===想把所有的页面都添加顶部菜单栏(有时候确实觉得返回按钮不太好找)===

### 原版:

#### 💬 与其他LANraragi用户交谈 [Discord](https://discord.gg/aRQxtbg) 或 [GitHub Discussions](https://github.com/Difegue/LANraragi/discussions)


* Choose from 5 preinstalled responsive library styles, or add your own with CSS.  

#### [📄 文档(英文)](https://sugoi.gitbook.io/lanraragi/v/dev) | [⏬ 下载(原版)](https://github.com/Difegue/LANraragi/releases/latest) | [🎞 演示](https://lrr.tvc-16.science/) | [🪟🌃 Window版本](https://nightly.link/Difegue/LANraragi/workflows/push-continous-delivery/dev) | [💵 赞助项目](https://ko-fi.com/T6T2UP5N)



## 特点

- 以存档格式存储您的漫画.（支持zip/rar/targz/lzma/7z/xz/cbz/cbr/pdf, 对epub的基本支持）.
- 直接从web浏览器读取存档: 服务器使用临时文件夹从压缩文件中读取.
- 使用内置的OPDS设置在专用阅读器软件中读取您的存档（现在支持PSE！）.
- 使用客户端API从其他程序与LANraragi交互 (可用平台r [many platforms!](https://sugoi.gitbook.io/lanraragi/v/dev/advanced-usage/external-readers)).
- 两种不同的用户界面: 悬停时带有缩略图的压缩存档列表, 或缩略图视图.
- 从5种预安装的库中进行选择样式, 或使用CSS添加自己的样式.
- 命名空间支持标签: 添加您自己的或使用插件从其它来源导入.
- 将存档存储在静态或动态分类中, 以便轻松排序您的库.
- 将存档添加到LANraragi时, 自动使用插件导入元数据.
- 在使用上述自动元数据导入的同时, 将档案从互联网直接下载到服务器.
- 将数据库备份为JSON格式, 以便将标签转移到另一个LANraragi中.
