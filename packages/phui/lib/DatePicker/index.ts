import './index.css'
import { elem, on } from 'ph-utils/lib/dom'

class DatePicker {
  private _el: HTMLInputElement
  private _value: string
  private _defaultValue: string
  private _change: (value: string) => void
  public constructor(el: string | HTMLInputElement, defaultValue?: string, min?: string, max?: string) {
    this._el = (typeof el === 'string' ? elem(el)[0] : el) as HTMLInputElement
    this._value = ''
    this._defaultValue = ''
    if (defaultValue != null) {
      this._value = defaultValue
      this._defaultValue = defaultValue
      this._el.value = defaultValue
    }
    if (min != null) {
      this._el.setAttribute('min', min)
    }
    if (max != null) {
      this._el.setAttribute('max', max)
    }
    this._change = () => {}
    this._render()
    on(this._el, 'change', (e) => {
      let $target: HTMLInputElement = e.target as any
      let value = $target.value
      if (value === '' && this._defaultValue !== '') {
        this._value = this._defaultValue
        this._el.value = this._value
      } else {
        this._value = $target.value
      }
      this._change(this._value)
    })
  }

  public get value() {
    return this._value
  }

  public set value(val: string) {
    this._el.value = val
  }

  public setMin(min: string) {
    this._el.setAttribute('min', min)
  }

  public setMax(max: string) {
    this._el.setAttribute('max', max)
  }

  public change(fn: (value: string) => void) {
    this._change = fn
  }

  private _render() {
    this._el.setAttribute('type', 'date')
    this._el.className = 'ph-date-picker ' + this._el.className
  }
}

export default DatePicker
