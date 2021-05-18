/**
 * node 和 web 通用的工具类
 */

/**
 * 验证字符串是否为空
 * @param str               待验证的字符串
 * @param ignoreWhitespace  是否忽略空格(包括空白字符串以及[\r\t\n]之类的制表符)，默认为true
 */
export function isBlank(str: string | null, ignoreWhitespace = true) {
  if (str == null) {
    return true
  }
  return (ignoreWhitespace ? str.trim().length : str.length) === 0
}

/**
 * 屏蔽手机号，中间部分用 * 展示
 * @param mobile 待屏蔽的手机号
 * @returns 屏蔽后的手机号，例如：123 **** 1234
 */
export function shieldMobile(mobile: string) {
  let x1 = Math.round(mobile.length / 2)
  let x2 = Math.round(x1 / 2)
  let shields = [' ']
  for (let i = 0; i < x1; i++) {
    shields.push('*')
  }
  shields.push(' ')
  return mobile.substring(0, x2) + shields.join('') + mobile.substring(x2 + x1)
}

/**
 * 验证参数是否是数字
 * @param str 待验证的字符串
 * @returns true 是数字, false 不是数字
 */
export function isNumeric(str: string): boolean {
  return /^[+-]?([0-9]*[.])?[0-9]+$/.test(str)
}

/**
 * 验证参数是否是Boolean 类型
 * @param str 待验证的字符串
 * @returns
 */
export function isBoolean(str: string): boolean {
  return ['true', 'false'].indexOf(str) >= 0
}

/**
 * 将金额数字格式化为金额格式显示并且会保留两位小数[去除多余的位数，不是四舍五入，而是直接舍去]  1234523432.23 => 123,123,123.23
 * @param {number} number 待转换的金额数字
 * @return string
 */
export function formatMoney(number: number) {
  number = number || 0
  let negative = ''
  let base = String(parseInt(number as any, 10)) // 获取数字整数部分
  let mod = base.length > 3 ? base.length % 3 : 0
  /*
   * 利用 正则前瞻 (?=) 将3位数字后面还紧跟一位数字的三位数字替换为 数字, 的形式
   */
  let numberStr = String(number)
  let usePrecision = numberStr.indexOf('.')
  let dotStr = usePrecision > 0 ? numberStr.slice(usePrecision + 1) : '00'
  dotStr = dotStr.length > 2 ? dotStr.slice(0, 2) : dotStr
  return (
    negative + (mod ? base.slice(0, mod) + ',' : '') + base.slice(mod).replace(/(\d{3})(?=\d)/g, '$1,') + '.' + dotStr
  )
}
