# auto-deploy-cli

自动化部署本地项目到远程服务器，远程服务器需要先部署 `auto-deploy` 的后台服务。

### 安装

```
npm install @tenny/auto-deploy -g
```

### 命令

1. 初始化配置：`deploy init`
   `配置说明`:
   1). `packByUpdate`: 是否根据修改时间进行增量打包部署(只部署已经修改过的文件[修改时间发生变化]),如果文件名称是类似于 `a.xdfdsafds.js` 这样带 `hash` 规则的文件，则根据文件名称判断。
2. 上传部署：`deploy d [option]`

   `option` 参数列表：

   1). `-w, --workspace <name>`: 工程为 `workspace` 工程
