const ts = require('typescript')
const path = require('path')
const fs = require('fs')

// 编译 web 端
function compileWeb(fileNames, options) {
  const program = ts.createProgram(fileNames, options)
  program.emit()
}

// 编译 node 端
function compileNode(fileNames, options) {
  const host = ts.createCompilerHost(options)
  host.writeFile = (fileName, contents) => {
    let stream = fs.createWriteStream(fileName)
    stream.write(contents)
    stream.close()
  }
  const program = ts.createProgram(fileNames, options, host)
  program.emit()
}

// 编译 module 模块形式代码
function compileMjs(fileNames, options) {
  const host = ts.createCompilerHost(options)
  host.writeFile = (fileName, contents) => {
    const parsedPath = path.parse(fileName)
    const toMatch = parsedPath.base.match(/(.+)(\.d\.ts|\.js)/)
    let stream = fs.createWriteStream(path.join('./lib', `${toMatch[1]}_m${toMatch[2]}`))
    stream.write(contents)
    stream.close()
  }
  const program = ts.createProgram(fileNames, options, host)
  program.emit()
}

// 编译 commonjs 模块形式代码
function compileCjs(sourceFiles, options) {
  const host = ts.createCompilerHost(options)
  host.writeFile = (fileName, contents) => {
    //
    const stream = fs.createWriteStream(path.join('./lib', path.parse(fileName).base))
    stream.write(contents)
    stream.close()
  }
  host.getSourceFile = (fileName, languageVersion) => {
    let sourceText = ts.sys.readFile(fileName)
    if (sourceText !== undefined) {
      if (!fileName.endsWith('.d.ts')) {
        let fnames = []
        sourceText = sourceText.replace(/export function (\S+)+\(/g, function (p) {
          const m = p.match(/export function (\S+)+\(/)
          fnames.push(m[1])
          return `function ${m[1]}(`
        })
        sourceText += `\r\nexport = { ${fnames.join(', ')} }`
      }
      return ts.createSourceFile(fileName, sourceText, languageVersion)
    }
    return undefined
  }
  // const host = createCompilerHost(options)
  const program = ts.createProgram(sourceFiles, options, host)
  program.emit()
}

const nodeOption = {
  declaration: true,
  module: ts.ModuleKind.CommonJS,
  outDir: './lib',
  target: ts.ModuleKind.ESNext,
}

const cjsOption = {
  module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.ESNext,
  declaration: true,
}

const webOption = {
  lib: ['ESNext', 'DOM'],
  module: ts.ModuleKind.ES2015,
  resolveJsonModule: false,
  outDir: './lib',
  target: ts.ModuleKind.ES2015,
  declaration: true,
}

const mjsOption = {
  module: ts.ModuleKind.ES2015,
  target: ts.ScriptTarget.ES2015,
  declaration: true,
}

// 进行过修改的文件，只编译修改过的文件
const updatedFiles = ['date', 'dom', 'file', 'index', 'server', 'web']

const nodes = []
const cjs = []
const web = []
const mjs = []

updatedFiles.forEach((f) => {
  let name = `./src/${f}.ts`
  if (f === 'server' || f === 'file') {
    // 编译 node 端
    nodes.push(name)
  } else if (f === 'index' || f === 'date') {
    // 编译 cjs 和 mjs
    cjs.push(name)
    mjs.push(name)
  } else if (f === 'dom' || f === 'web') {
    // 编译 web 端
    web.push(name)
  }
})

if (nodes.length > 0) compileNode(nodes, nodeOption)
if (cjs.length > 0) compileCjs(cjs, cjsOption)
if (web.length > 0) compileWeb(web, webOption)
if (mjs.length > 0) compileMjs(mjs, mjsOption)
