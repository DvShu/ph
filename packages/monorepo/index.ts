#!/usr/bin/env node
import path = require('path')
import commander = require('commander')
const program = commander.program
import pkg = require('./package.json')
import fileUtils = require('ph-utils/lib/file')
import https = require('https')
import fs = require('fs/promises')

// 名称-版本-描述
program.name('monorepo').description(pkg.description).version(pkg.version)

const targetPath = path.resolve('/www/wwwlogs/a')

// 工程模板
const templates = new Map<string, any>([
  [
    'tsconfig.json',
    {
      compilerOptions: {
        target: 'esnext',
        useDefineForClassFields: true,
        module: 'esnext',
        moduleResolution: 'node',
        strict: true,
        jsx: 'preserve',
        sourceMap: true,
        resolveJsonModule: true,
        esModuleInterop: true,
        lib: ['esnext', 'dom'],
      },
      include: ['packages/**/*.ts', 'packages/**/*.d.ts', 'packages/**/*.tsx', 'packages/**/*.vue', 'env.d.ts'],
      references: [{ path: './tsconfig.node.json' }],
    },
  ],
  [
    'tsconfig.node.json',
    {
      compilerOptions: {
        composite: true,
        module: 'esnext',
        moduleResolution: 'node',
      },
      include: ['vite.config.ts', 'packages/**/vite.config.ts'],
    },
  ],
  ['.gitignore', 'node_modules'],
  [
    'env.d.ts',
    [
      '/// <reference types="vite/client" />',
      "\r\ndeclare module '*.vue' {",
      "  import type { DefineComponent } from 'vue'",
      '  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types',
      '  const component: DefineComponent<{}, {}, any>',
      '  export default component\r\n}',
    ].join('\r\n'),
  ],
  [
    'package.json',
    {
      name: '',
      description: '',
      private: true,
      workspaces: ['packages/*'],
      author: 'Tenny <tenny.shu@foxmail.com>',
      scripts: {
        dev: 'node vite.js',
        lint: 'vue-tsc --noEmit',
        build: 'node vite.js build',
        preview: 'node vite.js preview',
      },
      repository: {
        type: 'git',
        url: `git+https://gitee.com/towardly/.git`,
      },
    },
  ],
  [
    'fr:vite.js',
    [
      "const vite = require('vite');",
      "const defaultName = '_{name}';",
      "const actions = new Set(['build', 'preview']);\r\n",
      '(async () => {',
      '  let name = defaultName;',
      '  let lastArgv = process.argv[process.argv.length - 1];',
      "  if (lastArgv.startsWith('--')) {",
      '    name = lastArgv.substring(2);\r\n  }',
      '  const configFile = `./packages/${name}/vite.config.ts`;',
      '  let action = process.argv[process.argv.length - 2];\r\n',
      '  if (actions.has(action)) {',
      '    console.log(`${action} workspace: ${name}`);',
      '    await vite[action]({ configFile });',
      '  } else {',
      '    console.log(`dev workspace: ${name}`);',
      '    const server = await vite.createServer({ configFile });',
      '    await server.listen();',
      '    server.printUrls();\r\n  }\r\n})();',
    ].join('\r\n'),
  ],
])

// 工作区模板
const wsTemplates = new Map([
  [
    'fr:vite.config.ts',
    [
      "import { defineConfig } from 'vite';",
      '',
      '\r\n',
      '// https://vitejs.dev/config/',
      'export default defineConfig({',
      '  plugins: [],',
      "  root: 'packages/_{name}'});",
    ].join(''),
  ],
  [
    'index.html',
    [
      '<!DOCTYPE html>',
      '<html lang="zh-CN">',
      '  <head>',
      '    <meta charset="UTF-8" />',
      '    <link rel="icon" href="/favicon.ico" />',
      '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
      '    <title>Vite App</title>',
      '  </head>\r\n  <body>',
      '    <div id="app"></div>',
      '    <script type="module" src="/src/main.ts"></script>',
      '  </body>\r\n</html>',
    ].join('\r\n'),
  ],
])

const vueMain = [
  "import { createApp } from 'vue'",
  "import App from './App.vue'",
  "\r\ncreateApp(App).mount('#app')",
].join('\r\n')
const vueApp = [
  '<script setup lang="ts"></script>',
  '\r\n<template>Hello World!!!</template>',
  '\r\n<style></style>',
].join('\r\n')
/**
 * 检查依赖的库的版本信息
 * @param name
 * @returns
 */
function checkDev(name: string): Promise<[string, string]> {
  return new Promise((resolve, reject) => {
    https
      .get(`https://registry.npmmirror.com/${name}/latest`, (res) => {
        let resData = ''
        const statusCode = res.statusCode as number
        res.setEncoding('utf8')
        res.on('data', (chunk) => {
          resData += chunk
        })
        res.on('end', () => {
          if (statusCode >= 200 && statusCode < 300) {
            const pkgInfo = JSON.parse(resData)
            resolve([pkgInfo.name, pkgInfo.version])
          } else {
            reject(new Error(statusCode + ' & ' + (res as any).statusText))
          }
        })
      })
      .on('error', (e) => {
        reject(e)
      })
  })
}

interface InitOption {
  vue: boolean
}

function createFiles(template: any, queues: any[], name: string) {
  for (const [k, v] of template.entries()) {
    if (k.startsWith('fr:')) {
      const nv = v.replace('_{name}', name)
      queues.push(fileUtils.write(path.join(targetPath, k.substring(3)), nv))
    } else {
      queues.push(fileUtils.write(path.join(targetPath, k), v))
    }
  }
}

async function createPackage(name: string, vue: boolean) {
  const d = new Set<string>()
  const dd = new Set(['typescript', 'vite'])
  if (vue) {
    d.add('vue')
    dd.add('@vitejs/plugin-vue')
    dd.add('vue-tsc')
  }
  const queues = []
  for (const n of d.values()) {
    queues.push(checkDev(n))
  }
  for (const n of dd.values()) {
    queues.push(checkDev(n))
  }
  const pkgs = await Promise.all(queues)
  const dj: { [index: string]: string } = {}
  const ddj: { [index: string]: string } = {}
  for (const pkg of pkgs) {
    if (d.has(pkg[0])) {
      dj[pkg[0]] = `^${pkg[1]}`
    } else {
      ddj[pkg[0]] = `^${pkg[1]}`
    }
  }
  const pkg = templates.get('package.json')
  pkg.name = name
  pkg.repository.url = `git+https://gitee.com/towardly/${name}.git`
  pkg.dependencies = dj
  pkg.devDependencies = ddj
}

program
  .command('init <name>')
  .description('初始化 monorepo 工程')
  .option('--vue', '是否是 vue 项目', true)
  .option('--no-vue')
  .action(async (name: string, options: InitOption) => {
    const basename = path.basename(targetPath)
    await createPackage(basename, options.vue)
    let queues: any[] = []
    createFiles(templates, queues, name)
    const wsPath = path.join(targetPath, 'packages', name)
    const srcPath = path.join(wsPath, 'src')
    queues.push(fs.mkdir(srcPath, { recursive: true }))
    await Promise.all(queues)
    queues = []
    createFiles(wsTemplates, queues, name)
    if (options.vue) {
      queues.push(fileUtils.write(path.join(srcPath, 'main.ts'), vueMain))
      queues.push(fileUtils.write(path.join(srcPath, 'App.vue'), vueApp))
    } else {
      queues.push(fileUtils.write(path.join(srcPath, 'main.ts'), 'console.log("Hello World!!!")'))
    }
  })

program.parse(process.argv)
