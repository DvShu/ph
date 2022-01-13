import './index.css'
import CloseIcon from '../Icon/Close'
import Button from '../Button'
import { elem } from 'ph-utils/lib/dom'

interface ModalConfig {
  /** 模态框类型，0表示信息框，1表示页面层，2表示加载层 */
  type?: number
  /** 控制遮罩展现，是否显示遮罩，并且定义遮罩风格 */
  shade?: boolean | string
  /** 是否点击遮罩时关闭层 */
  shadeClose?: boolean
  /** 动画类型，scale（默认）、up（从下往上弹出） */
  anim?: 'scale' | 'up'
  /** 标题 */
  title?: string | null
  /** 自定义一个css类 */
  className?: string | null
  /** 模态框内容 */
  content: string
  btn?: boolean | 'yes' | { className?: string; text: string; click?: (e: Event) => void }[]
}

let index = 0

class Modal {
  private _config: Required<ModalConfig>
  private _id: number

  public constructor(config: ModalConfig) {
    this._id = index
    index += 2
    this._config = {
      type: 0,
      shade: true,
      shadeClose: true,
      anim: 'scale',
      title: null,
      className: null,
      btn: true,
      ...config,
    }
    this._render()
  }

  private _render() {
    let fragment = document.createDocumentFragment()
    // 添加遮罩层
    if (this._config.shade) {
      let $shade = document.createElement('div')
      $shade.className = 'ph-shade'
      $shade.style.zIndex = String(500 + this._id)
      $shade.id = 'ph-shade' + this._id
      fragment.appendChild($shade)
    }
    let box = document.createElement('div')
    box.className = `ph-modal ph-modal${this._config.type}`
    box.id = 'ph-modal' + this._id
    box.style.zIndex = String(501 + this._id)

    let htmlstr = []
    htmlstr.push(
      `<div class="ph-modal-main ph-anim-scale${this._config.className != null ? ' ' + this._config.className : ''}">`,
    )
    // 渲染标题区域
    if (this._config.title != null) {
      let iconstr = new CloseIcon('', { class: 'modal-close-btn' }).toString()
      htmlstr.push(
        `<div class="ph-modal-header"><span class="ph-modal-title">${this._config.title}</span>${iconstr}</div>`,
      )
    }
    htmlstr.push(`<div class="ph-modal-container">${this._config.content}</div>`)
    // 渲染底部按钮区域
    if (this._config.btn != null && this._config.btn) {
      htmlstr.push('<div class="ph-modal-footer">')
      if (typeof this._config.btn === 'boolean') {
        htmlstr.push(new Button('', { text: '取消', attrs: { 'ph-modal-btn': 'no' } }).html())
        htmlstr.push(new Button('', { type: 'primary', text: '确定', attrs: { 'ph-modal-btn': 'yes' } }).html())
      } else if (this._config.btn === 'yes') {
        htmlstr.push(new Button('', { type: 'primary', text: '确定', attrs: { 'ph-modal-btn': 'yes' } }).html())
      } else {
        for (let bc of this._config.btn) {
          htmlstr.push(new Button('', { text: bc.text, class: bc.className }))
        }
      }
      htmlstr.push('</div>')
    }
    htmlstr.push('</div>')
    box.innerHTML = htmlstr.join('')
    fragment.appendChild(box)
    document.body.appendChild(fragment)
    document.body.classList.add('ph-overhidden')
  }
}

export default Modal
