import fs = require('fs')
const fsp = fs.promises
import path = require('path')
import commander = require('commander')
const program = commander.program
import utils = require('ph-utils')
import fileUtils = require('ph-utils/lib/file')
import colors = require('ansi-colors')
import https = require('https')
import Spinner = require('ph-terminal-spinner')
import serverUtils = require('ph-utils/lib/server')
import { URL } from 'url'
import pkg from './package.json'
const enquirer = require('enquirer')
/** 模板文件地址 */
const TEMPLATE_PATH = path.join(__dirname, 'templates')

program.version(pkg.version)
const spinner = new Spinner()

/** 工程的 package.json 模板内容 */
let pPkg: any = {
  description: '',
  private: true,
  workspaces: ['packages/*'],
  author: '',
  repository: {
    type: 'git',
    url: 'git+https//gitee.com/towardly/x.git',
    directory: 'packages/x',
  },
}
const eslintConfig: any = {
  extends: ['alloy'],
  rules: {
    // 自定义你的规则
    'no-eq-null': 'off',
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'no-param-reassign': 'off',
    'max-params': ['error', 5],
  },
}

interface RepositoryInfo {
  type: string
  url: string
  directory?: string
}
// 工作区(workspace) pcakge.json 模板内容
let wsPkg: any = {
  name: '',
  description: '',
  main: 'index.js',
  types: 'index.d.ts',
  version: '0.0.1',
  repository: {
    type: 'git',
    url: 'git+https//gitee.com/towardly/x.git',
    directory: 'packages/x',
  },
  license: 'MIT',
  author: '',
  bugs: {
    url: 'https://gitee.com/towardly/x/issues',
  },
  homepage: 'https://gitee.com/towardly/x/tree/master/packages/x',
  files: ['index.js', 'index.d.ts'],
  keywords: ['nodejs', 'ph'],
}

// eslint prettier git 通用的忽略
const eslintIgnore = ['/.yarn/*', '/**/*.d.ts', '.pnp.js']
const gitignore = ['node_modules', '*.log', '.idea', '.vscode', '/packages/**/LICENSE', '/**/*.d.ts']

/**
 * 下载更新 yarn 版本到 berry，类似于执行命令 yarn set version berry
 * @param yarnPath 下载后的 berry 文件保存目录
 * @param rc  下载次数，做失败重连处理，最多4次，超过4次则触发下载失败
 * @param cb  下载完成后的回调，参数表示是否失败
 */
function downloadBerry(yarnPath: string, rc: number, cb: (isError: boolean) => void) {
  let req = https.get('https://codechina.csdn.net/u011113654/yarn2-berry/-/raw/master/yarn-berry.cjs', (res) => {
    res.setEncoding('utf-8')
    let savePath = path.join(yarnPath, 'yarn-berry.cjs')
    let saveStream = fs.createWriteStream(savePath)
    saveStream.on('close', () => {
      cb(false)
    })
    res.pipe(saveStream)
  })
  req.on('error', () => {
    if (rc === 4) {
      cb(true)
      // console.log('下载 berry 失败，请参考 https://gitee.com/towardly/yarn2-berry 手动下载！')
    } else {
      rc++
      downloadBerry(yarnPath, rc, cb)
    }
  })
}

interface WorkspaceConfig {
  name: string
  author?: string
  path: string
  isTs: boolean
  isNode: boolean
  proPath: string
  repository?: RepositoryInfo
}

/**
 * 初始化工作区
 * @param workspaceConfig
 * @param wsDevs
 * @returns
 */
