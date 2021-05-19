/**
 * node 端工具
 */
const crypto = require('crypto')

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

export = {
  /**
   * 进行 MD5 加密
   * @param {String} data 待加密的数据
   */
  md5(data: string): string {
    return crypto.createHash('md5').update(String(data)).digest('hex')
  },

  random,
}
