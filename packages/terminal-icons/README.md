# ph-terminal-icons

---

命令行工具简单的图标集并且加了对应颜色，没有做 `unicode` 检测支持，如果要检测支持 `unicode`，请使用 [log-symbols](https://github.com/sindresorhus/log-symbols)。

### 安装

```
npm install ph-terminal-icons
```

### 使用

```Javascript
const icons = require('ph-terminal-icons');

console.log(icons.error, 'error')
console.log(icons.info, 'info')
console.log(icons.success, 'success')
console.log(icons.warning, 'warning')
```
