#!/usr/bin/env node
import { program } from 'commander';
import pkg from './package.json';

// 名称-版本-描述
program.name(pkg.name).description(pkg.description).version(pkg.version);

program.parse(); // 解析命令行参数
