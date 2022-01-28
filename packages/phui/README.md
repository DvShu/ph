# phui

---

前端模块化，由于代码都是未编译打包的源码所以需要打包工具支持，例如：[Vite](https://cn.vitejs.dev/)、[webpack](https://www.webpackjs.com/)

### 功能

1. [css 初始化](https://gitee.com/towardly/ph/wikis/phui/reset%20%E5%88%9D%E5%A7%8B%E5%8C%96%E6%A0%B7%E5%BC%8F?sort_id=5038392)
2. [Icon 图标](https://gitee.com/towardly/ph/wikis/phui/Icon%20%E5%9B%BE%E6%A0%87)
3. [Input 输入框](https://gitee.com/towardly/ph/wikis/phui/Input%20%E8%BE%93%E5%85%A5%E6%A1%86?sort_id=5046728)
4. [css 全局变量](https://gitee.com/towardly/ph/wikis/phui/css%20%E5%85%A8%E5%B1%80%E5%8F%98%E9%87%8F)
5. [button 按钮](https://gitee.com/towardly/ph/wikis/phui/button%20%E6%8C%89%E9%92%AE)
6. [container 容器布局](https://gitee.com/towardly/ph/wikis/phui/container%20%E5%AE%B9%E5%99%A8%E5%B8%83%E5%B1%80)
7. [table 表格](https://gitee.com/towardly/ph/wikis/phui/table%20%E8%A1%A8%E6%A0%BC?sort_id=5079507)
8. [Switch 开关按钮](https://gitee.com/towardly/ph/wikis/phui/switch%20%E5%BC%80%E5%85%B3)
9. [DatePicker 日期选择](https://gitee.com/towardly/ph/wikis/phui/DatePicker%20%E6%97%A5%E6%9C%9F%E9%80%89%E6%8B%A9%E5%99%A8)
10. [Modal 模态框](https://gitee.com/towardly/ph/wikis/phui/Modal%20%E6%A8%A1%E6%80%81%E6%A1%86)
11. [Message 消息提示](https://gitee.com/towardly/ph/wikis/phui/Message%20%E6%B6%88%E6%81%AF%E6%8F%90%E7%A4%BA)
12. [Pagination 分页](https://gitee.com/towardly/ph/wikis/phui/Pagination%20%E5%88%86%E9%A1%B5)
13. [Tabbar 选项卡](<https://gitee.com/towardly/ph/wikis/phui/Tabbar%20%E9%80%89%E9%A1%B9%E5%8D%A1(%E6%A0%87%E7%AD%BE%E6%A0%8F)>)
14. [Badge 徽标提示](https://gitee.com/towardly/ph/wikis/phui/Badge%20%E5%BE%BD%E6%A0%87%E6%8F%90%E7%A4%BA)
15. [Menu 菜单](https://gitee.com/towardly/ph/wikis/phui/Menu%20%E8%8F%9C%E5%8D%95)

## 使用

该模块依赖于 [phui](https://gitee.com/towardly/ph/wikis/Home?sort_id=4035190)，所以安装本模块之前需要先安装 `ph-utils`、`js` 是使用 [typescript](https://www.typescriptlang.org/) 编写。

### 安装

```
npm install ph-utils phui
```

### 引入

具体的引入请参考每一个模块的详细文档。

### 作为子组件使用

很多时候通常我们的组件不只是单独使用，有时候会作为其它组件的子组件使用，这个时候就希望能够将我们的组件作为子节点放到其它组件里面，在 `javascript` 中在节点下面添加子节点，通常可以通过 `appendChild` 和 `innerHTML` 的方式使用，我们的组件也一样；我们只需要将所有组件的构造参数的第一个参数 `element` 节点传递为空字符串就行了，下面我们以 [Badge 徽标提示](http://www.baidu.com) 为例：

1. 通过 `innerHTML` 的方式作为子组件，使用 `toString()` 返回组件的 `outerHTML` 字符串，可以将该节点字符串赋值给其它组件，通过这种方式使用的话，如果在渲染到其它组件后，该组件的更改，不会影响页面效果

```javascript
import Badge from 'phui/lib/Badge'

let badge = new Badge('')
badge.value = '12'

console.log(badge.value) // 12(页面的实际显示也是12)

document.body.innerHTML = badge.toString()

badge.value = '14'
console.log(badge.value) // 这里打印是 14，但是实际页面的显示确是 12，因为通过 toString() 的方式是没法更改的
```

2. 通过 `appendChild()` 的方式作为子组件，使用 `node()` 返回组件的 `HTMLElement` 节点，通过该方式使用的，哪怕已经渲染到其它节点后，依然可以通过组件的赋值更改页面显示

```javascript
let badge = new Badge('')
badge.value = '12'

console.log(badge.value) // 12(页面的实际显示是12)

document.body.appendChild(badge.noe())

badge.value = '14'
console.log(badge.value) // 14(页面的实际显示也是14)
```
