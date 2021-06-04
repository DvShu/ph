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

/**
 * 带有错误名称标记的错误类型
 */
export class BaseError extends Error {
  /**
   * 错误名称，类似于 Java 中的不同的 Exception[NullPointerException]；
   * 增加 name 字段，表明不同的错误，当需要根据不同的错误执行不同的处理的时候，会很有用
   */
  public name: string
  /**
   * 构造一个 name = BaseError 的错误信息
   * @param message 错误描述
   */
  public constructor(message: string)
  /**
   *
   * @param name 错误名称
   * @param message 错误描述
   */
  public constructor(name: String, message: string)
  public constructor() {
    if (arguments.length === 1) {
      super(arguments[0])
      this.name = 'BaseError'
    } else {
      super(arguments[1])
      this.name = arguments[0]
    }
  }
}
