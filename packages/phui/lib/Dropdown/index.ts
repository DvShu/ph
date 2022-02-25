import Component from '../utils/Component'
import ArrowDown from '../Icon/ArrowDown'
import './index.css'
import { on, addClass, removeClass, elem, attr, hasClass } from 'ph-utils/lib/dom'
import { isBlank } from 'ph-utils/lib/index_m'
import { queryHideNodeRect } from '../utils'

interface DropdownConfig {
  menus: (string | { name?: string; text: string })[]
  position?: 'left' | 'right'
}

class Dropdown extends Component<HTMLDivElement> {
  private _config: Required<DropdownConfig>
  private _fn: (i: number, name: string) => void
  public constructor(el: string | HTMLDivElement, config: DropdownConfig) {
    super(el)
    this._fn = () => {}
    this._config = { position: 'right', ...config }
    this._render()
    this._event()
  }

  public click(fn: (i: number, name: string) => void) {
    this._fn = fn
  }

  /**
   * 展开菜单
   */
  public spreadMenu() {
    let $menu = elem('.ph-dropdown-menu', this.el)[0]
    let height: string | number = attr($menu, 'node-height')
    if (isBlank(height)) {
      let $tmpMenu = $menu.cloneNode(true) as HTMLElement
      $tmpMenu.style.display = 'block'
      height = queryHideNodeRect($tmpMenu).height
      attr($menu, 'node-height', String(height))
    }
    $menu.style.cssText = 'height:0px;display:block'
    requestAnimationFrame(() => {
      addClass(this.el, 'ph-dropdown-active')
      $menu.style.height = `${height}px`
    })
  }

  /**
   * 折叠菜单
   */
  public foldMenu() {
    let $menu = elem('.ph-dropdown-menu', this.el)[0]
    removeClass(this.el, 'ph-dropdown-active')
    $menu.style.height = `0px`
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
      this.spreadMenu()
    })
    on(this.el, 'mouseleave', () => {
      this.foldMenu()
    })
    on(this.el, 'transitionend', () => {
      if (!hasClass(this.el, 'ph-dropdown-active')) {
        elem('.ph-dropdown-menu', this.el)[0].style.display = 'none'
      }
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
