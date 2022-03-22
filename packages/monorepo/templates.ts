// eslint + prettier
const eslintIgnore = [
  '.prettierignore',
  '.eslintignore',
  '.pnp.cjs',
  '.pnp.loader.mjs',
  '.yarnrc.yml',
  'yarn.lock',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'LICENSE',
  '.gitignore',
  'package-lock.json',
].join('\n')
export const lintTemplates = new Map<string, any>([
  [
    '.editorconfig',
    [
      'root = true\n',
      '[*]',
      'charset = utf-8',
      'indent_style = space',
      'indent_size = 2',
      'end_of_line = lf',
      'insert_final_newline = true',
      'trim_trailing_whitespace = true',
    ].join('\n'),
  ],
  ['.prettierignore', eslintIgnore],
  ['.eslintignore', eslintIgnore],
  [
    '.prettierrc.json',
    {
      semi: false,
      singleQuote: true,
    },
  ],
  [
    '.eslintrc.json',
    {
      root: true,
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 'latest',
      },
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
      ],
      env: {},
      rules: {
        'no-eq-null': 'off',
        eqeqeq: ['error', 'always', { null: 'ignore' }],
      },
    },
  ],
])

// 工程模板
export const proTemplates = new Map<string, any>([
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
      include: [
        'packages/**/*.ts',
        'packages/**/*.d.ts',
        'packages/**/*.tsx',
        'packages/**/*.vue',
        'env.d.ts',
      ],
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
      "\ndeclare module '*.vue' {",
      "  import type { DefineComponent } from 'vue'",
      '  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types',
      '  const component: DefineComponent<{}, {}, any>',
      '  export default component\n}',
    ].join('\n'),
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
      "const defaultName = '{{name}}';",
      "const actions = new Set(['build', 'preview']);\n",
      '(async () => {',
      '  let name = defaultName;',
      '  let lastArgv = process.argv[process.argv.length - 1];',
      "  if (lastArgv.startsWith('--')) {",
      '    name = lastArgv.substring(2);\n  }',
      '  const configFile = `./packages/${name}/vite.config.ts`;',
      '  let action = process.argv[process.argv.length - 2];\n',
      '  if (actions.has(action)) {',
      '    console.log(`${action} workspace: ${name}`);',
      '    await vite[action]({ configFile });',
      '  } else {',
      '    console.log(`dev workspace: ${name}`);',
      '    const server = await vite.createServer({ configFile });',
      '    await server.listen();',
      '    server.printUrls();\n  }\n})();',
    ].join('\n'),
  ],
])

export const wsTemplates = new Map([
  [
    'fr:vite.config.ts',
    [
      "import { defineConfig } from 'vite';",
      '{{viteConfigVueImport}}',
      '// https://vitejs.dev/config/',
      'export default defineConfig({',
      '  plugins: [{{viteConfigVueUse}}],',
      "  root: 'packages/{{name}}'\n});",
    ].join('\n'),
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
      `    <title>Vite App</title>`,
      '  </head>\n  <body>',
      '    <div id="app"></div>',
      '    <script type="module" src="/src/main.ts"></script>',
      '  </body>\n</html>',
    ].join('\n'),
  ],
])

export const vueMain = [
  "import { createApp } from 'vue'",
  "import App from './App.vue'",
  "\ncreateApp(App).mount('#app')",
].join('\n')

export const vueApp = [
  '<script setup lang="ts"></script>',
  '\n<template>Hello World!!!</template>',
  '\n<style></style>',
].join('\n')
