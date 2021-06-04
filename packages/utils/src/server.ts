import { exec, ExecException, ExecOptions } from 'child_process'

/**
 * node 端工具
 */
import crypto = require('crypto')

/**
 * 生成随机数：
 *  1. 生成指定长度的随机字符串(包含字母), 传递的第二个参数为 boolean 类型；如果想实现纯数字的，可以考虑通过 min - max 的形式，例如：
 *
 *    a. 生成 4 位长度纯数字(首位不包含0)：random(1000, 10000)
 *
 *    b. 生成 4 位长度(首位可以包含0)：random(0, 10) + random(1000, 10000)
 *
 *    c. 生成 4 位长度(首位可以包含0，使用 Math.random()实现)，具体实现可以参考该工具类的 web 端的 random 代码
 *
 *  2. 生成 [min, max) 之间的随机数字(**整形**)，传递的第二个参数为 number 类型，如果想要生成包含 max 的传递参数的时候，手动将 max + 1 即可
 * @param minOrLen 如果第二个参数为 number 类型，则表示 min，生成 [min,max) 之间的随机数，返回值类型为 int;
 *    如果第二个参数为 boolean 类型，则表示 len，生成的随机数的长度
 * @param maxOrUpper 如果类型为 number 类型则表示 max，生成 [min,max) 之间的随机数，返回值类型为 int;
 *    如果类型为 boolean 类型则表示 upper，生成指定长度(len)的随机字符串(包含字母)，true - 返回大写, 默认为 false
 */
function random(minOrLen: number, maxOrUpper: number | boolean): number | string
function random(): string | number {
  let lenOrMin = arguments[0]
  let max = arguments[1]
  if (typeof max === 'number') {
    return crypto.randomInt(lenOrMin, max)
  }
  let hash = crypto.randomBytes(lenOrMin).toString('hex')
  hash = hash.substr(0, lenOrMin)
  return max === true ? hash.toLocaleUpperCase() : hash
}

interface ExecPromiseOptions {
  /** 执行失败后的错误信息添加 name 属性标记 */
  errorName?: string
}

export = {
  /**
   * 进行 MD5 加密
   * @param {String} data 待加密的数据
   */
  md5(data: string): string {
    return crypto.createHash('md5').update(String(data)).digest('hex')
  },

  /**
   * 生成随机数：
   *  1. 生成指定长度的随机字符串(包含字母), 传递的第二个参数为 boolean 类型；如果想实现纯数字的，可以考虑通过 min - max 的形式，例如：
   *
   *    a. 生成 4 位长度纯数字(首位不包含0)：random(1000, 10000)
   *
   *    b. 生成 4 位长度(首位可以包含0)：random(0, 10) + random(1000, 10000)
   *
   *    c. 生成 4 位长度(首位可以包含0，使用 Math.random()实现)，具体实现可以参考该工具类的 web 端的 random 代码
   *
   *  2. 生成 [min, max) 之间的随机数字(**整形**)，传递的第二个参数为 number 类型，如果想要生成包含 max 的传递参数的时候，手动将 max + 1 即可
   * @param minOrLen 如果第二个参数为 number 类型，则表示 min，生成 [min,max) 之间的随机数，返回值类型为 int;
   *    如果第二个参数为 boolean 类型，则表示 len，生成的随机数的长度
   * @param maxOrUpper 如果类型为 number 类型则表示 max，生成 [min,max) 之间的随机数，返回值类型为 int;
   *    如果类型为 boolean 类型则表示 upper，生成指定长度(len)的随机字符串(包含字母)，true - 返回大写, 默认为 false
   */
  random(minOrLen: number, maxOrUpper: number | boolean): string | number {
    let lenOrMin = minOrLen
    let max = maxOrUpper
    if (typeof max === 'number') {
      return crypto.randomInt(lenOrMin, max)
    }
    let hash = crypto.randomBytes(lenOrMin).toString('hex')
    hash = hash.substr(0, lenOrMin)
    return max === true ? hash.toLocaleUpperCase() : hash
  },

  /**
   * exec Promise 版本
   * @param cmd 命令名称
   * @param options 命令参数，基于 exec-options 基础上，增加 errorName 字段
   */
  // eslint-disable-next-line
  execPromise(cmd: string, options?: ExecPromiseOptions & { encoding?: BufferEncoding } & ExecOptions) {
    return new Promise((resolve, rejects) => {
      options = { ...(options || {}) } as any
      const errorName = options.errorName || 'ExecError'
      delete options.errorName
      exec(cmd, options, (error: ExecException, stdout: string, stderr: string) => {
        let err = null
        let rs = null
        if (error) {
          err = error
          err.name = errorName
        } else {
          if (stdout != null) {
            if (stdout.includes('error') || stdout.includes('Error')) {
              err = new Error(stdout)
              err.name = errorName
            } else {
              rs = stdout
            }
          } else {
            err = new Error(stderr)
            err.name = errorName
          }
        }
        if (err != null) {
          rejects(err)
        } else {
          resolve(rs)
        }
      })
    })
  },
}
