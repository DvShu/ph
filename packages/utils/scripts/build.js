const ts = require('typescript')
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

// 构建完成后，执行一些逻辑替换
function afterBuild() {
  return fs.promises.readFile(`./lib/web.js`, 'utf-8').then((content) => {
    content = content.replace("from './index'", "from './index_m'")
    return fs.promises.writeFile(`./lib/web.js`, content)
  })
}

// 任务完成
function done(extra) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      setTimeout(() => {
        resolve(extra)
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

// 检测源文件的更改
function checkFile() {
  return new Promise((resolve, reject) => {
    fs.readdir('./src', 'utf-8', (err, files) => {
      if (!err) {
        let len = files.length
        let stated = 0
        let fl = {}
        for (let fileName of files) {
          fs.stat(`./src/${fileName}`, (err, stat) => {
            stated++
            if (!err) {
              fl[fileName.substring(0, fileName.length - 3)] = parseInt(stat.mtimeMs, 10)
              if (len === stated) {
                resolve(fl)
              }
            }
          })
        }
      } else {
        reject(err)
      }
    })
  })
}

// 读取构建信息
function readBuildInfo() {
  return new Promise((resolve, reject) => {
    fs.readFile('./buildinfo.json', 'utf-8', (err, content) => {
      if (err) {
        // 文件不存在
        if (err.errno === -4058) {
          resolve({})
        } else {
          reject(err)
        }
      } else {
        resolve(JSON.parse(content))
      }
    })
  })
}

// 构建编译的文件类型，web node
function waitFiles(f, n, w, m) {
  if (f === 'server' || f === 'file') {
    // 编译 node 端
    n.push(`./src/${f}.ts`)
  } else if (f === 'index' || f === 'date' || f === 'validator') {
    // 编译 cjs 和 mjs
    w.push(`./src/${f}_m.ts`)
    n.push(`./src/${f}.ts`)
    m.push(f)
  } else if (f === 'dom' || f === 'web') {
    // 编译 web 端
    w.push(`./src/${f}.ts`)
  }
}

// 构建目标文件夹
function mkToDir() {
  return new Promise((resolve) => {
    fs.mkdir('./lib', () => {
      resolve(0)
    })
  })
}

console.log('项目编译……')
console.log('检测变动文件……')
Promise.all([readBuildInfo(), checkFile(), mkToDir()])
  .then((as) => {
    let nb = {}
    const nodes = []
    const web = []
    const createMFiles = []
    const n = []

    for (let fileName in as[1]) {
      nb[fileName] = as[1][fileName]
      if (as[0].hasOwnProperty(fileName)) {
        if (as[0][fileName !== as[1][fileName]]) {
          waitFiles(fileName, nodes, web, createMFiles)
          n.push(fileName)
        }
      } else {
        waitFiles(fileName, nodes, web, createMFiles)
        n.push(fileName)
      }
    }
    const queues = [Promise.resolve(nodes), Promise.resolve(web), Promise.resolve(createMFiles)]
    // 创建带 _m 的文件，用于构建 web 端
    for (let f of createMFiles) {
      queues.push(createMFile(f))
    }
    queues.push(fs.promises.writeFile('./buildinfo.json', JSON.stringify(nb, null, 2)))
    // 进行过修改的文件，只编译修改过的文件
    return Promise.all(queues)
  })
  .then((a) => {
    if (a[0].length > 0) {
      console.log(`构建 node 端文件：${a[0].toString()}`)
      compile(a[0], nodeOption)
    }
    if (a[1].length > 0) {
      console.log('构建 web 端文件：' + a[1].toString())
      compile(a[1], webOption)
    }
    return done([a[2], a[1]])
  })
  .then((mf) => {
    queues = []
    for (let f of mf[0]) {
      queues.push(fs.promises.unlink(`./src/${f}_m.ts`))
    }
    if (mf[1].includes('./src/web.ts')) {
      queues.push(afterBuild())
    }
    return Promise.all(queues)
  })
  .then(() => {
    console.log('文件构建完成!')
  })
