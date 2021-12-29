import { elem, iterate, addClass } from 'ph-utils/lib/dom'

/**
 * 单色图标
 */
class SingleIcon {
  /**
   * 构造单色图标
   * @param el 选择器或者HTML节点对象
   * @param icon 使用的图标名称
   * @param prefix 图标前缀，默认为：icon-
   */
  public constructor(el: string | HTMLElement | NodeList | HTMLCollection, icon?: string, prefix?: string) {
    if (typeof el === 'string') {
      el = elem(el)
    }
    if (el instanceof NodeList || el instanceof HTMLCollection) {
      iterate(el as NodeList, (iel) => {
        let nicon = icon || iel.getAttribute('ph-icon-icon') || ''
        let nprefix = prefix || iel.getAttribute('ph-icon-prefix') || 'icon-'
        this.render(iel, nprefix, nicon)
      })
    } else {
      icon = icon || el.getAttribute('data-icon') || ''
      prefix = prefix || el.getAttribute('data-prefix') || 'icon-'
      this.render(el, prefix, icon)
    }
  }

  private render(el: HTMLElement, prefix: string, icon: string) {
    el.setAttribute('aria-hidden', 'true')
    addClass(el, 'ph-icon')
    el.innerHTML = `<use xlink:href="#${prefix}${icon}"></use>`
  }
}

export default SingleIcon
