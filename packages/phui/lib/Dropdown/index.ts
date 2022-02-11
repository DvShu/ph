import Component from '../utils/Component'
import ArrowDown from '../Icon/ArrowDown'
import './index.css'
import { on, addClass, removeClass } from 'ph-utils/lib/dom'

interface DropdownConfig {
  menus: (string | { name?: string; text: string })[]
  position?: 'left' | 'right'
}

class Dropdown extends Component<HTMLDivElement> {
  private _config: Required<DropdownConfig>
  private _t: number
  private _fn: (i: number, name: string) => void
  public constructor(el: string | HTMLDivElement, config: DropdownConfig) {
    super(el)
    this._t = -1
    this._fn = () => {}
    this._config = { position: 'right', ...config }
    this._render()
    this._event()
  }

  public click(fn: (i: number, name: string) => void) {
    this._fn = fn
  }

  private _render() {
    this.el.className = ['ph-dropdown', this.el.className].join(' ').trim()
    let childrens = [this.el.innerHTML, new ArrowDown('', { class: 'ph-dropdown-arrow-icon' }).toString()]
    childrens.push(`<ul class="ph-dropdown-menu ph-dropdown-menu--${this._config.position}">`)
    for (let i = 0, len = this._config.menus.length; i < len; i++) {
      let m = this._config.menus[i]
      let name = '-'
      let text = m
      if (typeof m !== 'string') {
        text = m.text
        if (m.name != null) {
          name = m.name
        }
      }
      childrens.push(`<li ph-dropdown-name="${name}" ph-dropdown-index="${i}">${text}</li>`)
    }
    childrens.push('</ul>')
    this.el.innerHTML = childrens.join('')
  }

  private _event() {
    on(this.el, 'mouseenter', () => {
      clearTimeout(this._t)
      addClass(this.el, 'ph-dropdown-active')
    })
    on(this.el, 'mouseleave', () => {
      this._t = setTimeout(() => {
        removeClass(this.el, 'ph-dropdown-active')
      }, 150)
    })
    on(
      this.el,
      'click',
      (_e, target, flag) => {
        if (flag != null && target != null) {
          let menuIndex = target.getAttribute('ph-dropdown-index')
          this._fn(Number(menuIndex), flag)
        }
      },
      { eventFlag: 'ph-dropdown-name' },
    )
  }
}

export default Dropdown
