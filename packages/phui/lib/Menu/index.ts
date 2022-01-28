import './index.css'
import { elem, on, removeClass, addClass, iterate } from 'ph-utils/lib/dom'
import SingleIcon from '../Icon/Single'
import Icon from '../Icon'
import Component from '../utils/Component'
import ArrayDownIcon from '../Icon/ArrowDown'

interface MenuIntf {
  index?: string
  icon?: string | Icon | { prefix: string; icon: string }
  text: string
  childrens?: MenuIntf[]
}

interface MenuConfig {
  /** 默认激活的菜单，填写配置的菜单的 index */
  defaultActive?: string
  /** 水平菜单、垂直菜单 */
  orientation?: 'horizontal' | 'vertical'
  /** 主题，默认提供light(明亮主题)、dark(暗黑主题) */
  theme?: string
}

class Menu extends Component<HTMLUListElement> {
  public menus: MenuIntf[]
  /** 当前激活的菜单项 */
  public active: string
  private _config: Required<MenuConfig>
  /** 是否是由鼠标悬浮展开的菜单 */
  private _isMouse: boolean
  private _selectFn: (index: string) => void

  public constructor(el: string | HTMLElement, menus: MenuIntf[], config?: MenuConfig) {
    super(el, 'ul')
    this._config = { defaultActive: '', orientation: 'vertical', theme: 'light', ...(config || {}) }
    this.active = ''
    this.menus = menus
    this.el.className = [`ph-menu ph-menu--${this._config.orientation}`, this.el.className].join(' ').trim()
    this.el.setAttribute('ph-menu-index', '__stop__')
    this.el.innerHTML = this._render(menus)
    this.setTheme(this._config.theme)
    this._setActive(this._config.defaultActive)
    this._isMouse = false
    this._selectFn = () => {}
    this._event()
  }

  /**
   * 设置主题，可以是内置的 dark，也可以自定义的主题，然后可以通过 .ph-menu-主题名称 修改主题样式
   * @param theme 主题名称
   */
  public setTheme(theme: string) {
    addClass(this.el, `ph-menu-${theme}`)
    let $menus = elem('.ph-menu', this.el)
    for (let i = 0, len = $menus.length; i < len; i++) {
      addClass($menus[i], `ph-menu-${theme}`)
    }
  }

  /**
   * 折叠所有的子菜单
   */
  public foldAllSubMenus() {
    this._foldMenus(elem('.ph-menu-opened', this.el) as HTMLElement[])
  }

  /**
   * 菜单激活回调， 回调函数参数：index -  选中菜单项的 index
   * @param selectFn
   */
  public onSelect(selectFn: (index: string) => void) {
    this._selectFn = selectFn
  }

  /**
   * 设置当前激活的菜单项
   * @param active 激活的菜单项的 index
   */
  private _setActive(index: string) {
    this.active = index
    let $activeItem = elem(`li[ph-menu-index="${index}"]`, this.el)[0]
    if ($activeItem != null) {
      let $subMenu = elem('.ph-menu', $activeItem)[0]
      // 激活的是菜单项
      if ($subMenu == null) {
        $activeItem.classList.add('ph-menu-active')
      } else {
        $activeItem.classList.add('ph-menu-opened', 'ph-submenu-active')
        $subMenu.style.display = 'block'
      }
      let iIndex
      let iMenu = $activeItem
      do {
        iMenu = iMenu.parentNode as HTMLElement
        iIndex = iMenu.getAttribute('ph-menu-index')
        if (iIndex != null && iIndex !== '' && iIndex !== '__stop__') {
          iMenu.classList.add('ph-menu-opened', 'ph-submenu-active')
          let $openMenu = elem('.ph-menu', iMenu)[0]
          if ($openMenu != null) {
            $openMenu.style.display = 'block'
          }
        }
      } while (iIndex !== '__stop__')
    }
  }

  private _icon(iconName?: string | Icon | { prefix: string; icon: string }) {
    if (iconName == null) {
      return ''
    } else {
      let iconstr = ''
      if (typeof iconName === 'string') {
        iconstr = new SingleIcon('', { icon: iconName }).toString()
      } else if (iconName instanceof Icon) {
        iconstr = iconName.toString()
      } else {
        iconstr = new SingleIcon('', { icon: iconName.icon, prefix: iconName.prefix }).toString()
      }
      iconstr = `<i class="ph-menu-icon-wrap">${iconstr}</i>`
      return iconstr
    }
  }

  private _render(menus: MenuIntf[]): string {
    let htmlstr = []
    for (let i = 0, len = menus.length; i < len; i++) {
      let menu = menus[i]
      let iconstr = this._icon(menu.icon)
      let index = menu.index || i
      if (menu.childrens != null && menu.childrens.length > 0) {
        htmlstr.push(`<li class="ph-submenu" ph-menu-index="${index}">`)
        let arrayIcon = new ArrayDownIcon('', { class: 'ph-submenu-arrow-icon' }).toString()
        let submenuC = `${iconstr}<span>${menu.text}</span>${arrayIcon}`
        htmlstr.push(`<div class="ph-menu-submenu-title">${submenuC}</div>`)
        htmlstr.push(`<ul class="ph-menu" style="display:none;">${this._render(menu.childrens)}</ul>`)
        htmlstr.push('</li>')
      } else {
        htmlstr.push(`<li class="ph-menu-item" ph-menu-index="${index}">${iconstr}<span>${menu.text}</span></li>`)
      }
    }
    return htmlstr.join('')
  }

