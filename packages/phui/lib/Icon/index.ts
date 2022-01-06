import './index.css'
import { elem, iterate, addClass } from 'ph-utils/lib/dom'
import { isBlank } from 'ph-utils/lib/index_m'

/**
 * Icon 图标的配置
 */
export interface IconConfig {
  /** 图标内部的填充颜色 */
  fills?: string[]
  /** 图标的class */
  class?: string
  /** 使用 script 引入时的图标前缀，默认为：icon- */
  prefix?: string
  /** 使用 script 引入时的图标 */
  icon?: string
}

type InnerConfig = Required<IconConfig>

/**
 * 基础的图标
 */
class Icon {
  protected config: InnerConfig

  /**
   * 如果 第一个 参数为 string 类型，则表示 css 选择器，这个时候第二个参数就是待替换的颜色列表
   * 如果第1个参数为 string[] 则表示这个时候，不渲染节点，可以通过 toString() 获取颜色替换后的字符串
   * 颜色列表，会替换 template 节点中的 fill 对应的颜色
   * @param selectorsOrFills css选择器或者待渲染的颜色列表
   * @param fills 待渲染的颜色列表
   */
  public constructor(el: string | HTMLElement | NodeList | HTMLCollection, config?: IconConfig) {
    this.config = { fills: [], class: '', prefix: '', icon: '', ...(config || {}) }
    let dom: NodeList | null = null
    if (typeof el === 'string' && el !== '') {
      dom = elem(el)
    } else if (el instanceof HTMLElement) {
      dom = [el] as any
    } else {
      dom = el as NodeList
    }
    if (dom != null) {
      iterate(dom, (iel) => {
        let nicon = this.config.icon || iel.getAttribute('ph-icon-icon') || ''
        let nprefix = this.config.prefix || iel.getAttribute('ph-icon-prefix') || 'icon-'
        this.setIconProp(iel, nprefix, nicon)
      })
    }
  }

  public toString() {
    if (isBlank(this.config.icon)) {
      return (
        `<svg class="ph-icon ${this.config.class}" viewBox="0 0 1024 1024" aria-hidden="true">` +
        this.render() +
        '</svg>'
      )
    } else {
      return `<svg aria-hidden="true" class="ph-icon ${this.config.class}">${this.render()}</svg>`
    }
  }

  /**
   * SVG 图标内容
   * @returns SVG 图标的 path 节点列表字符串
   */
  protected _template(_prefix?: string, _icon?: string) {
    return ''
  }

  protected setIconProp(el: HTMLElement, prefix?: string, icon?: string) {
    if (!isBlank(icon)) {
      el.setAttribute('aria-hidden', 'true')
      addClass(el, 'ph-icon')
      el.innerHTML = this._template(prefix, icon)
    } else {
      let oldClass = el.getAttribute('class') || ''
      el.setAttribute('class', (oldClass + ' ph-icon ' + this.config.class).trim())
      el.setAttribute('viewBox', '0 0 1024 1024')
      el.setAttribute('aria-hidden', 'true')
      el.innerHTML = this.render()
    }
  }

  /**
   * 渲染节点，可以修改图标颜色
   * @returns
   */
  private render() {
    let temp = this._template()
    let fillLen = this.config.fills.length
    if (fillLen > 0) {
      let i = 0
      // 匹配 fill='' ，替换为指定的颜色
      temp = temp.replace(/fill=['\"]([#a-z0-9]*)['\"]/gim, (match) => {
        if (i >= this.config.fills.length) {
          return match
        } else {
          let fillColor = this.config.fills[i]
          i++
          return isBlank(fillColor) ? match : `fill="${fillColor}"`
        }
      })
    }

    return temp
  }
}

export default Icon
