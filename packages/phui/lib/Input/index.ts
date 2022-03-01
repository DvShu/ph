import './index.css'

import { elem } from 'ph-utils/lib/dom'
import { isBlank } from 'ph-utils/lib/index_m'

/** 验证规则 */
interface ValidRule {
  /** 验证的规则，如果是字符串，则为 required(必填)、equals(相等，一般用于确认密码) */
  reg: string | RegExp
  /** 错误提示信息，其中 required 默认为：请填写{name}，equals 默认为：两次输入不一致 */
  errmsg?: string
  /** 如果 reg: equals 时，填写此字段，用于验证比较的节点 */
  equalsElem?: string | HTMLInputElement
}

interface InputConfig {
  /** 外部容器的 class */
  class?: string
  /** 内部 input 框的 class */
  inputClass?: string
  /** input 的 type 属性 */
  htmlType?: string
  /** input 的 name 属性 */
  name?: string
  /** input 的 placeholder 属性 */
  placeholder?: string
  value?: string
  /** 进行数据验证的方式, change - 输入改变时验证, blur - 失去焦点时验证 */
  trigger?: string
  /** 数据验证的规则 */
  rules?: ValidRule[]
}

class Input {
  /** 是否错误数据 */
  public isError: boolean
  private el: HTMLElement
  private input: HTMLInputElement
  private errorTip: HTMLParagraphElement
  private rules: ValidRule[]

  /**
   *
   * @param el input 节点
   * @param config 配置项
   */
  public constructor(el: string | HTMLElement, config?: InputConfig) {
    let $el = el as HTMLElement
    if (typeof el === 'string') {
      $el = elem(el)[0]
    }
    this.el = null as any
    this.input = null as any
    this.errorTip = null as any
    this.rules = []
    this.isError = false
    this._render($el, { trigger: 'change', rules: [], ...(config || {}) })
  }

  /**
   * 获取 input 的 value 值
   */
  public get value() {
    return this.input.value
  }

  /**
   * 设置 value 值
   */
  public set value(v: string) {
    this.input.value = v
  }

  public get name() {
    return this.input.name
  }

  public set name(n: string) {
    this.input.name = n
  }

  /**
   * 获取 input 的 name 和 value
   * @returns 0 - input name 属性, 1 - input value 属性
   */
  public nameValue() {
    return [this.input.name || 'name', this.input.value]
  }

  /**
   * 设置 input 输入框的属性，例如：(id, name, value, placeholder……)
   * @param key
   * @param value
   */
  public set(key: string, value: string) {
    this.input.setAttribute(key, value)
  }

  public valid() {
    this._valid(this.input.value)
    return this.isError
  }

  /**
   * 设置错误提示信息
   * @param errmsg 错误提示信息；如果不传该参数则表明移除错误提示
   */
  public setError(errmsg?: string) {
    if (errmsg == null) {
      this.el.classList.remove('ph-input-error')
      this.errorTip.textContent = ''
      this.isError = false
    } else {
      this.el.classList.add('ph-input-error')
      this.errorTip.textContent = errmsg
      this.isError = true
    }
  }

  private _createInput(inputElem: HTMLInputElement, config: InputConfig) {
    let classes = []
    classes = ['ph-input']
    if (!isBlank(inputElem.className)) {
      classes.push(inputElem.className)
    }
    if (!isBlank(config.inputClass)) {
      classes.push(config.inputClass as string)
    }
    inputElem.className = classes.join(' ')
    if (!isBlank(config.htmlType)) {
      inputElem.type = config.htmlType as string
    }
    if (!isBlank(config.name)) {
      inputElem.name = config.name as string
    }
    if (!isBlank(config.placeholder)) {
      inputElem.placeholder = config.placeholder as string
    }
    if (!isBlank(config.value)) {
      inputElem.value = config.value as string
    }
  }

  private _render(iel: HTMLElement, config: InputConfig) {
    this.rules = config.rules as any
    let $wrapper = iel
    this.input = document.createElement('input')
    let isInput = false
    if (iel.tagName === 'INPUT') {
      $wrapper = document.createElement('div')
      // input
      this.input = iel.cloneNode(true) as HTMLInputElement
      isInput = true
    }
    let classes = ['ph-input_wrapper']
    if ($wrapper.className) {
      classes.push(iel.className)
    }
    if (!isBlank(config.class)) {
      classes.push(config.class as string)
    }
    $wrapper.className = classes.join(' ')
    this._createInput(this.input, config)
    if (config.trigger === 'change') {
      this.input.addEventListener('input', (e) => {
        this._valid((e.target as HTMLInputElement).value)
      })
    } else if (config.trigger === 'blur') {
      this.input.addEventListener('blur', (e) => {
        this._valid((e.target as HTMLInputElement).value)
      })
    }
    $wrapper.appendChild(this.input)
    // 错误提示
    this.errorTip = document.createElement('p')
    this.errorTip.className = 'ph-input-error-tip'
    $wrapper.appendChild(this.errorTip)
    if (isInput) {
      iel.parentElement?.replaceChild($wrapper, iel)
    }
    this.el = $wrapper
  }

  private _valid(value: string) {
    let errmsg = ''
    for (let rule of this.rules) {
      if (rule.reg === 'required') {
        if (isBlank(value)) {
          errmsg = rule.errmsg || '请输入该字段'
          break
        }
      } else if (rule.reg === 'equals') {
        if (rule.equalsElem == null) {
          errmsg = rule.errmsg || '两次输入不一致'
          break
        }
        let $eqElem = rule.equalsElem as HTMLInputElement
        if (typeof rule.equalsElem === 'string') {
          $eqElem = elem(rule.equalsElem)[0] as HTMLInputElement
        }
        if ($eqElem.value !== value) {
          errmsg = rule.errmsg || '两次输入不一致'
          break
        }
      } else if (!(rule.reg as RegExp).test(value)) {
        errmsg = rule.errmsg || '请输入正确的内容'
        break
      }
    }
    this.setError(errmsg === '' ? undefined : errmsg)
  }
}

export default Input
