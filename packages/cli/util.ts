import { exec as execCmd, spawn } from 'node:child_process';
import https from 'https';

/**
 * 执行命令
 * @param cmd 执行的命令
 * @returns
 */
export function exec(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execCmd(cmd, { cwd: 'D:/workspace/a' }, (err, stdout, stderr) => {
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

/**
 * 验证字符串是否为空
 * @param str               待验证的字符串
 * @param ignoreWhitespace  是否忽略空格(包括空白字符串以及[\r\t\n]之类的制表符)，默认为true
 */
export function isBlank(str?: string | null, ignoreWhitespace = true) {
  if (str == null) {
    return true;
  }
  return (ignoreWhitespace ? str.trim().length : str.length) === 0;
}

/**
 * 执行 http get 请请求
 * @param url 请求地址
 * @returns
 */
export async function get<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode === 200) {
          let chunks: any = [];
          res.on('data', (chunk) => {
            chunks.push(chunk);
          });
          res.on('end', () => {
            chunks = Buffer.concat(chunks);
            resolve(JSON.parse(chunks.toString('utf-8')));
          });
        } else {
          reject(new Error(`${res.statusCode} - ${res.statusMessage}`));
        }
      })
      .on('error', (e) => {
        reject(e);
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
export function spawnPromise(command: string, args?: string[], options?: SpawnCmdOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: string[] = [];
    options = options || {};
    options.data = (chunk) => {
      chunks.push(chunk as string);
    };
    options.finally = (err) => {
      if (err == null) {
        resolve(chunks.join('\r\n'));
      } else {
        reject(err);
      }
    };
    spawnCmd(command, args, options);
  });
}

/**
 * 执行 git clone
 * @param url 克隆工程地址
 * @param target 克隆项目的保存地址
 * @returns
 */
export function gitClone(url: string, target?: string) {
  return new Promise((resolve, reject) => {
    const clone = spawn('git', ['clone', url], { cwd: target });
    clone.stderr.on('error', (err) => {
      reject(err);
    });
    clone.on('close', () => {
      resolve(1);
    });
  });
}
