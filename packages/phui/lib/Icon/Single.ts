import Icon, { IconConfig } from './index'

/**
 * 单色图标
 */
class SingleIcon extends Icon {
  /**
   * 构造单色图标
   * @param el 选择器或者HTML节点对象
   * @param icon 使用的图标名称
   * @param prefix 图标前缀，默认为：icon-
   */
  public constructor(
    el: string | HTMLElement | NodeList | HTMLCollection,
    config?: IconConfig,
    icon?: string,
    prefix?: string,
  ) {
    let _config = { ...config }
    if (prefix != null) {
      _config.prefix = prefix
    }
    if (icon != null) {
      _config.icon = icon
    }
    super(el, _config)
  }

  protected _template(_prefix: string, _icon: string) {
    return `<use xlink:href="#${_prefix || this.config.prefix}${_icon || this.config.icon}"></use>`
  }
}

export default SingleIcon
