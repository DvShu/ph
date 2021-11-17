/**
 * node 和 web 端日期处理工具类
 */
// 配置日期格式的正则表达式
const REGEX_FORMAT = /yy(?:yy)?|([HMmds])\1?/g
// 由于 Date.parse() 不能正确解析 yyyy-dd-mm 格式的日期, 所以匹配手动解析
const REGEX_PARSE = /^(\d{4})-?(\d{1,2})-?(\d{0,2})[^0-9]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?.?(\d{1,3})?$/

/**
 * 不足位数, 前位补 0
 * @param s 日期数字
 * @param l 截取位数
 * @returns {string}  补0后的日期数字
 */
function p(s: number, l = 2) {
  /*
   * 由于年份最多为4为，所以前面先添3个0
   * slice() 从后开始提前字符串
   */
  return ('000' + s).slice(l * -1)
}

function getUnit(unit: string): string {
  return unit.substring(0, 1).toUpperCase() + unit.substring(1)
}

/**
 * 将日期格式化为指定形式的字符串
 * @param date      日期
 * @param pattern   格式化字符串 yyyy - 年, mm - 月, dd - 日, HH - 小时, MM - 分钟, ss - 秒
 */
export function format(date?: Date | string | number, pattern = 'yyyy-mm-dd HH:MM') {
  date = parse(date)
  let d = date.getDate()
  let y = date.getFullYear()
  let m = date.getMonth()
  let H = date.getHours()
  let M = date.getMinutes()
  let s = date.getSeconds()
  let flags: any = {
    yy: p(y),
    yyyy: y,
    m: m + 1,
    mm: p(m + 1),
    d: d,
    dd: p(d),
    H: H,
    HH: p(H),
    M: M,
    MM: p(M),
    s: s,
    ss: p(s),
  }
  if (pattern != null) {
    return pattern.replace(REGEX_FORMAT, (flag: string) => {
      if (flag in flags) {
        return flags[flag]
      }
      return flag
    })
  }
  return String(date.getTime())
}

/**
 * 将指定的参数解析为日期对象(Date)
 * 参考 dayjs 实现, 也可以参考 https://github.com/nomiddlename/date-format
 * @param date 待解析的日期参数
 */
export function parse(date?: Date | string | number) {
  if (date == null) return new Date()
  if (date instanceof Date) return date
  if (typeof date === 'string' && !/Z$/i.test(date)) {
    const d: any = date.match(REGEX_PARSE)
    if (d) {
      return new Date(d[1], d[2] - 1, d[3] || 1, d[4] || 0, d[5] || 0, d[6] || 0, d[7] || 0)
    }
  }
  return new Date(date)
}

/**
 * 设置日期的开始或者结束的点
 * @param {Object} date 日期，能够被 parse 解析的日期
 * @param {String} unit 单位，H Hours, 默认为 H
 * @param {Boolean} isEnd true则为 endOf
 */
export function startOf(date?: Date | string | number, unit?: string, isEnd = false) {
  const argumentStart = [0, 0, 0, 0]
  const argumentEnd = [23, 59, 59, 999]
  date = parse(date)
  let u = getUnit(unit || 'Hours')
  let fn = 'set' + u
  let args: any = isEnd === true ? argumentEnd : argumentStart
  ;(Date as any).prototype[fn].apply(date, args)
  return date
}

/**
 * 日期加上指定时间后的日期
 * @param date 指定的日期
 * @param num  需要添加的数字, 如果这个参数传递一个小于0的数字，则就是日期减去相应的数字
 * @param unit 需要添加的单位，date - 加减天数
 */
export function add(date: Date | string | number | null, num: number, unit: string): Date
/**
 * 日期加上指定时间后的日期
 * @param date    指定的日期, 传递为 null ，则表示为当前日期
 * @param num     需要添加的数字, 如果这个参数传递一个小于0的数字，则就是日期减去相应的数字
 * @param unit    需要添加的单位，date - 加减天数
 * @param fmt     如果传递了格式化的单位，则返回格式化后的日期, 格式化字符串 yyyy - 年, mm - 月, dd - 日, HH - 小时, MM - 分钟, ss - 秒
 */
export function add(date: Date | string | number | null, num: number, unit: string, fmt: string): string
/**
 * 日期加上指定时间后的日期
 * @param date  指定的日期
 * @param num   需要添加的数字, 如果这个参数传递一个小于0的数字，则就是日期减去相应的数字
 * @param unit  需要添加的单位，date - 加减天数
 * @param fmt   可选参数，如果传递了格式化的单位，则返回格式化后的日期, 格式化字符串 yyyy - 年, mm - 月, dd - 日, HH - 小时, MM - 分钟, ss - 秒
 * @returns {Date | string} 如果传递了 fmt 参数，则返回 string，否则返回 Date
 */
export function add(date: Date | string | number | null, num: number, unit: string, fmt?: string): any {
  let sdate = new Date()
  if (date != null) {
    sdate = parse(date)
  }
  unit = getUnit(unit)
  let fn = 'set' + unit
  let gn = 'get' + unit
  let oldValue = Date.prototype[gn].apply(sdate)
  Date.prototype[fn].apply(sdate, [oldValue + num])
  if (typeof fmt === 'string') {
    return format(sdate, fmt)
  } else {
    return sdate
  }
}
