/**
 * web(浏览器端) DOM 文件操作
 * 现今不推荐在使用这种方式，现在开发前端的时候，推荐使用一些成熟的框架例如：React、Preact、Vue、Angular、Svelte、Ember、Knockout等
 * 在使用这些框架的时候额外的一些不可避免的 dom 操作时才使用这个工具；如果确实需要使用原生开发推荐使用 jquery 或者想要更精简的话可以使用 https://github.com/finom/bala 封装
 */
const vendorPrefix = ['', '-webkit', '-moz-']
/**
 * 根据选择器获取节点
 * @param {string} selector 选择器
 */
export function elem(selector: string, dom?: HTMLElement) {
  return (dom || document).querySelectorAll(selector)
}

/**
 * 为节点添加 class
 * @param {HTMLElement} elem 待添加 class 的节点
 * @param {string} clazz     需要添加的 class
 */
export function addClass(elem: HTMLElement, clazz: string) {
  elem.classList.add(clazz)
}

/**
 * 节点移除 class
 * @param {HTMLElement} elem 待移除 class 的节点
 * @param {string} clazz     需要移除的 class
 */
export function removeClass(elem: HTMLElement, clazz: string) {
  elem.classList.remove(clazz)
}

/**
 * 为节点添加 transition 属性，包括浏览器前缀
 * @param {HTMLElement} element 需要添加 css Transition 属性的节点
 * @param {string}      value   css transition 值
 */
export function transition(element: HTMLElement, value: string) {
  vendorPrefix.forEach((prefix: string) => {
    let t = prefix === '' ? 'transition' : prefix + 'Transition'
    element.style[t as any] = value
  })
}

/**
 * 为节点添加 transform 属性，包括浏览器前缀
 * @param {HTMLElement} element  需要添加 css transform 属性的节点
 * @param {string}      value     css transform 值
 */
export function transform(element: HTMLElement, value: string) {
  vendorPrefix.forEach((prefix) => {
    let t = prefix === '' ? 'transform' : prefix + 'Transform'
    element.style[t as any] = value
  })
}

/**
 * 为节点添加事件处理
 * @param {HTMLElement} element   添加事件的节点
 * @param {string}      listener  事件名称
 * @param {function}    event     事件处理函数
 * @param {boolean}     once      是否是只运行一次的处理函数
 */
export function on(element: HTMLElement, listener: string, event: () => void, once = false) {
  element.addEventListener(listener, event, { once })
}
