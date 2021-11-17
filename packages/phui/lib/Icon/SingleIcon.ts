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
  public constructor(el: string | Element, icon: string, prefix = 'icon-') {
    if (typeof el === 'string') {
      let $el = document.querySelectorAll(el)
      for (let i = 0, len = $el.length; i < len; i++) {
        this.render($el[i], prefix, icon)
      }
    } else {
      this.render(el, prefix, icon)
    }
  }

  private render(el: Element, prefix: string, icon: string) {
    el.setAttribute('aria-hidden', 'true')
    el.setAttribute('class', (el.getAttribute('class') + ' ph-icon').trim())
    el.innerHTML = `<use xlink:href="#${prefix}${icon}"></use>`
  }
}

export default SingleIcon
