import './index.css'
import CloseIcon from '../Icon/Close'
import Button from '../Button'
import { elem, on } from 'ph-utils/lib/dom'
import LoadingIcon from '../Icon/Loading'

interface ModalConfig {
  /** 模态框类型，0表示信息框，1表示加载层 */
  type?: number
  /** 控制遮罩展现，是否显示遮罩 */
  shade?: boolean
  /** 是否点击遮罩时关闭层 */
  shadeClose?: boolean
  /** 标题 */
  title?: string | null
  /** 自定义一个css类 */
  class?: string | null
  /** 模态框内容 */
  content: string
  /** 配置按钮, true 则同时显示取消和确认按钮，{ key: 按钮的唯一标记，用于精准匹配事件, 最好不要为 close、cancel、confirm 避免和内置事件冲突 } */
  btn?: boolean | 'confirm' | { class?: string; text: string; key: string }[]
  /** 右上角关闭按钮, 1 - 在框内， 2 - 在框角 */
  closeBtn?: boolean | number
  /** 是否在 Dialog 出现时将 body 滚动锁定 */
  lockScroll?: boolean
}

let index = 0

class Modal {
  public id: number
  private _config: Required<ModalConfig>
  private _fn: (key: string) => any
  private _beforeCloseFn: () => any

  public constructor(config: ModalConfig) {
    this._fn = () => {}
    this._beforeCloseFn = () => {}
    this.id = index
    index += 2
    this._config = {
      type: 0,
      shade: true,
      shadeClose: true,
      closeBtn: 1,
      title: null,
      class: null,
      lockScroll: true,
      btn: true,
      ...config,
    }
    this._render()
    this._event()
  }

  public close() {
    if (this._beforeCloseFn() !== false) {
      let $shade = elem('#ph-shade' + this.id)[0]
      $shade.innerHTML = ''
      document.body.removeChild($shade)
      let $box = elem('#ph-modal' + this.id)[0]
      $box.innerHTML = ''
      document.body.removeChild($box)
      document.body.classList.add('ph-lock-scroll')
    }
  }

  public event(fn: (key: string) => void) {
    this._fn = fn
  }

  public beforeClose(fn: () => any) {
    this._beforeCloseFn = fn
  }

  private _render() {
    let fragment = document.createDocumentFragment()
    // 添加遮罩层
    if (this._config.shade) {
      let $shade = document.createElement('div')
      $shade.className = 'ph-shade'
      $shade.style.zIndex = String(500 + this.id)
      $shade.id = 'ph-shade' + this.id
      fragment.appendChild($shade)
    }
    let box = document.createElement('div')
    box.className = `ph-modal ph-modal${this._config.type}`
    box.id = 'ph-modal' + this.id
    box.style.zIndex = String(501 + this.id)

    let htmlstr = []
    htmlstr.push(
      `<div ph-modal-btn="modalMain" class="ph-modal-main ph-anim-scale${
        this._config.class != null ? ' ' + this._config.class : ''
      }">`,
    )
    // 渲染标题区域
    if (this._config.title != null) {
      htmlstr.push(`<div class="ph-modal-header"><span class="ph-modal-title">${this._config.title}</span></div>`)
    }
    if (
      (this._config.closeBtn === true || this._config.closeBtn === 1 || this._config.closeBtn === 2) &&
      this._config.type !== 1
    ) {
      let closeClass = 'modal-close-btn' + (this._config.closeBtn === 2 ? 2 : 1)
      // 显示右上角关闭按钮
      let closeBtn = new Button('', {
        icon: new CloseIcon(''),
        class: `modal-close-btn ${closeClass}`,
        circle: true,
        attrs: { 'ph-modal-btn': 'close' },
      })
      htmlstr.push(closeBtn.toString())
    }
    let containerClass = ''
    let content = this._config.content
    if (this._config.type === 1) {
      containerClass = ' modal-loading-container'
      let loadingHtml = new LoadingIcon('', { class: 'modal-loading-icon' }).toString()
      content = loadingHtml + '<p class="modal-loading-text">' + content + '</p>'
    }
    htmlstr.push(`<div class="ph-modal-container${containerClass}">${content}</div>`)
    // 渲染底部按钮区域
    if (this._config.btn != null && this._config.btn && this._config.type !== 1) {
      htmlstr.push('<div class="ph-modal-footer">')
      if (typeof this._config.btn === 'boolean') {
        htmlstr.push(new Button('', { text: '取消', attrs: { 'ph-modal-btn': 'cancel' } }).html())
        htmlstr.push(new Button('', { type: 'primary', text: '确定', attrs: { 'ph-modal-btn': 'confirm' } }).html())
      } else if (this._config.btn === 'confirm') {
        htmlstr.push(new Button('', { type: 'primary', text: '确定', attrs: { 'ph-modal-btn': 'confirm' } }).html())
      } else {
        for (let bc of this._config.btn) {
          let attrs: any = {}
          if (bc.key) {
            attrs['ph-modal-btn'] = bc.key
          }
          htmlstr.push(new Button('', { text: bc.text, class: bc.class, attrs }))
        }
      }
      htmlstr.push('</div>')
    }
    htmlstr.push('</div>')
    box.innerHTML = htmlstr.join('')
    fragment.appendChild(box)
    document.body.appendChild(fragment)
    if (this._config.lockScroll) {
      document.body.classList.add('ph-lock-scroll')
    }
  }

  private _event() {
    // 配置按钮事件
    on(
      elem(`#ph-modal${this.id}`)[0],
      'click',
      (_event, _target, flag) => {
        if (flag === 'confirm') {
          this._fn(flag)
        } else if (flag === 'cancel' || flag === 'close') {
          if (this._fn(flag) !== false) {
            this.close()
          }
        } else if (flag === '__stop__') {
          if (this._config.shade && this._config.shadeClose) {
            this.close()
          }
        } else if (flag !== 'modalMain' && flag != null) {
          this._fn(flag)
        }
      },
      { eventFlag: 'ph-modal-btn', eventStop: true },
    )
  }
}

export default Modal
