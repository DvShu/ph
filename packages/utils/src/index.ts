/**
 * node 和 web 通用的工具类
 */

/**
 * 验证字符串是否为空
 * @param str               待验证的字符串
 * @param ignoreWhitespace  是否忽略空格(包括空白字符串以及[\r\t\n]之类的制表符)，默认为true
 */
export function isBlank(str?: string, ignoreWhitespace = true) {
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
