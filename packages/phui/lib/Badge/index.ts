import './index.css'
import Component from '../utils/Component'

interface BadgeConfig {
  /** 最大值，超过最大值会显示 '{max}+'， 仅当 value 是 Number 类型生效 */
  max?: number
  type?: 'error' | 'primary' | 'warn' | 'success' | 'info'
  /** 是否是小圆点模式 */
  isDot?: boolean
}

export default class Badge extends Component<HTMLSpanElement> {
  private _value: number | string
  private _config: BadgeConfig

  public constructor(el: string | HTMLElement, config?: BadgeConfig) {
    super(el, 'span')
    this._config = { type: 'error', isDot: false, ...(config || {}) }
    let clazz = ['ph-badge-content', this._config.isDot ? 'ph-badge-dot' : '', this.el.className]
    this.el.className = clazz.join(' ').trim()
    this.el.style.backgroundColor = `var(--ph-${this._config.type}-color)`
    if (this._config.isDot) {
      this.el.innerHTML = ''
    }
    this._value = this.el.textContent || ''
  }

  public get value() {
    return this._value
  }

  public set value(val: number | string) {
    this._value = val
    if (!this._config.isDot) {
      if (typeof val === 'number' && this._config.max != null && val > this._config.max) {
        this.el.textContent = `${this._config.max}+`
      } else {
        this.el.textContent = String(val)
      }
    }
  }
}
