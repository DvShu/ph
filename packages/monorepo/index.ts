#!/usr/bin/env node
import path = require('path')
import commander = require('commander')
const program = commander.program
import pkg = require('./package.json')
import { createFiles, createPackage, checkDev } from './utils'
import fs = require('fs/promises')
import Spinner = require('ph-terminal-spinner')
import fileUtils = require('ph-utils/lib/file')
import {
  proTemplates,
  wsTemplates,
  vueApp,
  vueMain,
  lintTemplates,
} from './templates'

// 名称-版本-描述
program.name('monorepo').description(pkg.description).version(pkg.version)

// let targetPath = path.resolve('/www/wwwlogs/a')
let targetPath = process.cwd()

// 全局变量，用于模板引擎替换
const globalVars: { name: string; [index: string]: string } = {
  name: '',
  viteConfigVueImport: '',
  viteConfigVueUse: '',
}

interface InitOption {
  vue: boolean
  lint: boolean
}

async function init(name: string, options: InitOption) {
  globalVars['name'] = name
  if (options.vue) {
    globalVars['viteConfigVueImport'] = "import vue from '@vitejs/plugin-vue'"
    globalVars['viteConfigVueUse'] = 'vue()'
  }
  const basename = path.basename(targetPath)
  let pkg = proTemplates.get('package.json')
  pkg = await createPackage(basename, options.vue, pkg)
  proTemplates.set('package.json', pkg)
  let queues: any[] = []
  createFiles(proTemplates, queues, targetPath, globalVars)
  const wsPath = path.join(targetPath, 'packages', name)
  const srcPath = path.join(wsPath, 'src')
  queues.push(fs.mkdir(srcPath, { recursive: true }))
  await Promise.all(queues)
  queues = []
  createFiles(wsTemplates, queues, wsPath, globalVars)
  if (options.vue) {
    queues.push(fileUtils.write(path.join(srcPath, 'main.ts'), vueMain))
    queues.push(fileUtils.write(path.join(srcPath, 'App.vue'), vueApp))
  } else {
    queues.push(
      fileUtils.write(
        path.join(srcPath, 'main.ts'),
        "document.getElementById('app').textContent = 'Hello World!!!'"
      )
    )
  }
  if (options.lint) {
    await lint()
  }
}

async function lint() {
  const pkg = await fileUtils.readJSON<{
    devDependencies: { [index: string]: string }
    dependencies: { [index: string]: string }
    scripts: { [index: string]: string }
  }>(path.join(targetPath, 'package.json'))
  const isVue = 'vue' in pkg.dependencies || 'vue' in pkg.devDependencies
  const d = [
    'eslint',
    'prettier',
    '@typescript-eslint/eslint-plugin',
    '@typescript-eslint/parser',
    'eslint-config-prettier',
  ]
  if (isVue) {
    d.push('eslint-plugin-vue')
    d.push('vue-eslint-parser')
  }
  let queues: any = []
  for (const di of d) {
    queues.push(checkDev(di))
  }
  const allD = await Promise.all(queues)
  for (const allI of allD) {
    pkg.devDependencies[allI[0]] = allI[1]
  }
  pkg.scripts['lint'] = 'eslint --fix --ext .vue,.js,.ts packages/'
  await fileUtils.write(path.join(targetPath, 'package.json'), pkg)
  const eslintConfig = lintTemplates.get('.eslintrc.json')
  if (isVue) {
    eslintConfig['parser'] = 'vue-eslint-parser'
    eslintConfig['parserOptions'] = {
      parser: '@typescript-eslint/parser',
      ecmaVersion: 'latest',
      sourceType: 'module',
    }
    eslintConfig['env'] = { 'vue/setup-compiler-macros': true }
    eslintConfig['extends'].splice(2, 0, 'plugin:vue/vue3-recommended')
    eslintConfig['rules']["'vue/script-setup-uses-vars'"] = 'error'
    eslintConfig['rules']["'no-unused-vars'"] = 'error'
    lintTemplates.set('.eslintrc.json', eslintConfig)
  }
  queues = []
  createFiles(lintTemplates, queues, targetPath, globalVars)
  await Promise.all(queues)
}

program
  .command('init <name>')
  .description('初始化 monorepo 工程')
  .option('--vue', '是否是 vue 项目', true)
  .option('--no-vue')
  .option('--lint', '是否初始化 eslint + prettier', true)
  .option('--no-lint')
  .action(async (name: string, options: InitOption) => {
    const spinner = new Spinner()
    spinner.start('正在开始构建工程')
    await init(name, options)
    spinner.succeed('工程构建完成')
    const logs = [
      '  安装依赖：npm install',
      `  开发：npm run dev 或 npm run dev --${globalVars.name}`,
      `  构建：npm run build 或 npm run build --${globalVars.name}`,
    ].join('\n')
    console.log(logs)
  })

program
  .command('create')
  .alias('c')
  .argument('<projectName>', '工程名称')
  .argument('<workspaceName>', '工作区名称')
  .description('创建项目')
  .option('--vue', '是否是 vue 项目', true)
  .option('--no-vue')
  .option('--lint', '是否初始化 eslint + prettier', true)
  .option('--no-lint')
  .action(async (proName: string, wsName: string, options: InitOption) => {
    const spinner = new Spinner()
    spinner.start('正在开始创建工程')
    targetPath = path.join(targetPath, proName)
    await fs.mkdir(targetPath)
    await init(wsName, options)
    spinner.succeed('工程创建完成')
    const logs = [
      `  1. cd ${proName}`,
      '  2. 安装依赖：npm install',
      `  3. 开发：npm run dev 或 npm run dev --${globalVars.name}`,
      `  4. 构建：npm run build 或 npm run build --${globalVars.name}`,
    ].join('\n')
    console.log(logs)
  })

program
  .command('lint')
  .description('初始化 eslint + prettier')
  .action(async () => {
    console.log('重置 eslint + prettier 规则')
    const spinner = new Spinner()
    spinner.start('正在开始初始化 eslint + prettier')
    await lint()
    spinner.succeed('eslint + prettier 初始化成功')
  })

program.parse(process.argv)
