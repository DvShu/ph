/**
 * node 和 web 端日期处理工具类
 */
// 配置日期格式的正则表达式
const REGEX_FORMAT = /yy(?:yy)?|([HMmds])\1?/g;
// 由于 Date.parse() 不能正确解析 yyyy-dd-mm 格式的日期, 所以匹配手动解析
const REGEX_PARSE = /^(\d{4})-?(\d{1,2})-?(\d{0,2})[^0-9]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?.?(\d{1,3})?$/;

const ofArgs = {
  start: [0, 0, 1, 0, 0, 0, 0],
  end: [0, 11, -2, 23, 59, 59, 999],
};

const units = {
  Date: ['date', 'Date', 'day', 'Day', 'D', 'd'],
  Month: ['Month', 'month', 'm'],
  Year: ['Year', 'year', 'y'],
  Hours: ['Hours', 'hours', 'H'],
  Minutes: ['Minutes', 'Minute', 'minute', 'minutes', 'M'],
  Seconds: ['Seconds', 'seconds', 'Second', 'second', 's'],
  Milliseconds: ['Milliseconds', 'Millisecond', 'milliseconds', 'illisecond', 'S'],
};

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
  return ('000' + s).slice(l * -1);
}

/**
 * 将单位转换为首字母大写, 例如：hours -> Hours
 * @param unit hours
 * @returns
 */
function getUnit(unit: string): string {
  let period: string | null = null;
  for (let [key, value] of Object.entries(units)) {
    if (value.includes(unit)) {
      period = key;
      break;
    }
  }
  if (period == null) {
    throw new Error(`Invalid unit: ${unit}`);
  }
  return period;
}

/**
 * 获取指定日期某个月的最后一天
 * @param date  日期
 * @param month 月份, 如果不传, 则当前月的最后一天
 * @returns
 */
function getLastDayOfYear(date: Date, month?: number) {
  // 获取下个月的第一天
  const lastDate = new Date(date.getFullYear(), (month || date.getMonth()) + 1, 1);
  // 将下个月的第一天的日期减去一天，得到当前月的最后一天
  lastDate.setDate(lastDate.getDate() - 1);
  // 返回最后一天的日期
  return lastDate.getDate();
}

/**
 * 将日期格式化为指定形式的字符串
 * @param date      日期
 * @param pattern   格式化字符串 yyyy - 年, mm - 月, dd - 日, HH - 小时, MM - 分钟, ss - 秒
 */
export function format(date?: Date | string | number, pattern = 'yyyy-mm-dd HH:MM') {
  // eslint-disable-next-line
  date = parse(date);
  let d = date.getDate();
  let y = date.getFullYear();
  let m = date.getMonth();
  let H = date.getHours();
  let M = date.getMinutes();
  let s = date.getSeconds();
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
  };
  if (pattern != null) {
    return pattern.replace(REGEX_FORMAT, (flag: string) => {
      if (flag in flags) {
        return flags[flag];
      }
      return flag;
    });
  }
  return String(date.getTime());
}

/**
 * 将指定的参数解析为日期对象(Date)
 * 参考 dayjs 实现, 也可以参考 https://github.com/nomiddlename/date-format
 * @param date 待解析的日期参数
 */
export function parse(date?: Date | string | number) {
  if (date == null) return new Date();
  if (date instanceof Date) return date;
  if (typeof date === 'string' && !/Z$/i.test(date)) {
    const d: any = date.match(REGEX_PARSE);
    if (d) {
      return new Date(d[1], d[2] - 1, d[3] || 1, d[4] || 0, d[5] || 0, d[6] || 0, d[7] || 0);
    }
  }
  if (typeof date === 'number') {
    return new Date(date <= 9999999999 ? date * 1000 : date);
  }
  return new Date();
}

/**
 * 设置日期的开始或者结束的点
 * @param {Object} date 日期，能够被 parse 解析的日期
 * @param {String} unit 单位，Date|date, 默认为 Date
 * @param {Boolean} isEnd true则为 endOf
 */
