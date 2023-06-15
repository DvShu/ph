/**
 * node 和 web 通用的工具类
 */
/** 包含字母+数字的随机数字符 */
const RANDOM_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
/** 只包含字母的随机数字符 */
const NUMBER_RANDOM_CHARTS = '0123456789';
/**
 * 验证字符串是否为空
 * @param str               待验证的字符串
 * @param ignoreWhitespace  是否忽略空格(包括空白字符串以及[\r\t\n]之类的制表符)，默认为true
 */
export function isBlank(str?: string | null, ignoreWhitespace = true) {
  if (str == null) {
    return true;
  }
  return (ignoreWhitespace ? str.trim().length : str.length) === 0;
}

/**
 * 屏蔽手机号，中间部分用 * 展示
 * @param mobile 待屏蔽的手机号
 * @returns 屏蔽后的手机号，例如：123 **** 1234
 */
export function shieldMobile(mobile: string) {
  let x1 = Math.floor(mobile.length / 2);
  let x2 = Math.ceil(x1 / 2);
  let shields = [' '];
  for (let i = 0; i < x1 - 1; i++) {
    shields.push('*');
  }
  shields.push(' ');
  return mobile.substring(0, x2) + shields.join('') + mobile.substring(x2 + x1 - 1);
}

/**
 * 验证参数是否是数字
 * @param str 待验证的字符串
 * @param numericParam 通过参数标记是否包含小数、正数
 * @param numericParam.isPositive 是否是正数
 * @param numericParam.isFloat 是否是小数
 * @returns true 是数字, false 不是数字
 */
export function isNumeric(str: string, numericParam?: { isPositive?: boolean; isFloat?: boolean }): boolean {
  numericParam = { isPositive: false, isFloat: true, ...(numericParam || {}) };
  let symbol = numericParam.isPositive ? '[+]?' : '[+-]?';
  let main = numericParam.isFloat ? '([0-9]*[.])?[0-9]+' : '[0-9]+';
  return new RegExp('^' + symbol + main + '$').test(str);
}

/**
 * 验证参数是否是Boolean 类型
 * @param str 待验证的字符串
 * @returns
 */
export function isBoolean(str: string): boolean {
  return ['true', 'false'].indexOf(str) >= 0;
}

/** 生成随机数的选项 */
interface RandomConfig {
  /** 生成指定长度的随机字符串 */
  length?: number;
  /** 是否包含英文字母, 默认为: true */
  hasLetter?: boolean;
  /** 生成纯数字的随机数时, 首位是否允许为 0, 默认为: true */
  firstIsZero?: boolean;

  /** 配合 max 生成 [min~max] 之间的随机数 */
  min?: number;
  /** 配合 min 生成 [min~max] 之间的随机数 */
  max?: number;
  /** 生成的随机数，是否包含 max, 默认: false */
  hasEnd?: boolean;
  /** 生成的随机数是否是整数, 默认: true */
  isInteger?: boolean;
}

/**
 * 生成随机数
 *  1. 生成指定长度的随机数
 *  2. 生成介于 [min, max] 之间的随机数
 * @param opts 生成随机数的配置
 * @returns
 */
export function random(opts: number | RandomConfig) {
  if (typeof opts === 'object' && opts.min != null && opts.max != null) {
    const randomNum = Math.random();
    /* 生成两个数字之间的随机数(number) */
    const end = opts.hasEnd ? 1 : 0;
    const resRandom = randomNum * (opts.max - opts.min + end) + opts.min;
    return opts.isInteger !== false ? Math.floor(resRandom) : resRandom;
  } else {
    if (typeof opts === 'object' && opts.length == null) {
      throw new Error('random_length_cannot_null');
    }
    const len = typeof opts === 'object' ? (opts.length as number) : opts;
    /* 生成指定长度的随机数 */
    const charLens = RANDOM_CHARS.length;
    let chars = RANDOM_CHARS;
    if (typeof opts === 'object' && opts.hasLetter === false) {
      chars = NUMBER_RANDOM_CHARTS;
    }
    const resRandom = Array.from({ length: len }, () => chars.charAt(Math.floor(Math.random() * charLens))).join('');
    if (typeof opts === 'object' && opts.firstIsZero === false && resRandom.indexOf('0') === 0) {
      return random(opts);
    } else {
      return resRandom;
    }
  }
}

/**
 * 带有错误名称标记的错误类型
 */
export class BaseError extends Error {
  /**
   * 错误名称，类似于 Java 中的不同的 Exception[NullPointerException]；
   * 增加 name 字段，表明不同的错误，当需要根据不同的错误执行不同的处理的时候，会很有用
   */
  public name: string;
  /**
   * 构造一个 name = BaseError 的错误信息
   * @param message 错误描述
   */
  public constructor(message: string);
  /**
   *
   * @param name 错误名称
   * @param message 错误描述
   */
  public constructor(name: string, message: string);
  public constructor() {
    if (arguments.length === 1) {
      super(arguments[0]);
      this.name = 'BaseError';
    } else {
      super(arguments[1]);
      this.name = arguments[0];
    }
  }
}

/**
 * 函数节流 - 每隔单位时间，只执行一次
 * @param cb    待节流的函数
 * @param wait  间隔时间
 * @returns
 */
export function throttle<R extends any[], T>(fn: (...args: R) => T, wait = 500) {
  // 上一次的请求时间
  let last = 0;
  return (...args: R) => {
    // 当前时间戳
    const now = Date.now();
    if (now - last > wait) {
      fn(...args);
      last = now;
    }
  };
}

/**
 * 函数防抖 - 当重复触发某一个行为（事件时），只执行最后一次触发
 * @param fn        防抖函数
 * @param interval  间隔时间段
 * @returns
 */
export function debounce<R extends any[], T>(fn: (...args: R) => T, interval = 500) {
  let _t = -1;
  return (...args: R) => {
    clearTimeout(_t);
    _t = setTimeout(() => {
      fn(...args);
    }, interval) as any;
  };
}

/**
 * 将金额数字格式化为金额格式显示并且会保留两位小数[去除多余的位数，不是四舍五入，而是直接舍去]  1234523432.23 => 123,123,123.23
 * @param {number} number 待转换的金额数字
 * @return string
 */
export function formatMoney(number: number) {
  if (typeof Intl.NumberFormat !== 'undefined') {
    const formatter = new Intl.NumberFormat('zh-CN', {
      style: 'decimal',
      maximumFractionDigits: 2,
    });
    return formatter.format(number);
  } else {
    number = number || 0;
    let negative = '';
    let base = String(parseInt(number as any, 10)); // 获取数字整数部分
    let mod = base.length > 3 ? base.length % 3 : 0;
    /*
     * 利用 正则前瞻 (?=) 将3位数字后面还紧跟一位数字的三位数字替换为 数字, 的形式
     */
    let numberStr = String(number);
    let usePrecision = numberStr.indexOf('.');
    let dotStr = usePrecision > 0 ? numberStr.slice(usePrecision + 1) : '00';
    dotStr = dotStr.length > 2 ? dotStr.slice(0, 2) : dotStr;
    return (
      negative + (mod ? base.slice(0, mod) + ',' : '') + base.slice(mod).replace(/(\d{3})(?=\d)/g, '$1,') + '.' + dotStr
    );
  }
}
