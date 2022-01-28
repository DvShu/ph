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
