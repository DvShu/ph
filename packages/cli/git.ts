import type { Spinner } from 'nanospinner';
import { homedir } from 'node:os';
import { exec, isBlank } from './util.js';
import { read, write } from './file.js';
import path from 'node:path';
import Enquirer from 'enquirer';
const prompt = Enquirer.prompt;

// 忽略的文件列表
const gitIgnores = [
  '*.log',
  'node_modules',
  'dist',
  '.idea',
  '.vscode/*',
  '!.vscode/settings.json',
  '!.vscode/extensions.json',
];

/**
 * 初始化 Git 工程
 * @param spinner
 */
export async function gitInit(spinner: Spinner) {
  const userCfgPath = `${homedir}/.giturc`;
  const gitUser = await Promise.all([
    exec<string>(`git config user.name`),
    exec<string>(`git config user.email`),
    read(userCfgPath),
  ]);
  const gitUsers = [];
  if (!isBlank(gitUser[2])) {
    const userStrs = gitUser[2];
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
    exec<string>(`git config user.name "${response.user}"`),
    exec<string>(`git config user.email "${response.email}"`),
    write(path.join(process.cwd(), '.gitignore'), gitIgnores.join('\r\n')),
  ];
  if (!isBlank(response.remote)) {
    queues.push(exec<string>(`git remote add origin ${response.remote}`));
  }
  Promise.all(queues).then();
  spinner.success({ text: 'git 初始化完成' });
}
