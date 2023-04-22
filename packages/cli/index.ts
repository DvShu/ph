#!/usr/bin/env node
import { program } from 'commander';
import { createSpinner } from 'nanospinner';
import { rm } from './file.js';
import { createRequire } from 'node:module';
import { gitInit } from './git.js';

const require = createRequire(import.meta.url);

const pkg = require('./package.json');
// 名称-版本-描述
program.name('tcli').description(pkg.description).version(pkg.version, '-V, --version', '显示版本号');

// 删除目录工具类
program
  .command('rm')
  .argument('[dirs...]', '待删除的文件夹名称,默认为:node_modules')
  .description('强制删除文件夹,可以用空格或逗号分隔多个目录')
  .action(async (dirs: string[]) => {
    if (dirs == null || dirs.length === 0) {
      dirs = ['node_modules'];
    }
    const spinner = createSpinner().start({ text: `开始删除目录: ${dirs.join(',')}` });
    const startTime = Date.now();
    await rm(dirs);
    const endTime = Date.now();
    spinner.success({ text: `删除文件夹 ${dirs.join(',')} 成功，耗时：${endTime - startTime}ms` });
  });

// 执行 git init
program
  .command('git-init')
  .description('执行 git init 初始化仓库')
  .action(async () => {
    const spinner = createSpinner();
    await gitInit(spinner);
  });

program.parse(process.argv); // 解析命令行参数
