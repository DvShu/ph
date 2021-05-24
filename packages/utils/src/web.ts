/**
 * web(浏览器) 端工具类
 */
import { isBlank, isBoolean, isNumeric } from './index'

/**
 * 解析 Form 表单中的 input 元素的数据为 JSON 格式，key: input-name；value: input-value
 * @param form {object} Form 节点对象
 */
export const formJson = function <T>(form: HTMLFormElement): T {
  let elems = form.elements
  let value: any = {}
  for (let i = 0, len = elems.length; i < len; i++) {
    let item = elems[i] as HTMLSelectElement & HTMLInputElement
    if (!isBlank(item.name)) {
      if ((item.tagName === 'INPUT' || item.tagName === 'TEXTAREA') && !isBlank(item.value)) {
        let dataType = item.getAttribute('data-type')
        if (dataType === 'number') {
          value[item.name] = Number(item.value)
        } else {
          value[item.name] = item.value
        }
      } else if (item.tagName === 'SELECT') {
        value[item.name] = (item.options[item.selectedIndex] as any).value
      }
    }
  }
  return value
}

/**
 * 获取 url query 参数 (get 请求的参数)
 * @param key 获取指定 key 的参数，可选，如果不传该参数，则返回解析到的所有的参数列表
 * @returns
 */
export function query(key?: string | string[]): unknown {
  let search: string | string[] = location.search
  let query: { [index: string]: number | boolean | string | any[] } = {}
  if (search.indexOf('?') !== -1) {
    search = search.substring(1).split('&')
    search.forEach((item: any) => {
      item = (item as string).split('=')
      let oldValue: any = query[item[0]]
      let value: any = decodeURIComponent(item[1])
      if (isBoolean(value)) {
        // boolean
        value = Boolean(value)
      } else if (isNumeric(value)) {
        // 数字
        value = Number(value)
      }
      if (oldValue != null) {
        if (oldValue instanceof Array) {
          oldValue.push(value)
          value = oldValue
        } else {
          value = [oldValue, value]
        }
      }
      query[item[0]] = value
    })
  }
  if (key == null) {
    return query
  } else if (typeof key === 'string') {
    return query[key]
  } else {
    const res: { [index: string]: number | boolean | string | any[] | undefined } = {}
    key.forEach((ki: string) => {
      res[ki] = query[ki]
    })
    return res
  }
}

interface RandomOpts {
  /** 生成的随机数是整形还是小数形 */
  isInt?: boolean
  /** 生成的随机数是否包含末尾数字 end, 仅在有 end 参数并且 isInt = true 时有效; true 表示包含 */
  hasEnd?: boolean
}

/**
 * 生成指定长度的随机数
 * @param len 生成的随机数长度
 * @param firstZero 生成的随机数第一位是否可以包含 0，默认为 true
 */
export function random(len: number, firstZero?: boolean): string
/**
 * 生成介于 min 和 max 之间的随机数
 * @param min   最小值
 * @param max   最大值
 * @param opts  配置项
 * @property opts.isInt 生成的随机数是整形还是小数形
 * @property opts.hasEnd 生成的随机数是否包含末尾数字 max, 仅在有 max 参数并且 isInt = true 时有效; true 表示包含
 */
export function random(min: number, max: number, opts?: RandomOpts): number
export function random(): string | number {
  let r: number | string = Math.random()
  const startOrLen = arguments[0]
  let endOrFirstZero = arguments[1]
  if (typeof endOrFirstZero === 'number') {
    /* 生成两个数字之间的随机数(number) */
    let opts: RandomOpts = arguments[3]
    const dftOpts = { isInt: true }
    opts = Object.assign(dftOpts, opts || {})
    const e = opts.isInt && opts.hasEnd ? 1 : 0
    const rs = r * (endOrFirstZero - startOrLen + e) + startOrLen
    return opts.isInt ? parseInt(rs, 10) : rs
  }
  endOrFirstZero = endOrFirstZero || true
  if (endOrFirstZero) {
    // 生成的数字包含前面的0
    r = r.toString()
    return (r as string).substr(r.indexOf('.') + 1, startOrLen)
  }
  const max = Math.pow(10, startOrLen - 1)
  r = parseInt(String(r * max), 10)
  if (r < max) {
    // 生成的随机数前置有0，重新生成随机数
    return random(startOrLen, endOrFirstZero)
  }
  return r
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