function initWorkspace(workspaceConfig: WorkspaceConfig, wsDevs: string[]) {
  return new Promise((resolve) => {
    spinner.start('初始化工作区文件')
    wsPkg = { ...wsPkg, name: workspaceConfig.name, author: workspaceConfig.author || '' }
    if (workspaceConfig.repository != null) {
      wsPkg.repository = { ...workspaceConfig.repository, directory: 'packages/' + workspaceConfig.name }
      const url = new URL(workspaceConfig.repository.url)
      const urlAddr = path.parse(url.pathname)
      wsPkg.bugs = { url: `https://${url.host}${urlAddr.dir}/${urlAddr.name}/issues` }
      wsPkg.homepage = `https://${url.host}${urlAddr.dir}/${urlAddr.name}/tree/master/packages/${workspaceConfig.name}`
    }
    // 复制 LICENSE 文件
    fs.copyFile(path.join(workspaceConfig.proPath, 'LICENSE'), path.join(workspaceConfig.path, 'LICENSE'), () => {})

    // 构造主文件 index.ts
    fileUtils.write(path.join(workspaceConfig.path, 'index.ts'), `console.log('${workspaceConfig.name}')`)
    // README.md
    fileUtils.write(path.join(workspaceConfig.path, 'README.md'), `#${workspaceConfig.name}\r\n---`)
    if (workspaceConfig.isTs) {
      wsPkg.scripts = { build: 'tsc' }
      wsDevs.push('typescript')
      let tsConfig: any = {
        extends: '../../tsconfig_base.json',
        compilerOptions: {
          module: 'CommonJS',
          outDir: './',
        },
        files: ['index.ts'],
      }
      if (!workspaceConfig.isNode) {
        tsConfig.compilerOptions = {
          module: 'es6',
          resolveJsonModule: false,
          outDir: './',
        }
      } else {
        wsDevs.push('@types/node')
      }
      // 写入 tsconfig.json 文件
      fileUtils.write(path.join(workspaceConfig.path, 'tsconfig.json'), tsConfig)
    }
    // 写入 package.json
    fileUtils.write(path.join(workspaceConfig.path, 'package.json'), wsPkg)
    spinner.succeed('初始化工作区成功')
    resolve(0)
  })
}

/**
 * 更新 yarn 版本
 * @param proPath
 * @returns
 */
function updateYarn(proPath: string) {
  return new Promise((resolve, reject) => {
    spinner.start('更新yarn版本为berry')
    // 更新 yarn 版本至 berry
    const yarnPath = path.join(proPath, '.yarn', 'releases')
    fs.mkdir(yarnPath, { recursive: true }, () => {})
    fileUtils.write(path.join(proPath, '.yarnrc.yml'), 'yarnPath: ".yarn/releases/yarn-berry.cjs"')
    let rc = 0 // 重试次数
    // 下载更新 yarn 版本到 berry
    downloadBerry(yarnPath, rc, (isError) => {
      if (isError === true) {
        spinner.fail('更新yarn版本失败')
        reject(new utils.BaseError('UpgradeYarnError', 'update yarn to berry error'))
      } else {
        spinner.succeed('更新yarn版本成功')
        resolve(0)
      }
    })
  })
}

/**
 * 初始化工程
 * @param proPath 工程目录
 * @param config 配置项
 * @param proDevs 工程依赖
 * @returns
 */
function initProject(proPath: string, config: CreateConfig, proDevs: string[]) {
  return new Promise((resolve) => {
    spinner.start('构建项目文件')
    if (config.license === true) {
      fs.copyFile(path.join(TEMPLATE_PATH, 'LICENSE'), path.join(proPath, 'LICENSE'), () => {})
    }
    if (config.ts === true) {
      // 使用 ts
      fs.copyFile(path.join(TEMPLATE_PATH, 'tsconfig_base.json'), path.join(proPath, 'tsconfig_base.json'), () => {})
      eslintIgnore.push('/**/*.js')
      gitignore.push('/**/*.js')
      eslintConfig.extends.push('alloy/typescript')
      eslintConfig.rules['@typescript-eslint/no-require-imports'] = 'off'
    } else {
      eslintConfig.parser = 'espree'
    }
    if (config.prettier === true) {
      proDevs.push('prettier')
      // 需要 prettier
      fs.copyFile(path.join(TEMPLATE_PATH, '.prettierrc.js'), path.join(proPath, '.prettierrc.js'), () => {})
      fileUtils.write(path.join(proPath, '.prettierignore'), eslintIgnore.join('\r\n'))
    }
    if (config.eslint === true) {
      proDevs.push('eslint eslint-config-alloy')
      if (config.ts === true) {
        proDevs.push('@typescript-eslint/eslint-plugin @typescript-eslint/parser')
      }
      // 需要 eslint
      fileUtils.write(path.join(proPath, '.eslintignore'), eslintIgnore.join('\r\n'))
      fileUtils.write(path.join(proPath, '.eslint.js'), 'module.exports = ' + JSON.stringify(eslintConfig, null, 2))
    }
    // 新建 package.json
    fileUtils.write(path.join(proPath, 'package.json'), pPkg)
    // .gitignore
    fileUtils.write(path.join(proPath, '.gitignore'), gitignore.join('\r\n'))
    spinner.succeed('项目文件构建成功')
    resolve(0)
  })
}

