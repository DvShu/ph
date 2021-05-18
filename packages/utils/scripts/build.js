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
    const name = parsedPath.ext === '.js' ? toMatch[1] : `${toMatch[1]}_m`
    const ext = parsedPath.ext === '.js' ? '.mjs' : `${toMatch[2]}`
    let stream = fs.createWriteStream(path.join('./lib', `${name}${ext}`))
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

compileNode(['./src/server.ts', './src/file.ts'], {
  declaration: true,
  module: ts.ModuleKind.CommonJS,
  outDir: './lib',
  target: ts.ModuleKind.ESNext,
})

compileCjs(['./src/index.ts', './src/date.ts'], {
  module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.ESNext,
  declaration: true,
})

compileWeb(['./src/dom.ts', './src/web.ts'], {
  lib: ['ESNext', 'DOM'],
  module: ts.ModuleKind.ES2015,
  resolveJsonModule: false,
  outDir: './lib',
  target: ts.ModuleKind.ES2015,
  declaration: true,
})

compileMjs(['./src/index.ts', './src/date.ts'], {
  module: ts.ModuleKind.ES2015,
  target: ts.ScriptTarget.ES2015,
  declaration: true,
})
