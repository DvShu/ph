import { exec as execCmd } from 'node:child_process';

/**
 * 执行命令
 * @param cmd 执行的命令
 * @returns
 */
export function exec<T>(cmd: string): Promise<T> {
  return new Promise((resolve, reject) => {
    execCmd(cmd, { cwd: 'D:/workspace/a' }, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        if (!isBlank(stderr) && stderr.indexOf('error') !== -1) {
          reject(new Error(stderr));
        } else {
          resolve((isBlank(stdout) ? stderr : stdout).trim() as T);
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