  private _foldMenu(oepnMenuEL: HTMLElement) {
    let $openSub = elem('.ph-menu', oepnMenuEL)[0]
    let rectHeight = $openSub.getBoundingClientRect().height
    $openSub.style.height = `${rectHeight}px`
    setTimeout(() => {
      $openSub.style.height = '0px'
      removeClass(oepnMenuEL, 'ph-menu-opened')
    }, 0)
  }

  private _foldMenus(openMenuEls: HTMLElement[]) {
    for (let i = 0, len = openMenuEls.length; i < len; i++) {
      this._foldMenu(openMenuEls[i])
    }
  }

  private _spreadMenu(foldMenuEL: HTMLElement) {
    let $subMenu = elem('.ph-menu', foldMenuEL)[0]
    // 计算折叠菜单的高度
    let $tmp = document.createElement('div')
    $tmp.style.cssText = 'position:fixed;left:-1000px;top:-1000px;opacity:0;'
    $tmp.innerHTML = `<ul class="ph-menu">${$subMenu.innerHTML}</ul>`
    this.el.appendChild($tmp)
    let rectHeight = elem('.ph-menu', $tmp)[0].getBoundingClientRect().height
    this.el.removeChild($tmp)

    $subMenu.style.height = '0px'
    $subMenu.style.display = 'block'
    addClass(foldMenuEL, 'ph-menu-opened')
    setTimeout(() => {
      $subMenu.style.height = `${rectHeight}px`
    }, 0)
  }

  // 清楚之前的所有的激活的子菜单，在激活直接菜单项的时候调用
  private _clearActiveSubmenus() {
    let $activeSubmenus = elem('.ph-submenu-active', this.el)
    iterate($activeSubmenus, (activeSubmenu) => {
      // 清楚未展开的子菜单激活状态
      if (!activeSubmenu.classList.contains('ph-menu-opened')) {
        activeSubmenu.classList.remove('ph-submenu-active')
      }
    })
  }

  // 激活子菜单时候，同时激活其所有的父级菜单
  private _activeSubmenus(activeMenu: HTMLElement) {
    let iIndex
    let iMenu = activeMenu
    do {
      iMenu = iMenu.parentNode as HTMLElement
      iIndex = iMenu.getAttribute('ph-menu-index')
      if (iIndex != null && iIndex !== '' && iIndex !== '__stop__') {
        if (!iMenu.classList.contains('ph-submenu-active')) {
          iMenu.classList.add('ph-submenu-active')
        }
      }
    } while (iIndex !== '__stop__')
  }

  private _event() {
    on(this.el, 'transitionend', (e) => {
      let $target = e.target as HTMLElement
      let $parent = $target.parentNode as HTMLElement
      if ($target.classList.contains('ph-menu') && $parent.getAttribute('ph-menu-index') !== '__stop__') {
        let rectHeight = $target.getBoundingClientRect().height
        if (rectHeight < 10) {
          // 折叠菜单
          $target.style.display = 'none'
        }
      }
    })
    // 为水平方向所有的子菜单添加鼠标事件
    let $hsubs = elem('.ph-menu--horizontal>.ph-submenu', this.el)
    iterate($hsubs, (hsub) => {
      on(hsub, 'mouseenter', (e) => {
        this._isMouse = true
        this._spreadMenu(e.target as HTMLElement)
      })
      on(hsub, 'mouseleave', (e) => {
        this._isMouse = false
        this._foldMenu(e.target as HTMLElement)
      })
    })
    on(
      this.el,
      'click',
      (_e, target, index) => {
        if (target != null && index != null) {
          let $sub = elem('.ph-menu', target)[0]
          // 激活菜单
          if ($sub == null) {
            let parentIndex = (target.parentNode as HTMLElement).getAttribute('ph-menu-index')
            this._clearActiveSubmenus() // 清楚之前激活的子菜单
            // 激活的是直接菜单项，则折叠所有已经展开的子菜单项
            if (parentIndex === '__stop__') {
              // 折叠展开的菜单
              this._foldMenus(elem('.ph-menu-opened', this.el) as HTMLElement[])
            } else {
              this._activeSubmenus(target) // 激活子菜单
            }
            // 清楚之前的激活项
            removeClass(elem('.ph-menu-active', this.el)[0], 'ph-menu-active')
            addClass(target, 'ph-menu-active')
            this._selectFn(index)
          } else {
            // 展开/折叠菜单
            if (target.classList.contains('ph-menu-opened')) {
              // 如果不是鼠标悬浮展开的菜单，则折叠菜单
              if (!this._isMouse) {
                this._foldMenu(target)
              }
            } else {
              // 点击的是折叠的菜单，则先折叠之前展开的菜单，同时展开当前的菜单
              this._foldMenus(elem('.ph-menu-opened', this.el) as HTMLElement[])
              this._spreadMenu(target) // 展开菜单
            }
          }
        }
      },
      { eventFlag: 'ph-menu-index' },
    )
  }
}

export default Menu
