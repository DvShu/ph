import colors = require('ph-terminal-colors')

/**
 * 所有的图标集
 */
const icons = {
  /** 图标：i，颜色为蓝色 */
  info: colors.blue('i'),
  /** 图标：√，颜色为绿色 */
  success: colors.green('√'),
  /** 图标：‼，颜色为黄色 */
  warning: colors.yellow('‼'),
  /** 图标：×，颜色为红色 */
  error: colors.red('×'),
}

export = icons
