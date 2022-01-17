import './index.css'
import InfoIcon from '../Icon/Info'
import ErrorIcon from '../Icon/Error'
import SuccessIcon from '../Icon/Success'
import WarnIcon from '../Icon/Warn'

const messageTypes = ['info', 'success', 'error', 'warning']
const instances: HTMLDivElement[] = []
let seed = 0

interface MessageConfig {
  class?: string
  type?: string
  duration?: number
  /** 显示的消息 */
  message?: string
}

interface MessageInstance {
  info: (msg: string | MessageConfig) => void
  success: (msg: string | MessageConfig) => void
  warn: (msg: string | MessageConfig) => void
  /**
   * 显示错误信息
   * @property msg: string 错误信息
   * @property customClass: string 自定义的 class
   */
  error: (msg: string | MessageConfig) => void
  (options: string | MessageConfig): void
  [index: string]: any
}

function close(id: string) {
  let idx = instances.findIndex((n) => n.id === id)
  if (idx === -1) return
  // 从消息列表中，移除消息
  let removeM = instances.splice(idx, 1)[0]
  if (!removeM) return

  const len = instances.length
  if (len > 0) {
    let removedHeight = removeM.offsetHeight
    // 消息移除后，重新构建后续消息的 top
    for (let i = idx; i < len; i++) {
      const offset = parseInt(instances[i].style['top'], 10) - removedHeight - 15
      instances[i].style.top = offset + 'px'
    }
  }

  document.body.removeChild(removeM)
}

/**
 * 显示消息提示信息
 */
const MessageInst: MessageInstance = ((options: string | MessageConfig) => {
  let opts: MessageConfig = {}
  if (typeof options === 'string') {
    opts = { message: options }
  } else {
    opts = { ...(options || {}) }
  }
  let msg = new Message(opts.message || '', opts)
  setTimeout(() => {
    msg.close(close)
  }, opts.duration || 3000)
}) as any

messageTypes.forEach((type) => {
  MessageInst[type] = (options: string | MessageConfig) => {
    let opts: MessageConfig = typeof options === 'string' ? { message: options } : options
    opts.type = type
    MessageInst(opts)
  }
})

class Message {
  public id: string
  public el: HTMLDivElement
  private _config: MessageConfig

  public constructor(text: string, config?: MessageConfig) {
    this._config = { ...(config || {}) }
    // 构建一个新的节点用来渲染提示信息，因为每一次的提示信息都是不一样的
    let container = document.createElement('div')

    // offset
    let offset = 15
    for (let instance of instances) {
      offset += instance.offsetHeight + 15
    }

    this.id = `message${seed++}`
    container.id = this.id
    container.style.top = offset + 'px'

    let classes = ['ph-message ph-message-fade-anim']
    if (this._config.type != null) {
      classes.push(`ph-message-${this._config.type}`)
    }
    if (this._config.class != null) {
      classes.push(this._config.class)
    }

    container.className = classes.join(' ')
    let icon = ''
    if (this._config.type === 'warn') {
      icon = new WarnIcon('', { class: 'ph-message-icon' }).toString()
    } else if (this._config.type === 'error') {
      icon = new ErrorIcon('', { class: 'ph-message-icon' }).toString()
    } else if (this._config.type === 'success') {
      icon = new SuccessIcon('', { class: 'ph-message-icon' }).toString()
    } else {
      icon = new InfoIcon('', { class: 'ph-message-icon' }).toString()
    }
    container.innerHTML = `${icon}<span class="ph-message-content">${text}</span>`
    this.el = container
    instances.push(container)

    document.body.appendChild(container)
    // 显示进入时的动画
    requestAnimationFrame(() => {
      container.classList.remove('ph-message-fade-anim')
    })
  }

  public close(fn: (id: string) => void) {
    this.el.addEventListener(
      'transitionend',
      () => {
        fn(this.id)
      },
      { once: true },
    )
    this.el.classList.add('ph-message-fade-anim')
  }
}

let win = window as any
win.$message = MessageInst

export default MessageInst
