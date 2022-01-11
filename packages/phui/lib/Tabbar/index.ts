import './index.css'
import { elem, on } from 'ph-utils/lib/dom'
import Icon from '../Icon'
import SingleIcon from '../Icon/Single'

/** 选项卡item */
interface TabbarItem {
  /** name 为点击时触发相应事件 */
  name: string
  /** text 为显示的文本 */
  text: string
  /** 配置图标 */
  icon?: Icon | string | { prefix: string; name?: string; icon?: string }
}

interface TabbarConfig {
  /** 风格类型, nav(默认) - 底部导航栏模式, buttons - 按钮组模式 */
  type?: 'nav' | 'buttons'
  /** 配置选项卡, name 为点击时触发相应事件，text 为显示的文本 */
  tabs: TabbarItem[]
  /** 当前活动项的 tab name，默认为第一项的 name */
  current?: string
}

class Tabbar {
  private _el: HTMLElement
  private _config: TabbarConfig
  private _change: (name: string) => void

  /**
   * 构建选项卡
   * @param el 选择器或者节点
   * @param config 配置项
   */
  public constructor(el: string | HTMLElement, config: TabbarItem | TabbarConfig) {
    this._el = typeof el === 'string' ? elem(el)[0] : el
    if (config instanceof Array) {
      this._config = { type: 'nav', tabs: config }
    } else {
      this._config = { type: 'nav', ...(config as TabbarConfig) }
    }
    if (this._config.current == null) {
      this._config.current = this._config.tabs[0].name
    }
    this._change = () => {}
    this._render()
    on(
      this._el,
      'click',
      (_e: Event, _target?: HTMLElement, flag?: string) => {
        if (flag != null && flag !== this._config.current) {
          this.current = flag
          this._change(flag)
        }
      },
      { eventFlag: 'phtabbar-event-flag' },
    )
  }

  /**
   * 选项卡切换改变事件
   * @param changeEvent 选项卡切换时的回调函数
   */
  public change(changeEvent: (name: string) => void) {
    this._change = changeEvent
  }

  /**
   * 设置当前选项卡
   * @param current
   */
  public set current(current: string) {
    this._config.current = current
    elem('.ph-tabbar-item--active', this._el)[0].classList.remove('ph-tabbar-item--active')
    elem(`div[phtabbar-event-flag="${current}"]`, this._el)[0].classList.add('ph-tabbar-item--active')
  }

  /**
   * 获取当前选项卡
   */
  public get current() {
    return this._config.current || ''
  }

  private _render() {
    this._el.setAttribute('phtabbar-event-flag', '__stop__')
    this._el.className = ['ph-tabbar', 'ph-tabbar-' + this._config.type, this._el.className].join(' ').trim()
    let fragment = document.createDocumentFragment()
    for (let tabitem of this._config.tabs) {
      let $tab = document.createElement('div')
      $tab.setAttribute('phtabbar-event-flag', tabitem.name)
      $tab.className = ['ph-tabbar-item', this._config.current === tabitem.name ? 'ph-tabbar-item--active' : '']
        .join(' ')
        .trim()
      if (tabitem.icon != null) {
        if (tabitem.icon instanceof Icon) {
          $tab.innerHTML = tabitem.icon.toString()
        } else if (typeof tabitem.icon === 'string') {
          $tab.innerHTML = new SingleIcon('', { icon: tabitem.icon }).toString()
        } else {
          $tab.innerHTML = new SingleIcon('', {
            prefix: tabitem.icon.prefix,
            icon: tabitem.icon.name || tabitem.icon.icon,
          }).toString()
        }
      }
      $tab.innerHTML += `<span>${tabitem.text}</span>`
      fragment.appendChild($tab)
    }
    this._el.appendChild(fragment)
  }
}

export default Tabbar
