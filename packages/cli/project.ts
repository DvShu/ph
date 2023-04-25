/** node 语言工程相关工具 */
import type { Spinner } from 'nanospinner';
import { homedir } from 'node:os';
import { exec, get, gitClone, isBlank, spawnCmd } from './util.js';
import { read, readJSON, rm, traverseDir, write } from './file.js';
import path from 'node:path';
import Enquirer from 'enquirer';
import { EDITOR_CONFIG, ESLINT, GIT_IGNORES, PRETTIER, SETTINGS } from './template.js';
import fsc from 'node:fs';
import laytpl from 'laytpl';
const fs = fsc.promises;
const prompt = Enquirer.prompt;

const TEMPLATE_URLS = {
  sanic: 'https://gitee.com/towardly/python-sanic-template.git',
};

/**
 * 初始化 Git 工程
 * @param spinner
 */
export async function gitInit(spinner: Spinner) {
  const userCfgPath = `${homedir}/.giturc`;
  const gitUser = await Promise.all([exec(`git config user.name`), exec(`git config user.email`), read(userCfgPath)]);
  const gitUsers = [];
  if (!isBlank(gitUser[2])) {
    const userStrs = gitUser[2] || '';
    const userLines = userStrs.split(/\r\n|\r|\n/);
    for (let i = 0, len = userLines.length; i < len; i++) {
      const ul = userLines[i];
      if (!isBlank(ul)) {
        gitUsers.push(ul.split(' - '));
      }
    }
  }
  if (!isBlank(gitUser[0]) && !isBlank(gitUser[1])) {
    if (gitUsers.filter((item) => item[0] === gitUser[0]).length === 0) {
      gitUsers.push([gitUser[0].trim(), gitUser[1].trim()]);
    }
  }
  const selectUsers = gitUsers.map((item, index) => `${index + 1}. ${item[0]} - ${item[1]}`);
  selectUsers.push(`${gitUsers.length + 1}. 新增(add new)`);

  const response: any = await prompt([
    {
      type: 'autocomplete',
      name: 'gitUser',
      message: '请选择用户: ',
      choices: selectUsers,
      footer: () => '按上下键选择或者输入筛选',
    } as any,
    {
      type: 'input',
      name: 'user',
      message: `用户名: `,
      initial: gitUser[0],
      skip() {
        const gitUser: string = (this as any).enquirer.answers.gitUser;
        if (!isBlank(gitUser) && !gitUser.includes('新增')) {
          return true;
        }
        return false;
      },
    },
    {
      type: 'input',
      name: 'email',
      message: '邮箱: ',
      initial: gitUser[1],
      skip() {
        const gitUser: string = (this as any).enquirer.answers.gitUser;
        if (!isBlank(gitUser) && !gitUser.includes('新增')) {
          return true;
        }
        return false;
      },
    },
    {
      type: 'input',
      name: 'remote',
      message: '远程地址: ',
    },
  ]);
  if (response.gitUser.includes('新增')) {
    if (isBlank(response.user)) {
      response.user = gitUser[0].trim();
    }
    if (isBlank(response.email)) {
      response.email = gitUser[1].trim();
    }
    gitUsers.push([response.user, response.email]);
    const writeData = gitUsers.map((item) => `${item[0].trim()} - ${item[1].trim()}`).join('\r\n');
    write(userCfgPath, writeData).then();
  } else {
    const ustr = response.gitUser.slice(3).split(' - ');
    response.user = ustr[0].trim();
    response.email = ustr[1].trim();
  }
  spinner.start({ text: '正在初始化 git ' });
  const queues = [
    exec(`git config user.name "${response.user}"`),
    exec(`git config user.email "${response.email}"`),
    write(path.join(process.cwd(), '.gitignore'), GIT_IGNORES),
  ];
  if (!isBlank(response.remote)) {
    queues.push(exec(`git remote add origin ${response.remote}`));
  }
  Promise.all(queues).then();
  spinner.success({ text: 'git 初始化完成' });
}

