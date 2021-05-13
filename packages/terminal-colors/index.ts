const color16s = [
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
]
const styles: any = {
  bold: 1,
  italic: 3,
  underline: 4,
  inverse: 7,
  strikethrough: 9,
}

interface TermColorIntf {
  /** 文本黑色 */
  black: (text: string) => string
  /** 文本红色 */
  red: (text: string) => string
  /** 文本绿色 */
  green: (text: string) => string
  /** 文本黄色 */
  yellow: (text: string) => string
  /** 文本蓝色 */
  blue: (text: string) => string
  /** 文本品红(洋红) */
  magenta: (text: string) => string
  /** 文本青色(蓝绿色) */
  cyan: (text: string) => string
  grey: (text: string) => string
  gray: (text: string) => string
  greyBG: (text: string) => string
  grayBG: (text: string) => string
  brightGrey: (text: string) => string
  brightGray: (text: string) => string
  bgBrightGrey: (text: string) => string
  bgBrightGray: (text: string) => string

  /** 文本白色 */
  white: (text: string) => string
  brightRed: (text: string) => string
  brightGreen: (text: string) => string
  brightBlue: (text: string) => string
  brightYellow: (text: string) => string
  brightMagenta: (text: string) => string
  brightCyan: (text: string) => string
  brightWhite: (text: string) => string
  /** 文本亮黑 */
  brightBlack: (text: string) => string

  /** 背景色 */

  bgBlack: (text: string) => string
  bgRed: (text: string) => string
  bgGreen: (text: string) => string
  bgBlue: (text: string) => string
  bgYellow: (text: string) => string
  bgMagenta: (text: string) => string
  bgCyan: (text: string) => string
  bgWhite: (text: string) => string
  bgGrey: (text: string) => string
  bgGray: (text: string) => string

  bgBrightRed: (text: string) => string
  bgBrightGreen: (text: string) => string
  bgBrightBlue: (text: string) => string
  bgBrightYellow: (text: string) => string
  bgBrightMagenta: (text: string) => string
  bgBrightCyan: (text: string) => string
  bgBrightWhite: (text: string) => string
  /** 文本亮黑 */
  bgBrightBlack: (text: string) => string

  /** 加粗 */
  bold: (text: string) => string
  /** 倾斜 */
  italic: (text: string) => string
  /** 下划线 */
  underline: (text: string) => string
  /** 倒转文本 */
  inverse: (text: string) => string
  /** 删除线 */
  strikethrough: (text: string) => string
  /**
   * 给文本添加多种样式集
   * @param text ${string}    文本
   * @param styls ${string[]} 样式集, 值只能是基本样式[bold,italic,underline,inverse,strikethrough]以及颜色
   * @returns
   */
  style: (text: string, styls: string[]) => string
  /**
   * 文本颜色
   * @param text      加颜色的文本
   * @param color255  颜色序列, 0 ~ 255 之间的颜色值
   * @returns 加上颜色字符的字符串
   */
  (text: string, color255?: number): string
  [index: string]: (text: any, param1?: any) => string
}

/**
 * 文本颜色
 * @param text      加颜色的文本
 * @param color255  颜色序列, 0 ~ 255 之间的颜色值
 * @returns 加上颜色字符的字符串
 */
const termColor: TermColorIntf = function (text: string, color255 = 255) {
  return `\x1b[38;5;${color255}m${text}\x1b[0m`
} as TermColorIntf

/* eslint-disable */
for (let i in color16s) {
  termColor[color16s[i] as string] = function (text: string) {
    return `\x1b[3${i}m${text}\x1b[0m`
  }
  termColor[
    'bright' +
      ((color16s[i] as string).charAt(0).toUpperCase() +
        (color16s[i] as string).slice(1))
  ] = (text) => {
    return `\x1b[9${i}m${text}\x1b[0m`
  }
  termColor[
    'bg' +
      ((color16s[i] as string).charAt(0).toUpperCase() +
        (color16s[i] as string).slice(1))
  ] = function (text) {
    return `\x1b[4${i}m${text}\x1b[0m`
  }
  termColor[
    'bgBright' +
      ((color16s[i] as string).charAt(0).toUpperCase() +
        (color16s[i] as string).slice(1))
  ] = (text) => {
    return `\x1b[10${i}m${text}\x1b[0m`
  }
}
termColor.grey = termColor.gray = termColor.brightBlack
termColor.bgGrey = termColor.bgGray = termColor.bgBrightBlack
termColor.brightGrey = termColor.brightGray = termColor.white
termColor.bgBrightGrey = termColor.bgBrightGray = termColor.bgWhite
for (let style in styles) {
  termColor[style] = function (text) {
    return `\x1b[${styles[style]}m${text}\x1b[0m`
  }
}
/* eslint-disable */
/**
 * 给文本添加多种样式集
 * @param text  文本
 * @param styls 样式集
 * @returns
 */
termColor.style = function (text: string, styls: string[]) {
  let prefixs = []
  for (let styl of styls) {
    // 样式
    if (Object.prototype.hasOwnProperty.call(styles, styl)) {
      prefixs.push(`\x1b[${styles[styl]}m`)
    } else {
      // 颜色
      let isBg = styl.startsWith('bg') // 是否是背景色
      let colorName = ''
      let prefixIndex = -1
      if (styl.toLowerCase().includes('bright')) {
        // 明亮颜色
        colorName = styl.substring(isBg ? 8 : 6)
        prefixIndex = isBg ? 10 : 9
      } else {
        colorName = isBg ? styl.substring(2) : styl
        prefixIndex = isBg ? 4 : 3
      }
      let colorIndex = color16s.indexOf(colorName.toLowerCase())
      if (colorIndex === -1) {
        throw new Error(`unknown style ${styl}`)
      }
      prefixs.push(`\x1b[${prefixIndex}${colorIndex}m`)
    }
  }
  return `${prefixs.join('')}${text}\x1b[0m`
}

export = termColor
