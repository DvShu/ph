const { exec } = require('child_process');
const args = process.argv.slice(2);

let func = args[0]; // d - 开发模式, p - 生产模式
let mname = ''; // 运行的模块名称
let filename = ''; // 运行的文件名称
let useArg = 0;

// 运行的函数
if (func != null) {
  func = func.toLowerCase();
  if (func === '-d' || func === '-p') {
    func = func.slice(1);
  } else {
    mname = func;
  }
}
if (func == null) {
  func = 'd';
}

// 运行的模块名称
if (args.length >= 2) {
  if (mname === '') {
    mname = args[1];
  } else {
    filename = args[1];
  }
  useArg++;
}

// 运行的文件名称
if (args.length >= 3 && filename === '' && args[2][0] !== '-') {
  filename = args[2];
  useArg++;
}
if (filename === '') {
  filename = 'index.ts';
}
if (mname == null || mname === '') {
  console.error('请输入运行的模块');
} else {
  const tsconfigPath = `packages/${mname}/tsconfig.json`;
  const extraArgs = `${args.slice(useArg + 1).join(' ')}`;
  let execCmd = `tsx --tsconfig ${tsconfigPath} packages/cli/${filename} ${extraArgs}`;
  if (func === 'p') {
    execCmd = `tsc -p ${tsconfigPath}`;
  }
  if (func === 'p') {
    console.log('正在编译源文件……');
  }
  // 执行命令
  exec(execCmd, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
    } else if (stderr) {
      console.error(stderr);
    } else {
      if (stdout != null && stdout !== '') {
        console.log(stdout);
      }
      if (func === 'p') {
        console.log('源文件编译成功');
      }
    }
  });
}