/** 创建 monorepo 项目时需要的参数 */
interface CreateConfig {
  /** 是否使用ts，默认为：true  */
  ts: boolean
  /** 是否需要 eslint ，默认为：true */
  eslint: boolean
  /** 是否需要 prettier 进行格式化，默认为：true */
  prettier: boolean
  /** 是否需要 license，默认为：true */
  license: boolean
  /** 新建项目的同时创建工作区 */
  workspace?: string
  /** 是否是NodeJs(Commonjs)项目，而非 WEB(ES Module)，默认为：true  */
  node: boolean
  /** 创建项目的目录地址，默认为：执行命令的目录 */
  director?: string
}

// 定义创建项目的命令
program
  .command('create <name>')
  .alias('c')
  .description('创建基于 yarn v2 的 monorepo 项目')
  .option('--ts', '是否使用ts，默认为：true', true)
  .option('--no-ts', '不使用ts')
  .option('-e, --eslint', '是否需要 eslint ，默认为：true', true)
  .option('--no-eslint', '不需要 eslint ')
  .option('-p, --prettier', '是否需要 prettier 进行格式化，默认为：true', true)
  .option('--no-prettier', '不需要prettier')
  .option('-n, --node', '是否是NodeJs(Commonjs)项目，而非 WEB(ES Module)，默认为：true', true)
  .option('--no-node', '不是nodejs项目')
  .option('-l, --license', '是否需要 LICENSE 文件，默认为：true', true)
  .option('--no-license', '不需要 license 文件，一般私有项目开发时配置')
  .option('-w --workspace <name>', '新建项目的同时创建工作区')
  .option('-d, --director <director>', '创建项目的目录地址，默认为：执行命令的目录')
  .action((name: string, destination: CreateConfig) => {
    const spinner = new Spinner()
    pPkg = { name, ...pPkg }
    const projectPath = path.join(destination.director || process.cwd(), name) // 项目目录
    let workspacePath = path.join(projectPath, 'packages') // 工作区目录
    if (!utils.isBlank(destination.workspace)) {
      // 创建项目的同时创建工作区
      workspacePath = path.join(workspacePath, destination.workspace as string)
    }
    const proDevs: string[] = [] // 工程依赖
    const wsDevs: string[] = [] // 工作区依赖
    // 验证文件是否存在
    fsp
      .access(projectPath, fs.constants.F_OK)
      .then(
        () => {
          console.error(colors.red(`目录 ${projectPath} 已经存在！`))
        },
        () => {
          spinner.start('创建项目目录')
          // 创建文件夹
          fsp
            .mkdir(workspacePath, { recursive: true })
            .then(() => {
              spinner.succeed('创建项目目录成功')
              // 初始化项目
              return initProject(projectPath, destination, proDevs)
            })
            .then(() => updateYarn(projectPath))
            .then(() => {
              // 初始化 工作区文件
              if (!utils.isBlank(destination.workspace)) {
                return initWorkspace(
                  {
                    name: destination.workspace as string,
                    isTs: destination.ts,
                    path: workspacePath,
                    isNode: destination.node,
                    proPath: projectPath,
                  },
                  wsDevs,
                )
              } else {
                return Promise.resolve(0)
              }
            })
            .then(() => {
              spinner.start('安装依赖')
              if (proDevs.length === 0) {
                return Promise.resolve(0)
              }
              // 安装项目依赖
              return serverUtils.execPromise(`yarn add ${proDevs.join(' ')} --dev`, {
                cwd: projectPath,
                errorName: 'ProjectDevError',
              })
            })
            .then(() => {
              if (wsDevs.length === 0) {
                return Promise.resolve(0)
              }
              // 安装工作区依赖
              return serverUtils.execPromise(
                `yarn workspace ${destination.workspace} add ${wsDevs.join(' ')} --dev --cached`,
                { cwd: projectPath, errorName: 'WorkspaceDevError' },
              )
            })
            .then(() => {
              spinner.succeed('依赖安装成功')
              spinner.succeed('初始化项目成功，请先按以下步骤执行，再进行项目开发：')
              spinner.stop()
              const steps = [
                `  1. 编辑 ${name} -- > package.json 中 repository 和 author 字段以自动填充工作区初始化\r\n`,
                '  2. 如果需要 LICENSE 文件的话请在项目根目录下放置一份，这样后续构建工作区的时候会自动拷贝到每一个工作区',
              ]
              if (!utils.isBlank(destination.workspace)) {
                steps.push(`  3. 完善 ${destination.workspace} --> package.json 文件\r\n`)
              }
              console.log(colors.green(steps.join('')))
            })
            .catch((err) => {
              console.log(err)
              spinner.fail('依赖安装失败')
              spinner.stop()
            })
        },
      )
      .catch((err) => {
        console.log(err)
      })
  })

