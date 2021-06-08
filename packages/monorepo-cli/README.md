# monorepo-cli

---

基于 `yarn v2 berry` 的 `monorepo` 项目的创建

## 安装

```
npm install monorepo-cli -g
```

## 使用

### 版本以及帮助

```javascript
// 版本
monorepo --version // monorepo -V

// 帮助
monorepo --help
```

### 1. `monorepo create|c <name> [options]`

创建 `monorepo` 项目，所有支持配置项如下：

1. `--ts`：使用 `typescript`，默认使用 `typescript`
2. `--no-ts`：不使用 `typescript`
3. `-e, --eslint`：使用 `eslint` 进行代码规范校验，默认
4. `--no-eslint`：不使用 `eslint`
5. `-p, --prettier`：使用 `prettier` 进行代码格式化，默认
6. `--no-prettier`：不使用 `prettier`
7. `-n, --node`：NodeJs(Commonjs)项目，默认
8. `--no-node`：不是 NodeJs(Commonjs)项目，而是 WEB(ES Module) 项目
9. `-l, --license`：需要 LICENSE 文件，默认
10. `--no-license`：不需要 LICENSE
11. `-w --workspace <name>`：新建项目的同时创建工作区
12. `-d, --director <director>`: 创建项目的目录地址，默认为：执行命令的目录[ `process.cwd()` ]

### 2. `monorepo workspace|ws <name>`

构建基于 `yarn v2(berry)` 的 `monorepo` 项目的工作区

1. `-n, --node`：NodeJs(Commonjs)项目，默认
2. `--no-node`：不是 NodeJs(Commonjs)项目，而是 WEB(ES Module) 项目
3. `-d, --director <director>`: 项目的目录地址，默认为：执行命令的目录[ `process.cwd()` ]

### 3. `monorepo js-style`

为工程添加样式 5. `-p, --prettier`：使用 `prettier` 进行代码格式化，默认 6. `--no-prettier`：不使用 `prettier` 12. `-d, --director <director>`: 项目的目录地址，默认为：执行命令的目录[ `process.cwd()` ] 4. `-t, --tool <package-tool>`：使用的包管理工具，只能是 `berry`、`npm` 中的一个，默认为：`berry`
