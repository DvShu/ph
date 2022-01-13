import './index.css'
import { elem, on } from 'ph-utils/lib/dom'
import { queryElem } from '../utils'

interface SwitchConfig {
  /** 开关尺寸，默认：30 */
  size?: number
  /** 开关切换时触发的事件 */
  change?: (val: boolean) => void
}

class Switch {
  private _el: HTMLElement
  private _config: SwitchConfig
  private _val: boolean

  public constructor(el: string | HTMLElement, config?: SwitchConfig) {
    this._el = queryElem(el)
    this._config = { ...(config || {}) }
    this._val = false
    this._render()
    on(this._el, 'click', () => {
      this._val = !this._val
      this._el.classList.toggle('ph-switch--on')
      if (this._config.change != null) {
        this._config.change(this._val)
      }
    })
  }

  /** 获取组件的 HTML 字符串 */
  public html() {
    return this._el.outerHTML
  }

  public node() {
    return this._el
  }

  public change(fn: (val: boolean) => void) {
    this._config.change = fn
  }

  public get value() {
    return this._val
  }

  public set value(val: boolean) {
    this._val = val
    this._el.classList.toggle('ph-switch--on')
  }

  private _render() {
    if (this._config.size != null) {
      this._el.style.fontSize = this._config.size + 'px'
    }

    let classes = 'ph-switch'
    this._el.className = classes + ' ' + this._el.className
    this._el.innerHTML = '<div class="ph-switch-action"></div>'
  }
}

export default Switch
