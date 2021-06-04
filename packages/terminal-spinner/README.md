# ph-terminal-spinner

---

命令行工具简单的加载提示信息，只提供了一些简单的功能，需要更多强大的功能，请参考使用：[ora](https://www.npmjs.com/package/ora)。

### 安装

```
npm install ph-terminal-spinner
```

### 使用

```Javascript
const Spinner = require('./index')

let spinner = Spinner('数据加载中')
spinner.start()
setTimeout(() => {
  spinner.succeed('数据加载成功')
}, 1500)
```

### API

1. `start(text: string)`  
   开启加载动画。

2. `succeed(text: string)`  
   加载成功后显示的文本信息

3. `fail(text: string)`  
   加载失败显示的文本信息

4. `stop()`  
   停止加载动画
