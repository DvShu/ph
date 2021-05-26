const fs = require('fs')
const fsp = fs.promises
const path = require('path')

const argvs = process.argv

const name = argvs[2] // 项目名称

function write(filename, data) {
  const stream = fs.createWriteStream(filename)
  stream.setDefaultEncoding('utf-8')
  stream.write(data)
  stream.close
}

const package = {
  name: `ph-${name}`,
  description: '',
  main: 'index.js',
  types: 'index.d.ts',
  version: '0.0.1',
  repository: {
    type: 'git',
    url: 'git+https//gitee.com/towardly/ph.git',
    directory: `packages/${name}`,
  },
  license: 'MIT',
  author: 'DvShu <1456207945@qq.com>',
  bugs: {
    url: 'https://gitee.com/towardly/ph/issues',
  },
  homepage: `https://gitee.com/towardly/ph/tree/master/packages/ph-${name}`,
  dependencies: {},
  devDependencies: {
    '@types/node': '^15.6.0',
    typescript: '^4.2.4',
  },
  scripts: {
    build: 'tsc',
    test: 'node test.js',
  },
  files: ['index.js', 'index.d.ts'],
  keywords: ['nodejs', 'ph'],
}

const tsConfig = {
  extends: '../../tsconfig.base.json',
  compilerOptions: {
    module: 'CommonJS',
    outDir: './',
  },
  files: ['index.ts'],
}

if (argvs[3] != null && argvs[3] == 'web') {
  delete package['devDependencies']['@types/node']
  tsConfig = {
    extends: '../../tsconfig.base.json',
    compilerOptions: {
      module: 'es6',
      resolveJsonModule: false,
      outDir: './',
    },
    files: ['index.ts'],
  }
}

// 新建项目文件夹
const target = path.join('packages', name)
fsp
  .mkdir(target)
  .then(() => {
    // 复制 LICENSE
    fsp.copyFile('LICENSE', path.join(target, 'LICENSE'))
    // 新建 index.ts
    write(path.join(target, 'index.ts'), "console.log('Hello World!!!')")
    // package.json
    write(path.join(target, 'package.json'), JSON.stringify(package, null, 2))
    // tsconfig.json
    write(path.join(target, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2))
    // README
    write(path.join(target, 'README.md'), `# ${name}\r\n---`)
  })
  .catch((err) => {
    console.error('工作区已经存在！')
  })
