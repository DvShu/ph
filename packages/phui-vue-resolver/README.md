# phui-vue-resolver

在使用 `vite` 构建 `vue` 的项目中，自动引入 [phui-v](https://www.npmjs.com/package/phui-v)

### 安装

```
npm install unplugin-vue-components phui-vue-resolver -D
```

### 使用

在 `vite.config.ts` 的 `plugins` 添加如下代码：

```javascript
import Components from 'unplugin-vue-components/vite'
import PhuiResolver from 'phui-vue-resolver'

plugins: [
  ...Components({
    dts: 'src/components.d.ts',
    resolvers: [PhuiResolver()],
  }),
]
```
