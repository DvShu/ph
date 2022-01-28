const ts = require('typescript')
const path = require('path')
const fs = require('fs')

// 构建支持 web 端的源文件
function createMFile(name) {
  return fs.promises.readFile(`./src/${name}.ts`, 'utf-8').then((content) => {
    if (name === 'validator') {
      content = content.replace('export =', 'export default')
    }
    return fs.promises.writeFile(`./src/${name}_m.ts`, content)
  })
}

// 打开编译后的文件目录，如果不存在则创建
function openDir() {
  return new Promise((resolve) => {
    fs.opendir('./lib', (err) => {
      if (err == null) {
        resolve(0)
      } else {
        // 目录不存在
        fs.mkdir('./lib', () => {
          resolve(0)
        })
      }
    })
  })
}

// 任务完成
function done() {
  return new Promise((resolve) => {
    process.nextTick(() => {
      setTimeout(() => {
        resolve(0)
      }, 0)
    })
  })
}

function compile(fileNames, options) {
  const host = ts.createCompilerHost(options)
  host.writeFile = (fileName, contents) => {
    let stream = fs.createWriteStream(fileName)
    stream.write(contents)
    stream.close()
  }
  const program = ts.createProgram(fileNames, options, host)
  program.emit()
}

const nodeOption = {
  declaration: true,
  module: ts.ModuleKind.CommonJS,
  outDir: './lib',
  target: ts.ModuleKind.ESNext,
}

const webOption = {
  module: ts.ModuleKind.ES2015,
  outDir: './lib',
  target: ts.ModuleKind.ES2015,
  declaration: true,
}

console.log('正在开始构建文件……')

// 进行过修改的文件，只编译修改过的文件
const updatedFiles = ['dom'] // ['date', 'dom', 'file', 'index', 'server', 'web', 'validator']
const nodes = []
const web = []
const createMFiles = []
updatedFiles.forEach((f) => {
  if (f === 'server' || f === 'file') {
    // 编译 node 端
    nodes.push(`./src/${f}.ts`)
  } else if (f === 'index' || f === 'date' || f === 'validator') {
    // 编译 cjs 和 mjs
    web.push(`./src/${f}_m.ts`)
    nodes.push(`./src/${f}.ts`)
    createMFiles.push(f)
  } else if (f === 'dom' || f === 'web') {
    // 编译 web 端
    web.push(`./src/${f}.ts`)
  }
})

let queues = []
openDir()
  .then(() => {
    // 创建带 _m 的文件，用于构建 web 端
    for (let f of createMFiles) {
      queues.push(createMFile(f))
    }
    return Promise.all(queues)
  })
  .then(() => {
    if (web.length) {
      compile(web, webOption)
    }
    if (nodes.length > 0) {
      compile(nodes, nodeOption)
    }
    return done()
  })
  .then(() => {
    queues = []
    for (let f of createMFiles) {
      queues.push(fs.promises.unlink(`./src/${f}_m.ts`))
    }
    return Promise.all(queues)
  })
  .then(() => {
    console.log('文件构建完!')
  })
