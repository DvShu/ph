# ph-terminal-colors

---

> 终端字符串样式

命令行工具简单的颜色集，这里只有一些简单的基本的样式，更多复杂的样式推荐使用：[chalk](https://www.npmjs.com/package/chalk)。

### 安装

```
npm install ph-terminal-colors
```

### 使用

```Javascript
const termColors = require('ph-terminal-colors');
const log = console.log;

// Hello -- 蓝色；World -- 红色; ! -- 亮绿
log(termColors.blue('Hellow') + ' - ' termColors.red('World') + termColors.brightGreen('!'));

// 应用多种样式
log(termColors.style('Hello world!', ['underline', 'italic', 'blue', 'bgRed']));

// 应用一个 0~255的颜色值
log(termColors('Hello World!', 255));
```

### API

1. `termColors(text: string, colorNo?:number = 255)`  
   通过填写一个 0~255 的数值应用颜色。默认的为 255 表示白色。

2. `termColors.[style](text)`  
   调用指定样式的文本样式。可选的 `[style]` 为后面的值之一：

3. `termColors.style(text: string, styles: string[])`
   为文本应用多种样式

### 所有的样式

- 基本样式：`bold`、`italic`、`underline`、`inverse`、`strikethrough`
- 基本颜色：`black`、`red`、`green`、`yellow`、`blue`、`magenta`、`cyan`、`white`
- 明亮颜色：`bright` + 基本颜色头字母大写；例如：`brightBlack[grey|gray]` 、`brightBlue`
- 基本背景颜色：`bg` + 基本颜色头字母大写；例如：`bgBlue`、`bgRed`
- 明亮背景颜色: `bgBright` + 基本颜色头字母大写；例如：`bgBrightBlack[bgGrey|bgGray]`、`bgBrightBlue`
