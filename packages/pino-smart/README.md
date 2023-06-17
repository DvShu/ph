# pino-smart

---

Pino 日志行美化工具

### 安装

```
npm install pino-smart
```

### 使用

```Javascript
const pino = require('pino')

const transport = pino.transport({
  target: 'pino-smart'
})
let logger = pino(transport)

logger.error('err')
logger.info('info')
logger.error(new Error('error msg'))

// output:
/*
19:42:16 [ERROR] -- err
19:42:16 [INFO] -- info
19:42:16 [ERROR] -- error msg
Error: error msg
    at Object.<anonymous> (E:\workspace1\ph-work\packages\pino-smart\test.js:10:14)
    at Module._compile (node:internal/modules/cjs/loader:1101:14)
    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1153:10)
    at Module.load (node:internal/modules/cjs/loader:981:32)
    at Function.external_module_.Module._load (E:\workspace1\ph-work\.pnp.cjs:12973:14)
    at Function.moduleExports.runMain (E:\workspace1\ph-work\.pnp.cjs:13174:31)
    at node:internal/main/run_main_module:17:47
/*
```
