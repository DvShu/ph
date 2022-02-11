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
