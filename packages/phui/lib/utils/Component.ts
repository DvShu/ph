import { queryElem } from './index'

export default class Component<T extends HTMLElement> {
  protected el: T

  public constructor(el: string | HTMLElement, tagName?: string) {
    this.el = queryElem(el, tagName) as T
  }

  public node() {
    return this.el
  }

  public toString() {
    return this.el.outerHTML
  }
}
