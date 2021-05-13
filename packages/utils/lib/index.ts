/**
 * web 和 node 端通用的工具
 */

/**
 * 验证字符串是否为空
 * @param str {string|null}              待验证的字符串
 * @param ignoreWhitespace {boolean}    是否忽略空格(包括空白字符串以及[\r\t\n]之类的制表符)，默认为true
 */
export function isBlank(str: string | null, ignoreWhitespace = true) {
  if (str == null) {
    return true
  }
  return (ignoreWhitespace ? str.trim().length : str.length) === 0
}
