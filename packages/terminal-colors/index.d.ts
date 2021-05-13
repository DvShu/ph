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
declare const termColor: TermColorIntf
export = termColor