interface CreateWorkspaceConfig {
  /** 是否是NodeJs(Commonjs)项目，而非 WEB(ES Module)，默认为：true */
  node: boolean
  /** 项目的目录地址，默认为：执行命令的目录 */
  director?: string
}

function accessTs(tsconfigPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    fs.access(tsconfigPath, fs.constants.F_OK, (err) => {
      if (err) {
        resolve(false)
      } else {
        resolve(true)
      }
    })
  })
}

interface PackageInfo {
  /** 开发人员 */
  author: string
  /** 工程仓库地址 */
  repository: RepositoryInfo
}

// 定义构建工作区的命令
program
  .command('workspace <name>')
  .alias('ws')
  .description('构建基于 yarn v2(berry) 的 monorepo 项目的工作区')
  .option('-n, --node', '是否是NodeJs(Commonjs)项目，而非 WEB(ES Module)，默认为：true', true)
  .option('--no-node', '不是nodejs项目')
  .option('-d, --director <director>', '项目的目录地址，默认为：执行命令的目录')
  .action((name: string, config: CreateWorkspaceConfig) => {
    const proPath = config.director || process.cwd()
    const workspacePath = path.join(proPath, 'packages', name)
    const wsDevs: string[] = []
    fsp
      .mkdir(workspacePath)
      .then(() => {
        // 检查项目根目录是否存在 tsconfig_base.json 和 读取根目录 package.json
        return Promise.all([
          accessTs(path.join(proPath, 'tsconfig_base.json')),
          fileUtils.readJSON<PackageInfo>(path.join(proPath, 'package.json')),
        ])
      })
      .then((val: [boolean, PackageInfo]) => {
        return initWorkspace(
          {
            name,
            proPath: proPath,
            path: workspacePath,
            isTs: val[0],
            isNode: config.node,
            repository: (val[1] as any).repository,
          },
          wsDevs,
        )
      })
      .then(() => {
        spinner.start('安装工作区依赖')
        if (wsDevs.length === 0) {
          return Promise.resolve(0)
        } else {
          // 安装工作区依赖
          return serverUtils.execPromise(`yarn workspace ${name} add ${wsDevs.join(' ')} --dev --cached`, {
            cwd: proPath,
            errorName: 'WorkspaceDevError',
          })
        }
      })
      .then(() => {
        spinner.succeed('安装工作区依赖成功')
        spinner.start('添加开发工具支持')
        return serverUtils.execPromise('yarn dlx @yarnpkg/pnpify --sdk vscode', {
          cwd: proPath,
          errorName: 'EditorSetupError',
        })
      })
      .then(() => {
        spinner.succeed('添加开发工具支持成功')
        console.log(colors.green('\r\n添加 eslint 成功 \r\n'))
        console.log(colors.green('请先完善工作区下面的 package.json 文件再进行开发'))
      })
      .catch(() => {
        console.error(colors.red('错误的项目目录地址'))
      })
  })

interface JsStyleConfig {
  /** 是否需要 prettier 格式化代码，默认为：true */
  prettier: boolean
  /** 包管理工具, 默认使用 yarn v2 版本 berry 作为包管理工具 */
  tool: string
  /** 项目的目录地址，默认为：执行命令的目录 */
  director?: string
  /** 是否需要使用 typescript */
  ts: boolean
}

/**
 * 初始化样式文件
 * @param proPath
 * @param config
 * @param devs
 * @returns
 */
