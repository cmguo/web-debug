# web-debug

在浏览器上Debug应用程序，可以查看或者操作程序：

* 实时日志（过滤分析）
* 变量当前值
* 内存状态
* 线程栈（Debug ANR）
* 文件存储（管理）
* 打开的描述符
* 应用截屏、录屏（依赖 videojs）

与被调试应用通过HTTP传递数据，完整的方案需要应用额外集成“基础库”和“调试插件”模块。

该模块基于 Extjs（2.3.0版本），放在 /var/www/ 目录直接可以通过浏览器打开，没有安装过程。所有操作都是客户端 js 完成。

可以打开本地文件（日志，traces，tombstone）和 JIRA 任务中的附件，辅助分析。通过文件名称识别文件类型。

JIRA 需要配置用户名、密码，同时需要配置调试控制台服务器代理访问JIRA服务器。（解决跨域访问的问题）。

欢迎建议和意见，谢谢！
