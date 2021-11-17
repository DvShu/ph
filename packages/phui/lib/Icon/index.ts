import './index.less'

/**
 * Icon 图标的配置
 */
interface IconConfig {
  /** 图标内部的填充颜色 */
  fills?: string[]
  /** 图标的class */
  class?: string
}

type ConfigRequired = Required<IconConfig>

/**
 * 基础的图标
 */
class Icon {
  private _config: ConfigRequired

  /**
   * 如果 第一个 参数为 string 类型，则表示 css 选择器，这个时候第二个参数就是待替换的颜色列表
   * 如果第1个参数为 string[] 则表示这个时候，不渲染节点，可以通过 toString() 获取颜色替换后的字符串
   * 颜色列表，会替换 template 节点中的 fill 对应的颜色
   * @param selectorsOrFills css选择器或者待渲染的颜色列表
   * @param fills 待渲染的颜色列表
   */
  public constructor(el: string | Element, config?: IconConfig) {
    this._config = { fills: [], class: '', ...(config || {}) }
    if (typeof el === 'string') {
      if (el !== '') {
        // 选择器
        let $el = document.querySelectorAll(el)
        if ($el != null) {
          for (let i = 0, len = $el.length; i < len; i++) {
            this.setIconProp($el[i])
          }
        }
      }
    } else if (el instanceof Element) {
      this.setIconProp(el)
    }
  }

  public toString() {
    return (
      `<svg class="ph-icon ${this._config.class}" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">` +
      this.render() +
      '</svg>'
    )
  }

  /**
   * SVG 图标内容
   * @returns SVG 图标的 path 节点列表字符串
   */
  protected _template() {
    return ''
  }

  private setIconProp(el: Element) {
    let oldClass = el.getAttribute('class') || ''
    el.setAttribute('class', (oldClass + ' ph-icon ' + this._config.class).trim())
    el.setAttribute('viewBox', '0 0 1024 1024')
    el.setAttribute('version', '1.1')
    el.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    el.innerHTML = this.render()
  }

  /**
   * 渲染节点，可以修改图标颜色
   * @returns
   */
  private render() {
    let temp = this._template()
    let fillLen = this._config.fills.length
    if (fillLen > 0) {
      let i = 0
      // 匹配 fill='' ，替换为指定的颜色
      temp = temp.replace(/fill=['\"]([#a-z0-9]*)['\"]/gim, (match) => {
        if (i >= this._config.fills.length) {
          return match
        } else {
          let fillColor = this._config.fills[i]
          i++
          return fillColor === '' ? match : `fill="${fillColor}"`
        }
      })
    }

    return temp
  }
}

export default Icon
