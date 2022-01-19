import { isBlank } from 'ph-utils/lib/index_m'
import Icon from '../Icon'
import LoadingIcon from '../Icon/Loading'
import { queryElem } from '../utils'

import './index.css'

/**
 * 按钮配置项 type、round、circle、block、icon、text
 */
interface ButtonConfig {
  /** 类型 */
  type?: 'primary' | 'text'
  /** 是否是弧形按钮 */
  round?: boolean
  /** 是否是圆形按钮 */
  circle?: boolean
  /* 按钮是否适合其父宽度(宽度100%) */
  block?: boolean
  /** 图标 */
  icon?: Icon
  /** 按钮文本内容 */
  text?: string
  /** 添加按钮样式 */
  class?: string
  /** 如果节点不存在，渲染的节点名称, button, a */
  tag?: string
  attrs?: { [index: string]: string }
}

/**
 * 按钮
 */
class Button {
  private _el: HTMLButtonElement
  private _config: ButtonConfig
  private _loading: boolean
  private _loadingIcon: LoadingIcon

  /**
   *
   * @param el 按钮节点或者选择器
   * @param config 按钮配置项
   */
  public constructor(el: HTMLButtonElement | string, config?: ButtonConfig) {
    this._config = { round: false, circle: false, block: false, tag: 'button', ...(config || {}) }
    this._el = queryElem(el, this._config.tag) as HTMLButtonElement
    let _text = this._config.text == null ? this._el.innerHTML : this._config.text
    this._config.text = isBlank(_text) ? '' : `<span>${_text}</span>`
    this._loading = false
    this._loadingIcon = new LoadingIcon('')
    this._render()
  }

  /**
   * 设置是否正在加载数据
   * @param loading 是否正在加载数据
   */
  public setLoading(loading: boolean) {
    this._loading = loading
    if (this._loading === true) {
      this._el.classList.add('ph-btn-loading')
      this._el.innerHTML = this._loadingIcon.toString() + '<span>加载中……</span>'
    } else {
      this._initText()
    }
  }

  /**
   *
   * @param eventName 事件名称, addEventListener 函数第一个参数
   * @param fn 事件处理器
   */
  public on(eventName: string, fn: (e: Event) => void) {
    this._el.addEventListener(eventName, (e: Event) => {
      if (e.type !== 'click' || !this._loading) {
        fn(e)
      } else {
        fn(e)
      }
    })
  }

  public html() {
    return this._el.outerHTML
  }

  public addInnerHTML(htmlstr: string) {
    this._el.innerHTML += htmlstr
  }

  public toString() {
    return this._el.outerHTML
  }

  public node() {
    return this._el
  }

  public get disabled() {
    return this._el.disabled
  }

  public set disabled(disabeld: boolean) {
    this._el.disabled = disabeld
  }

  private _initText() {
    let _text = this._config.text || ''
    if (this._config.icon != null) {
      _text = this._config.icon.toString() + _text
    }
    this._el.innerHTML = _text
  }

  private _render() {
    let clazz = ['ph-btn']
    if (this._config.type != null) {
      clazz.push('ph-btn-' + this._config.type)
    }
    if (this._config.round) {
      clazz.push('ph-btn-round')
    }
    if (this._config.circle) {
      clazz.push('ph-btn-circle')
    }
    if (this._config.block) {
      clazz.push('ph-btn-block')
    }
    if (!isBlank(this._config.class)) {
      clazz.push(this._config.class as string)
    }
    clazz.push(this._el.className)
    this._el.className = clazz.join(' ').trim()
    this._initText()
    if (this._config.attrs != null) {
      // eslint-disable-next-line
      for (let key in this._config.attrs) {
        let keyValue = this._config.attrs[key]
        if (key === 'disabled') {
          // 设置按钮的禁用/启用状态
          if (isBlank(keyValue) || keyValue === '0' || keyValue === 'false' || keyValue === 'none') {
            this._el.disabled = false
          } else {
            this._el.disabled = true
          }
        }
        this._el.setAttribute(key, this._config.attrs[key])
      }
    }
  }
}

export default Button
