import './index.css'
import Component from '../utils/Component'

interface ListOption {
  /** 默认：0 - 加载更多 */
  mode?: number
  /** 渲染列表项的模板 */
  template: (data: any, i: number, list: any[]) => HTMLElement
}

export default class List extends Component<HTMLDivElement> {
  private _wrapper: HTMLDivElement
  private _inner: HTMLDivElement
  private _main: HTMLDivElement
  private _footer: HTMLDivElement
  private fn: (page: number) => void
  private observer: IntersectionObserver
  private _config: Required<ListOption>
  private _page: number
  /** 0 - 初始装, 1 - 正在加载数据, 2 - 加载错误, 3 - 加载完成 */
  private _loadStatus: number
  public constructor(el: string | HTMLDivElement, config: ListOption) {
    super(el)
    this._config = { mode: 0, ...config }
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].intersectionRatio > 0) {
          this._loadStatus = 1
          this._page++
          this.fn(this._page)
        }
      },
      { root: this.el }
    )
    this._page = 0
    this._loadStatus = 0
    // 初始化列表基本结构
    this.el.classList.add('ph-list')
    this._wrapper = document.createElement('div')
    this._wrapper.className = 'ph-list-wrapper'
    this._inner = document.createElement('div')
    this._main = document.createElement('div')
    this._inner.appendChild(this._main)
    this._footer = document.createElement('div')
    this._footer.className = 'ph-list-footer'
    this._renderLoading()
    this._inner.appendChild(this._footer)
    this._wrapper.appendChild(this._inner)
    this.el.appendChild(this._wrapper)
    this.fn = () => 0
    this.observer.observe(this._footer)
  }

  private _renderLoading() {
    this._footer.innerHTML = ''
    let $loading = document.createElement('div')
    for (let i = 0; i < 3; i++) {
      let $bounce = document.createElement('div')
      $bounce.className = `ph-loading-bounce ph-bounce${i + 1}`
      $loading.appendChild($bounce)
    }
    this._footer.appendChild($loading)
  }

  private _renderFailed() {
    this._footer.innerHTML = ''
    let $tip = document.createElement('span')
    $tip.style.color = '#ed3f13'
    $tip.textContent = '加载失败！'

    let $btn = document.createElement('a')
    $btn.textContent = '重新加载'
    $btn.addEventListener(
      'click',
      () => {
        this.setStatus(1)
        this.fn(this._page)
      },
      { once: true }
    )

    this._footer.appendChild($tip)
    this._footer.appendChild($btn)
  }

  /** 配置加载事件 */
  public load(fn: (page: number) => void) {
    this.fn = fn
  }

  /** 0 - 本地加载完成，2 - 加载错误, 3 - 所有数据已经全部加载完 */
  public setStatus(status: number) {
    this._loadStatus = status
    if (status === 3) {
      this.observer.unobserve(this._footer)
      this._footer.innerHTML =
        '<span style="color:#999999;">滑动到底啦！</span>'
    } else if (status === 2) {
      this._renderFailed()
    } else {
      this._renderLoading()
    }
  }

  /** 渲染数据 */
  /**
   * 渲染数据
   * @param data  待渲染的数据列表
   * @param status 本次数据加载状态， 0 - 本次数据加载成功 , 2 - 数据加载失败, 3 - 全部数据加载完成
   */
  public render(data: any, status?: number) {
    let s = status || 0
    if (this._loadStatus === 1) {
      this.setStatus(s)
    }
    if (s === 0 || s === 3) {
      let fragment = document.createDocumentFragment()
      for (let i = 0, len = data.length; i < len; i++) {
        fragment.appendChild(this._config.template(data[i], i, data))
      }
      this._main.appendChild(fragment)
    }
  }

  /**
   * 重置状态，一般用于重新刷新数据
   */
  public reset() {
    this._page = 0
    this.setStatus(0)
  }
}
