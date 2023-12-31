/**
 * web(浏览器) 端工具类
 */
import { isBlank } from './index';

/**
 * 解析 Form 表单中的 input 元素的数据为 JSON 格式，key: input-name；value: input-value
 * @param form {object} Form 节点对象
 */
export const formJson = function <T>(form: HTMLFormElement): T {
  let elems = form.elements;
  let value: any = {};
  for (let i = 0, len = elems.length; i < len; i++) {
    let item = elems[i] as HTMLSelectElement & HTMLInputElement;
    if (!isBlank(item.name)) {
      if ((item.tagName === 'INPUT' || item.tagName === 'TEXTAREA') && !isBlank(item.value)) {
        let dataType = item.getAttribute('data-type');
        if (dataType === 'number') {
          value[item.name] = Number(item.value);
        } else {
          value[item.name] = item.value;
        }
      } else if (item.tagName === 'SELECT') {
        value[item.name] = (item.options[item.selectedIndex] as any).value;
      }
    }
  }
  return value;
};

/**
 * 获取 url query 参数 (get 请求的参数)
 * @param search 如果是 React 应用就需要传递 useLocation().search
 * @returns
 */
export function query(search?: string): { [index: string]: string } {
  if (isBlank(search)) {
    search = location.search;
  }
  const searchParams = new URLSearchParams(search);
  let query: any = {};
  for (const [key, value] of searchParams) {
    let oldValue: any = query[key];
    let newValue: any = value;
    if (oldValue != null) {
      if (oldValue instanceof Array) {
        oldValue.push(value);
        newValue = oldValue;
      } else {
        newValue = [value, oldValue];
      }
    }
    query[key] = newValue;
  }
  return query;
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
