import { exec as execCmd, spawn } from 'child_process';
import { isBlank } from './index';

/**
 * 执行命令
 * @param cmd 执行的命令
 * @returns
 */
export function exec(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execCmd(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        if (!isBlank(stderr) && stderr.indexOf('error') !== -1) {
          reject(new Error(stderr));
        } else {
          resolve((isBlank(stdout) ? stderr : stdout).trim() as string);
        }
      }
    });
  });
}

interface SpawnCmdOptions {
  /** 命令运行目录 */
  cwd?: string;
  /** 每一行的输出 */
  data?: (lineText?: string) => void;
  /** 错误输出 */
  error?: (err: Error) => void;
  /** 最终结果 */
  finally?: (err?: Error) => void;
}

/**
 * 执行 spawn 命令
 * @param command 执行的命令: 例如: git
 * @param args    命令参数: ['clone', 'https://xxxx.git']
 * @param options 参数
 */
export function spawnCmd(command: string, args?: string[], options?: SpawnCmdOptions) {
  const spawnClient = spawn(command, args, { cwd: options?.cwd });
  let err: Error | undefined;
  spawnClient.stdout.on('data', (chunk) => {
    if (options?.data != null && typeof options.data === 'function') {
      options.data(chunk);
    }
  });
  spawnClient.stderr.on('error', (error) => {
    err = error;
    if (options?.error && typeof options.error === 'function') {
      options.error(error);
    }
  });
  spawnClient.on('error', (error) => {
    err = error;
    if (options?.error && typeof options.error === 'function') {
      options.error(error);
    }
  });
  spawnClient.on('close', () => {
    if (options?.finally && typeof options.finally === 'function') {
      options.finally(err);
    }
  });
}

/**
 * 执行 spawn 命令
 * @param command 执行的命令: 例如: git
 * @param args    命令参数: ['clone', 'https://xxxx.git']
 * @param options 参数
 * @returns
 */
export function spawnPromise(command: string, args?: string[], options?: SpawnCmdOptions) {
  return new Promise((resolve, reject) => {
    options = options || {};
    options.finally = (err) => {
      if (err == null) {
        resolve(1);
      } else {
        reject(err);
      }
    };
    spawnCmd(command, args, options);
  });
}
