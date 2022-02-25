/**
 * It creates a div element if the first argument is a string.
 * @param {string | HTMLElement} el - The element to query. Can be a string, a DOM element, or a jQuery
 * object.
 * @param [tagName=div] - The tag name of the element to be created.
 * @returns The queryElem function returns a div element.
 */
export function queryElem(el: string | HTMLElement, tagName = 'div') {
  let qel: HTMLElement
  if (typeof el === 'string') {
    if (el.trim() === '') {
      qel = document.createElement(tagName || 'div')
    } else {
      let els = document.querySelector(el)
      if (els != null) {
        qel = els as HTMLElement
      } else {
        qel = document.createElement(tagName || 'div')
      }
    }
  } else {
    qel = el
  }
  return qel
}

/**
 * 获取节点的宽高大小信息
 * @param {string | HTMLElement} hideNode - The node to hide.
 * @param parent - 添加临时节点的父节点，默认为: body.
 * @returns The DOMRect of the element.
 */
export function queryHideNodeRect(hideNode: string | HTMLElement, parent = document.body) {
  // 计算折叠菜单的高度
  let $tmp = document.createElement('div')
  $tmp.style.cssText = 'position:fixed;left:-1000px;top:-1000px;opacity:0;'
  let $tmpInner = document.createElement('div')
  $tmpInner.style.cssText = 'position:relative;'
  if (typeof hideNode === 'string') {
    $tmpInner.innerHTML = hideNode
  } else {
    $tmpInner.appendChild(hideNode)
  }
  $tmp.appendChild($tmpInner)
  parent.appendChild($tmp)
  let rect = $tmpInner.children[0].getBoundingClientRect()
  parent.removeChild($tmp)
  return rect
}