export function dateOf(date?: Date | string | number, unit?: string, isEnd = false) {
  /* 如果是设置某一天的开始时刻, 就需要将时、分、秒、毫秒设置为0，依次类推设置 */
  const periods = ['Year', 'Month', 'Date', 'Hours', 'Minutes', 'Seconds', 'Milliseconds'];
  let index = periods.indexOf(getUnit(unit || 'Date'));
  const clone = parse(date);
  index++;
  const setValues = ofArgs[isEnd === true ? 'end' : 'start'];
  for (const len = periods.length; index < len; index++) {
    let value = setValues[index];
    if (value === -2) {
      // 设置为某个月的最后一天的日期
      value = getLastDayOfYear(clone);
    }
    (Date as any).prototype['set' + periods[index]].apply(clone, [setValues[index]]);
  }
  return clone;
}

/**
 * 设置日期的开始的点
 * @param date 日期，能够被 parse 解析的日期
 * @param unit 单位，Date|date, 默认为 Date
 * @returns
 */
export function startOf(date?: Date | string | number, unit?: string) {
  return dateOf(date, unit);
}

/**
 * 设置日期的结束点
 * @param date 日期，能够被 parse 解析的日期
 * @param unit 单位，Date|date, 默认为 Date
 * @returns
 */
export function endOf(date?: Date | string | number, unit?: string) {
  return dateOf(date, unit, true);
}

/**
 * 获取时间戳
 * @param ctime 时间
 * @param unit 时间戳长度
 * @returns
 */
export function timeStamp(ctime?: Date | string | number, unit: 's' | 'ms' = 's') {
  let tm = parse(ctime).getTime();
  return unit === 's' ? Math.floor(tm / 1000) : tm;
}

/**
 * 日期加上指定时间后的日期
 * @param date 指定的日期
 * @param num  需要添加的数字, 如果这个参数传递一个小于0的数字，则就是日期减去相应的数字
 * @param unit 需要添加的单位，date - 加减天数
 */
export function add(date: Date | string | number | null, num: number, unit: string): Date;
/**
 * 日期加上指定时间后的日期
 * @param date    指定的日期, 传递为 null ，则表示为当前日期
 * @param num     需要添加的数字, 如果这个参数传递一个小于0的数字，则就是日期减去相应的数字
 * @param unit    需要添加的单位，date - 加减天数
 * @param fmt     如果传递了格式化的单位，则返回格式化后的日期, 格式化字符串 yyyy - 年, mm - 月, dd - 日, HH - 小时, MM - 分钟, ss - 秒
 */
export function add(date: Date | string | number | null, num: number, unit: string, fmt: string): string;
/**
 * 日期加上指定时间后的日期
 * @param date  指定的日期
 * @param num   需要添加的数字, 如果这个参数传递一个小于0的数字，则就是日期减去相应的数字
 * @param unit  需要添加的单位，date - 加减天数
 * @param fmt   可选参数，如果传递了格式化的单位，则返回格式化后的日期, 格式化字符串 yyyy - 年, mm - 月, dd - 日, HH - 小时, MM - 分钟, ss - 秒
 * @returns {Date | string} 如果传递了 fmt 参数，则返回 string，否则返回 Date
 */
export function add(date: Date | string | number | null, num: number, unit: string, fmt?: string): any {
  let sdate = new Date();
  if (date != null) {
    sdate = parse(date);
  }
  // eslint-disable-next-line
  unit = getUnit(unit);
  let fn = 'set' + unit;
  let gn = 'get' + unit;
  // @ts-ignore
  let oldValue = Date.prototype[gn].apply(sdate);
  // @ts-ignore
  Date.prototype[fn].apply(sdate, [oldValue + num]);
  if (typeof fmt === 'string') {
    return format(sdate, fmt);
  } else {
    return sdate;
  }
}