function initStyle(proPath: string, config: JsStyleConfig, devs: string[]) {
  return new Promise((resolve) => {
    spinner.start('初始化样式文件')
    if (config.ts === true) {
      // 使用 ts
      eslintIgnore.push('/**/*.js')
      gitignore.push('/**/*.js')
      eslintConfig.extends.push('alloy/typescript')
      eslintConfig.rules['@typescript-eslint/no-require-imports'] = 'off'
      devs.push('@typescript-eslint/eslint-plugin @typescript-eslint/parser')
    } else {
      eslintConfig.parser = 'espree'
    }
    if (config.prettier === true) {
      devs.push('prettier')

      // 需要 prettier
      fs.copyFile(path.join(TEMPLATE_PATH, '.prettierrc.js'), path.join(proPath, '.prettierrc.js'), () => {})
      fileUtils.write(path.join(proPath, '.prettierignore'), eslintIgnore.join('\r\n'))
    }
    // 需要 eslint
    fileUtils.write(path.join(proPath, '.eslintignore'), eslintIgnore.join('\r\n'))
    fileUtils.write(path.join(proPath, '.eslint.js'), 'module.exports = ' + JSON.stringify(eslintConfig, null, 2))
    spinner.succeed('样式文件初始化成功')
    resolve(0)
  })
}

program
  .command('js-style')
  .description('为工程添加样式')
  .option('-p, --prettier', '是否需要 prettier 格式化代码，默认为：true', true)
  .option('--no-prettier', '不需要 prettier 格式化代码')
  .option('-d, --director <director>', '项目的目录地址，默认为：执行命令的目录')
  .addOption(
    new commander.Option('-t, --tool <package-tool>', '包管理工具')
      .default('berry', '默认使用 yarn v2 版本 berry 作为包管理工具')
      .choices(['berry', 'npm']),
  )
  .action((config: JsStyleConfig) => {
    const proPath = config.director || process.cwd()
    const devs: string[] = ['eslint', 'eslint eslint-config-alloy']
    fsp
      .access(path.join(proPath, 'package.json'), fs.constants.F_OK)
      .then(() => accessTs(path.join(proPath, 'tsconfig_base.json')))
      .then((isTs: boolean) => {
        config.ts = isTs
        return initStyle(proPath, config, devs)
      })
      .then(() => {
        spinner.start('安装依赖')
        let cmd = ''
        if (config.tool === 'npm') {
          cmd = `npm install ${devs.join(' ')} --save-dev`
        } else {
          cmd = `yarn add ${devs.join(' ')} --dev`
        }
        return serverUtils.execPromise(cmd, { cwd: proPath, errorName: 'InstallDependsError' })
      })
      .then(() => {
        spinner.succeed('依赖安装成功')
        spinner.start('添加开发工具支持')
        if (config.tool === 'berry') {
          return serverUtils.execPromise('yarn dlx @yarnpkg/pnpify --sdk vscode', {
            cwd: proPath,
            errorName: 'EditorSetupError',
          })
        } else {
          return Promise.resolve(0)
        }
      })
      .then(() => {
        spinner.succeed('添加开发工具支持成功')
        console.log(colors.green('\r\n添加 eslint 成功 \r\n'))
      })
      .catch(() => {
        spinner.fail('添加 eslint 失败')
      })
  })

interface Answer1Intf {
  static: boolean
  view: boolean
  mysql: boolean
}

interface Answer2Intf {
  host: string
  user: string
  password: string
  database: string
}

function isWorkspace(proPath: string): Promise<{ ws: number; repository?: any }> {
  return new Promise((resolve) => {
    fileUtils
      .readJSON<{ private: boolean; workspaces: string[]; repository: any }>(path.join(proPath, 'package.json'))
      .then((proPkgInfo) => {
        if (proPkgInfo.private === true && proPkgInfo.workspaces != null) {
          resolve({ ws: 1, repository: proPkgInfo.repository })
        } else {
          resolve({ ws: 0 })
        }
      })
      .catch(() => {
        resolve({ ws: -1 })
      })
  })
}

interface FastifyConfig {
  app: boolean
  eslint: boolean
  prettier: boolean
  director?: string
}

interface FastifyCreateConfig {
  /** 是否需要处理静态资源文件 */
  static: boolean
  /** 是否需要模板渲染引擎 */
  view: boolean
  /** 是否需要 mysql */
  mysql: boolean
  /** 工程目录 */
  path: string
  /** mysql连接项 */
  mysqlConn: string
  demoMysqlConn: string
  name: string
  app: boolean
}

/**
 * 初始化 fastify app 项目
 */
