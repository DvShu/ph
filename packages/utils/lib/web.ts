/**
 * 所有的 WEB 浏览器端使用的工具
 */
import { isBlank } from './index'

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
      if (
        ((item.tagName === 'INPUT' && item.type === 'text') ||
          item.tagName === 'TEXTAREA') &&
        !isBlank(item.value)
      ) {
        // 文本
        let dataType = item.getAttribute('data-type')
        if (dataType === 'number') {
          value[item.name] = Number(item.value)
        } else {
          value[item.name] = item.value
        }
      } else if (item.type === 'radio' && item.checked) {
        // 单选框
        value[item.name] = item.value
      } else if (item.type === 'checkbox' && item.checked) {
        // 复选框
        let oldValue: any = value[item.name]
        if (!isBlank(oldValue)) {
          value[item.name] = item.value
        } else {
          if (oldValue instanceof Array) {
            oldValue.push(item.value)
            value[item.name] = oldValue
          } else {
            value[item.name] = [oldValue, item.value]
          }
        }
      } else if (item.tagName === 'SELECT') {
        // 下拉选择框
        value[item.name] = (item.options[item.selectedIndex] as any).value
      }
    }
  }
  return value
}
