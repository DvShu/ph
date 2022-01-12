import './index.css'
import { elem, on } from 'ph-utils/lib/dom'

class DatePicker {
  private _el: HTMLInputElement
  private _value: string
  private _min: string
  private _max: string
  private _change: (value: string) => void
  public constructor(el: string | HTMLInputElement, value?: string, min?: string, max?: string) {
    this._el = (typeof el === 'string' ? elem(el)[0] : el) as HTMLInputElement
    if (value != null) {
      this._value = value
      this._el.value = value
    }
    if (min != null) {
      this._min = min
      this._el.setAttribute('min', min)
    }
    if (max != null) {
      this._max = max
      this._el.setAttribute('max', max)
    }
    this._change = () => {}
    this._render()
    on(this._el, 'change', (e) => {
      let $target: HTMLInputElement = e.target as any
      this._value = $target.value
      this._change($target.value)
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
