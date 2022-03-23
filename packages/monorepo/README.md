# monorepo

---

创建 monorepo 工程以及初始化 eslint + prettier

## 安装

```
npm install @fly_dream/monorepo -g
```

## 使用

### 版本以及帮助

```javascript
// 版本
monorepo --version // monorepo -V

// 帮助
monorepo --help
```

### 1. `monorepo init <name>`

初始化 `monorepo` 项目，`name` 为创建的 `workspace` 工作区名称，所有支持配置项如下：

1. `--vue`：是否是 `vue` 项目，默认 `true`
2. `--no-vue`：不是 `vue` 项目
3. `--lint`：使用 `eslint` 进行代码规范校验，默认: `true`
4. `--no-lint`：不使用 `eslint`

### 2. `monorepo create|c <projectName> <workspaceName>`

创建 `monorepo` 项目，`projectName` 为创建的项目名称，`workspaceName` 为创建的 `workspace` 工作区名称，所有支持配置项如下：

1. `--vue`：是否是 `vue` 项目，默认 `true`
2. `--no-vue`：不是 `vue` 项目
3. `--lint`：使用 `eslint` 进行代码规范校验，默认: `true`
4. `--no-lint`：不使用 `eslint`

### 3. `monorepo lint`

初始化 `eslint + prettier`

### 4. `rm [dir]`

强制删除目录，默认为：node_modules
