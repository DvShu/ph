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
  return (dom || document).querySelectorAll<HTMLElement>(selector)
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
 * @param {boolean}     onceOrConfig  是否是只运行一次的处理函数或者配置，其中 eventFlag 为 string，如果配置该项，则表明为委托事件
 */
export function on(
  element: HTMLElement,
  listener: string,
  fn: (e: Event, target?: HTMLElement, flag?: string) => void,
  once: boolean | { once?: boolean; eventFlag?: string } = false,
) {
  let eventExtra: any = {}
  if (typeof once === 'boolean') {
    eventExtra.once = once
  } else {
    eventExtra = once
  }
  if (eventExtra.eventFlag != null) {
    element.setAttribute(eventExtra.eventFlag, '__stop__')
    element.addEventListener(
      listener,
      (e: Event) => {
        let target = e.target as HTMLElement
        let flag = ''
        do {
          flag = target.getAttribute(eventExtra.eventFlag) || ''
          if (flag === '') {
            target = target.parentNode as HTMLElement
          }
        } while (flag === '')
        if (flag !== '__stop__') {
          fn(e, target, flag)
        }
      },
      eventExtra,
    )
  } else {
    element.addEventListener(listener, fn, eventExtra)
  }
}

/**
 * 设置或获取节点的 innerHTML 属性
 * @param element
 * @param htmlstr 可选，如果传递该参数，则表示设置；否则表示获取
 * @returns
 */
export function html(element: HTMLElement, htmlstr?: string) {
  if (htmlstr == null) {
    return element.innerHTML
  } else {
    element.innerHTML = htmlstr
    return undefined
  }
}

/**
 * 设置或获取节点的 textContent 属性
 * @param element
 * @param textstr 可选，如果传递该参数，则表示设置；否则表示获取
 * @returns
 */
export function text(element: HTMLElement, textstr?: string) {
  if (textstr == null) {
    return element.textContent
  } else {
    element.textContent = textstr
    return undefined
  }
}

/**
 * 节点列表遍历
 * @param elems
 * @param fn 遍历到节点时的回调，回调第一个参数为遍历到的节点，第2个参数为 index；如果回调函数返回 true，则会终止遍历(break)
 */
export function iterate(elems: NodeList, fn: (el: HTMLElement, index: number) => any) {
  for (let i = 0, len = elems.length; i < len; i++) {
    let r = fn(elems[i] as HTMLElement, i)
    if (r === true) {
      break
    }
  }
}

/**
 * 设置或获取节点 data-* 属性
 * @param elem
 * @param key data- 后面跟随的值
 * @param value 如果传递该值表示获取；否则表示设置
 * @returns
 */
export function attr(elem: HTMLElement, key: string, value?: string) {
  if (value != null) {
    elem.setAttribute('data-' + key, value)
  } else {
    return elem.getAttribute('data-' + key)
  }
}