/**
 * 搜索软件包信息
 * @param packageName 软件包名称
 * @returns
 */
async function searchPackage(packageName: string) {
  const pckInfo = await get<any>(`https://registry.npmmirror.com/${packageName}`);
  return { name: pckInfo.name, version: pckInfo['dist-tags'].latest };
}

/**
 * 查询软件包列表的信息
 * @param packages 软件包列表
 * @returns
 */
export async function searchPackages(packages: string[]) {
  const queues = [];
  for (let i = 0, len = packages.length; i < len; i++) {
    queues.push(searchPackage(packages[i]));
  }
  return Promise.all(queues);
}

/**
 * 初始化 lint 工具
 * @param spinner
 * @param opkg
 * @param frame 框架
 */
export async function lintInit(spinner: Spinner, opkg: any, frame?: string) {
  spinner.start({ text: '依赖检查……' });
  // 依赖项
  const deps = [
    'eslint',
    'eslint-config-alloy',
    'prettier',
    'typescript',
    '@typescript-eslint/parser',
    '@typescript-eslint/eslint-plugin',
  ];
  const eslintExtends = ['alloy'];
  const eslintRc: any = ESLINT;
  if (!isBlank(frame)) {
    if (frame === 'vue') {
      deps.push('@vue/eslint-config-typescript', 'eslint-plugin-vue', 'vue-eslint-parser');
      eslintExtends.push('alloy/vue');
      eslintRc['rules']['@typescript-eslint/prefer-optional-chain'] = 'off';
      eslintRc['parser'] = 'vue-eslint-parser';
      eslintRc['parserOptions'] = {
        parser: {
          js: '@typescript-eslint/parser',
          jsx: '@typescript-eslint/parser',
          ts: '@typescript-eslint/parser',
          tsx: '@typescript-eslint/parser',
        },
      };
    } else if (frame === 'react') {
      deps.push('eslint-plugin-react');
      eslintExtends.push('alloy/react');
    }
    eslintExtends.push('alloy/typescript');
  }
  eslintRc.extends = eslintExtends;
  const depVersions = await searchPackages(deps);
  const devDeps = opkg.devDependencies || {};
  for (let i = 0, len = depVersions.length; i < len; i++) {
    const depItem = depVersions[i];
    devDeps[depItem.name] = depItem.version;
  }
  spinner.success({ text: '依赖检查完成' });

  // 写入文件
  spinner.start({ text: '正在初始化 lint' });
  const settingPath = path.join(process.cwd(), '.vscode', 'settings.json');
  const setting = await readJSON<any>(settingPath);
  if (setting == null) {
    await fs.mkdir(settingPath);
  } else {
    Object.assign(setting, SETTINGS);
  }
  // packge.json
  const scripts = opkg.scripts || {};
  scripts['lint'] = 'eslint .';
  scripts['lint:fix'] = 'eslint . --fix';
  opkg.scripts = scripts;
  opkg.devDependencies = devDeps;

  await Promise.all([
    write(path.join(process.cwd(), '.editorconfig'), EDITOR_CONFIG),
    write(path.join(process.cwd(), '.prettierignore'), 'README.md'),
    write(path.join(process.cwd(), '.eslintignore'), 'README.md'),
    write(path.join(process.cwd(), '.prettierrc'), PRETTIER),
    write(settingPath, setting),
    write(path.join(process.cwd(), '.eslintrc.json'), eslintRc),
    write(path.join(process.cwd(), 'package.json'), opkg),
  ]);
  spinner.success({ text: 'lint 初始化成功; 请进行依赖安装: pnpm install' });
}

/** 搜索 Python 软件包信息 */
async function searchPyPackage(name: string) {
  // const pckInfo = await get<any>(`https://pypi.org/pypi/${name}/json`);
  const pckInfo = await get<any>(`https://pypi.tuna.tsinghua.edu.cn/pypi/${name}/json`);
  return { name: pckInfo.info.name, version: pckInfo['info'].version };
}