function initFastify(config: FastifyCreateConfig, deps: string[]) {
  return new Promise((resolve) => {
    spinner.start('初始化 fastify app 项目')
    // 新建存放路径文件的文件夹
    fs.mkdir(path.join(config.path, 'routes'), () => {})
    // 新建单元测试文件夹
    fs.mkdir(path.join(config.path, 'test/routes'), { recursive: true }, () => {})
    if (config.static) {
      // 需要处理静态资源文件, 新建 public 文件夹
      fs.mkdir(path.join(config.path, 'public'), () => {})
      deps.push('fastify-static')
    }
    if (config.view) {
      // 需要模板渲染引擎, 新建 views 文件夹
      fs.mkdir(path.join(config.path, 'views'), () => {})
      deps.push('nunjucks point-of-view')
    }
    if (config.mysql) {
      deps.push('mysql2 fastify-bookshelf')
    }

    // 构建 config.js 和 config_demo.js
    fileUtils.write(
      path.join(config.path, 'config.js'),
      `module.exports = {\r\n  port: 3000,\r\n  mysql: '${config.mysqlConn}',\r\n};`,
    )
    fileUtils.write(
      path.join(config.path, 'config_demo.js'),
      `module.exports = {\r\n  port: 3000,\r\n  mysql: '${config.demoMysqlConn}',\r\n};`,
    )
    // 重新替换 .gitignore
    fs.readFile(path.join(config.path, '.gitignore'), 'utf-8', (err, gitignoreContent: string) => {
      if (err == null) {
        gitignoreContent += '\r\n.yarn\r\n.pnp.js\r\n.yarnrc.yml\r\nconfig.js'
        fileUtils.write(path.join(config.path, '.gitignore'), gitignoreContent)
      }
    })
    // 复制开发工具配置文件
    fs.copyFile(path.join(TEMPLATE_PATH, 'nodemon.json'), path.join(config.path, 'nodemon.json'), () => {})

    // 写 server.js 内容
    fs.readFile(path.join(TEMPLATE_PATH, 'fastify_server.txt'), 'utf-8', (err, serverContent: string) => {
      if (err == null) {
        serverContent = serverContent.replace(/@\{name\}/g, config.name)
        let scs = serverContent.split('!-----!')
        let writeContent = [scs[0]]
        if (config.mysql) {
          writeContent.push(scs[1])
        }
        if (config.static) {
          writeContent.push(scs[2])
        }
        if (config.view) {
          writeContent.push(scs[3])
        }
        writeContent.push(scs[4])
        fileUtils.write(path.join(config.path, 'server.js'), writeContent.join(''))
      }
    })

    // 修改 package.json 的 scripts
    fileUtils.readJSON<{ scripts: object; workspaces?: object }>(path.join(config.path, 'package.json')).then((pkg) => {
      pkg.scripts = {
        test: 'mocha',
        dev: 'nodemon server.js',
      }
      if (config.app) delete pkg.workspaces
      fileUtils.write(path.join(config.path, 'package.json'), pkg)
    })

    if (config.app === false) {
      // workspace 工程，删除 index.ts 和 LICENSE
      fs.rm(path.join(config.path, 'LICENSE'), () => {})
      fs.rm(path.join(config.path, 'index.ts'), () => {})
    }

    // 新建路由文件夹
    setTimeout(() => {
      fs.copyFile(path.join(TEMPLATE_PATH, 'api.js'), path.join(config.path, 'routes/api.js'), () => {})
      fs.copyFile(path.join(TEMPLATE_PATH, 'root.js'), path.join(config.path, 'routes/root.js'), () => {})
      // 复制单元测试所需文件
      fs.copyFile(path.join(TEMPLATE_PATH, '.mocharc.js'), path.join(config.path, '.mocharc.js'), () => {})
      fs.copyFile(path.join(TEMPLATE_PATH, 'helper.js'), path.join(config.path, 'test/helper.js'), () => {})
      fs.copyFile(path.join(TEMPLATE_PATH, 'api.test.js'), path.join(config.path, 'test/routes/api.test.js'), () => {})
    }, 150)

    spinner.succeed('初始化fastify app 项目成功')
    resolve(0)
  })
}

