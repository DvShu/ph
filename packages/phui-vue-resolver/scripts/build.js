const ts = require('typescript');
const fs = require('fs');

function write(filename, content) {
  let stream = fs.createWriteStream(filename);
  stream.write(content);
  stream.close();
}

function compile() {
  const options = {
    module: ts.ModuleKind.ESNext,
    declaration: true,
    target: ts.ModuleKind.ESNext,
  };
  const host = ts.createCompilerHost(options);
  host.writeFile = (filename, content) => {
    if (filename.endsWith('.js')) {
      write(filename.replace('.js', '.mjs'), content);
      write(filename, content.replace('export default', 'module.exports ='))
    } else {
      write(filename, content);
    }
  };
  const program = ts.createProgram(['index.ts'], options, host);
  program.emit();
}

compile();