/** 搜索多个 Python 软件包信息 */
async function searchPyPackages(names: string[]) {
  const queues = [];
  for (let i = 0, len = names.length; i < len; i++) {
    queues.push(searchPyPackage(names[i]));
  }
  return Promise.all(queues);
}

/**
 * 初始化 Sanic 工程参数
 */
interface SanicInitParams {
  /** 工程名称 */
  name: string;
  /** 目录 */
  target: string;
}

/**
 * 渲染工程模板
 * @param dir     模板路径
 * @param pkgInfo 新建工程信息
 * @param target  目标地址
 * @returns
 */
function renderProject(dir: string, pkgInfo: any, target: string) {
  return new Promise((resolve, reject) => {
    let error: Error | null = null;
    traverseDir(
      dir,
      (filename) => {
        if (filename.includes('.git')) return;
        const relPath = path.relative(dir, filename);
        // 需要新建的目录
        const destDir = path.join(target, path.dirname(relPath));
        const fileInfo = path.parse(filename);
        fsc.mkdir(destDir, { recursive: true }, (err) => {
          if (err != null) {
            error = err;
          } else {
            if (fileInfo.ext === '.tpl') {
              // 渲染模板文件
              laytpl.renderFile(filename, pkgInfo, (err, tpl: string) => {
                tpl = tpl.trim();
                if (err != null) {
                  error = err;
                } else {
                  fsc.writeFile(path.join(destDir, fileInfo.name), tpl, (err) => {
                    if (err != null) {
                      error = err;
                    }
                  });
                  if (fileInfo.name === '.env.example') {
                    // 如果是环境变量文件, 则加一个 .env 文件
                    fsc.writeFile(path.join(destDir, '.env'), tpl, (err) => {
                      if (err != null) {
                        error = err;
                      }
                    });
                  }
                }
              });
            } else {
              // 复制文件
              fsc.copyFile(filename, path.join(destDir, fileInfo.base), () => {});
            }
          }
        });
      },
      () => {
        if (error == null) {
          resolve(1);
        } else {
          reject(error);
        }
      },
    );
  });
}

/**
 * 初始化 Python3 Sanic Web 工程
 * @param spinner 进度条
 * @param params  参数
 */
export async function sanicInit(spinner: Spinner, params: SanicInitParams) {
  spinner.start({ text: '依赖包版本检查……' });
  const pknames = ['sanic', 'tortoise-orm', 'asyncmy', 'httpx', 'limits'];
  const pkInfos = await searchPyPackages(pknames);
  spinner.success({ text: '依赖包版本检查成功' });
  spinner.start({ text: '下载工程模板……' });
  const infos = { name: params.name, dependencies: pkInfos };
  await gitClone(TEMPLATE_URLS['sanic'], params.target);
  const source = path.join(params.target, 'python-sanic-template');
  spinner.success({ text: '工程模板下载完成!' });
  spinner.start({ text: '开始初始化工程……' });
  await renderProject(source, infos, params.target);
  rm([source]).then();
  spinner.success({ text: '工程初始化完成!' });
  spinner.start({ text: '依赖安装……' });
  spawnCmd('pip', ['install', '-r', 'requirements.txt'], { cwd: params.target });
  spinner.success({ text: '依赖安装成功' });
  console.log('依次执行以下步骤: ');
  const steps = [];
  const realPath = path.relative(process.cwd(), params.target);
  if (!isBlank(realPath)) {
    steps.push(`进行目录: cd ${realPath}`);
  }
  steps.push('开发运行: python app.py');
  if (steps.length === 2) {
    console.log(`  1. ${steps[0]}\r\n`);
    console.log(`  2. ${steps[1]}\r\n`);
  } else {
    console.log(`${steps[0]}`);
  }
}