program
  .command('fastify <name>')
  .alias('f')
  .description('创建 fastify 项目')
  .option('-e, --eslint', '是否需要 eslint ，默认为：true', true)
  .option('--no-eslint', '不需要 eslint ')
  .option('-p, --prettier', '是否需要 prettier 进行格式化，默认为：true', true)
  .option('--no-prettier', '不需要prettier')
  .option('-d, --director <director>', '项目的目录地址，默认为：执行命令的目录')
  .action((name: string, config: FastifyConfig) => {
    let asw1: Answer1Intf
    let asw2: Answer2Intf
    let proPath = config.director || process.cwd()
    let devs: string[] = ['mocha pino-smart']
    let deps: string[] = ['fastify']
    let isApp = true
    enquirer
      .prompt([
        {
          message: '是否需要处理静态文件?',
          type: 'confirm',
          initial: false,
          name: 'static',
        },
        {
          name: 'view',
          type: 'confirm',
          initial: false,
          message: '是否需要模板渲染引擎?',
        },
        {
          name: 'mysql',
          type: 'confirm',
          initial: false,
          message: '是否需要使用mysql数据库?',
        },
      ])
      .then((a: Answer1Intf) => {
        asw1 = a
        if (a.mysql) {
          return enquirer.prompt([
            {
              header: '-----------------------',
              name: 'host',
              type: 'input',
              message: '请输入mysql数据库host:',
            },
            {
              name: 'user',
              type: 'input',
              message: '请输入mysql数据库user:',
            },
            {
              name: 'password',
              type: 'input',
              message: '请输入mysql数据库password:',
            },
            {
              name: 'database',
              type: 'input',
              message: '请输入mysql数据库database:',
            },
          ])
        } else {
          return Promise.resolve(0)
        }
      })
      .then((a2: Answer2Intf | number) => {
        if (a2 !== 0) {
          asw2 = a2 as Answer2Intf
        }
        return isWorkspace(proPath)
      })
      .then((wsInfo: any) => {
        if (wsInfo.ws === 0) {
          console.log(colors.red('目录错误！'))
          return Promise.reject(new Error('director error'))
        } else if (wsInfo.ws === -1) {
          // 新建独立的工程
          proPath = path.join(proPath, name)
          fs.mkdir(proPath, () => {})
          return initProject(
            proPath,
            {
              ts: false,
              license: false,
              node: true,
              eslint: config.eslint,
              prettier: config.prettier,
            },
            devs,
          )
        } else {
          isApp = false
          // workspace
          proPath = path.join(proPath, 'packages', name)
          fs.mkdir(proPath, () => {})
          return initWorkspace(
            {
              name,
              isTs: false,
              isNode: true,
              path: proPath,
              proPath: '',
              repository: wsInfo.repository,
            },
            devs,
          )
        }
      })
      .then(() =>
        initFastify(
          {
            ...asw1,
            path: proPath,
            mysqlConn: asw1.mysql ? `mysql://${asw2.user}:${asw2.password}@${asw2.host}:3306/${asw2.database}` : '',
            demoMysqlConn: asw1.mysql ? `mysql://${asw2.user}:${asw2.password}@127.0.0.1:3306/${asw2.database}` : '',
            name,
            app: isApp,
          },
          deps,
        ),
      )
      .then(() => {
        if (isApp === true) {
          return updateYarn(proPath)
        } else {
          return Promise.resolve(0)
        }
      })
      .then(() => {
        spinner.start('安装开发依赖')
        if (devs.length === 0) {
          return Promise.resolve(0)
        } else {
          let cmd = isApp
            ? `yarn add ${devs.join(' ')} --dev`
            : `yarn workspace ${name} add ${devs.join(' ')} --dev --cached`
          // 安装工作区依赖
          return serverUtils.execPromise(cmd, {
            cwd: proPath,
            errorName: 'DevError',
          })
        }
      })
      .then(() => {
        spinner.succeed('安装开发依赖成功')
        spinner.start('安装工程依赖')
        if (deps.length === 0) {
          return Promise.resolve(0)
        } else {
          let cmd = isApp ? `yarn add ${deps.join(' ')}` : `yarn workspace ${name} add ${deps.join(' ')} --cached`
          // 安装工作区依赖
          return serverUtils.execPromise(cmd, {
            cwd: proPath,
            errorName: 'DepError',
          })
        }
      })
      .then(() => {
        spinner.succeed('安装工程依赖成功')
        spinner.start('添加开发工具支持')
        if (isApp) {
          return serverUtils.execPromise('yarn dlx @yarnpkg/pnpify --sdk vscode', {
            cwd: proPath,
            errorName: 'EditorSetupError',
          })
        } else {
          return Promise.resolve(0)
        }
      })
      .then(() => {
        spinner.succeed('添加开发工具支持成功')
        console.log(colors.green('\r\n项目构建成功\r\n'))
      })
      .catch(() => {
        spinner.fail('构建失败')
      })
  })

program.parse(process.argv)
