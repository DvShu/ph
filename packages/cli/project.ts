/** node 语言工程相关工具 */
import type { Spinner } from 'nanospinner';
import { homedir } from 'node:os';
import { exec, get, isBlank } from './util.js';
import { access, read, readJSON, write } from './file.js';
import path from 'node:path';
import Enquirer from 'enquirer';
import { EDITOR_CONFIG, ESLINT, GIT_IGNORES, PRETTIER, SETTINGS } from './template.js';
import fs from 'node:fs/promises';
const prompt = Enquirer.prompt;

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
  try {
    // 安装依赖
    await access(path.join(process.cwd(), 'node_modules'));
  } catch (error) {
    // 之前未执行过 pnpm install, 则先执行 pnpm install
    console.log(await exec('pnpm install'));
  }
  console.log(await exec(`pnpm add ${deps.join(' ')}`)); // 安装依赖

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

  await Promise.all([
    write(path.join(process.cwd(), '.editorconfig'), EDITOR_CONFIG),
    write(path.join(process.cwd(), '.prettierignore'), 'README.md'),
    write(path.join(process.cwd(), '.eslintignore'), 'README.md'),
    write(path.join(process.cwd(), '.prettierrc'), PRETTIER),
    write(settingPath, setting),
    write(path.join(process.cwd(), '.eslintrc.json'), eslintRc),
    write(path.join(process.cwd(), 'package.json'), opkg),
  ]);
  spinner.success({ text: 'lint 初始化成功' });
}
