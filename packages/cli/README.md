# cli

---

命令行工具集

## 安装

```shell
npm install @fly_dream/cli -g
```

## 使用

`@fly_dream/cli` 提供了一个单一的命令行命令 `tcli`

```shell
$ tcli
```

运行上面的命令将会打印帮助信息：

```text
Usage: tcli [options] [command]

工程化命令行 cli 工具

Options:
  -V, --version   显示版本号
  -h, --help      display help for command

Commands:
  rm [dirs...]    强制删除文件夹,可以用空格或逗号分隔多个目录,默认:node_modules
  help [command]  display help for command
```

### `rm`

删除文件或者文件夹

```shell
tcli rm node_modules
```

可以删除多个文件或者目录

```shell
tcli rm dist build
```

上面的命令将会删除 `dist` 和 `build` 目录; 执行下面的命令也会有相同的效果：

```shell
tcli rm dist,build
```

### `git-init`

初始化 `git`, 执行的逻辑有:

```shell
git init

git config user.name "xxx"

git config user.email "xxx"

git remote add origin xxx
```

### `lint-init`

初始化 `eslint` + `prettier`

选项:
*. `-f, --frame <frame>`: 使用的框架,支持 `vue`, `react`, `vanilla`; 默认: `vue`
