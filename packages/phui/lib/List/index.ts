import { throttle } from 'ph-utils/lib/index_m'
import './index.css'
import Component from '../utils/Component'

interface ListOption {
  /** 默认：0 - 加载更多, 1 - (分页模式)上一页，下一页 */
  mode?: 0 | 1
  /** 渲染列表项的模板 */
  renderItem: (data: any, i: number, list: any[]) => HTMLElement
  /** 滚动容器的高度 */
  height?: number | string
}

export default class List extends Component<HTMLDivElement> {
  private _wrapper: HTMLDivElement
  private _inner: HTMLDivElement
  private _main: HTMLDivElement
  private _footer: HTMLDivElement
  /// 加载数据的事件
  private _loadEvent: (page: number) => void
  private _config: Required<ListOption>
  /** 页码 */
  public page: number
  /** 滚动所在容器的可视高度 */
  public height: number
  /** 0 - 初始装, 1 - 正在加载数据, 2 - 加载错误, 3 - 加载完成 */
  private _loadStatus: number
  public constructor(el: string | HTMLDivElement, config: ListOption) {
    super(el)
    this._config = { mode: 0, ...config, height: 0 }
    this.page = 0
    this.height = 0
    this._loadStatus = 0

    /* 初始化列表基本结构 */
    this.el.classList.add('ph-list')
    this._wrapper = document.createElement('div')
    this._wrapper.className = 'ph-list-wrapper'
    this._inner = document.createElement('div')
    this._inner.className = 'ph-list-inner'
    this._main = document.createElement('div')
    this._inner.appendChild(this._main)
    this._footer = document.createElement('div')
    this._footer.className = 'ph-list-loader-wrapper ph-list-footer'
    this._renderLoading(this._footer)
    this._inner.appendChild(this._footer)
    this._wrapper.appendChild(this._inner)
    this.el.appendChild(this._wrapper)

    this._initHeight() // 初始化高度
    this._loadEvent = () => {}
    // 监听滚动事件
    this.el.addEventListener('scroll', throttle(this._scroll.bind(this), 100))
  }

  private _initHeight() {
    let h = this._config.height
    if (h === 0) {
      let rect = this.el.getBoundingClientRect()
      this.height = rect.height
    } else {
      let height = typeof h === 'number' ? `${h}px` : h
      this.height = parseInt(height, 10)
      this.el.style.height = height
    }
  }

  private _loadData() {
    this._loadStatus = 1
    this.page++
    this._loadEvent(this.page)
  }

  private _scroll() {
    let top = this.el.scrollTop // 滚动的距离
    let scrollHeight = this.el.scrollHeight // 滚动所在容器的实际高度
    if (scrollHeight - top - this.height <= 50) {
      // 加载下一页
      if (this._loadStatus === 0) {
        this._loadData()
      }
    }
  }

  private _renderLoading(doc: HTMLDivElement) {
    doc.innerHTML = ''
    let $loading = document.createElement('div')
    for (let i = 0; i < 3; i++) {
      let $bounce = document.createElement('div')
      $bounce.className = `ph-loading-bounce ph-bounce${i + 1}`
      $loading.appendChild($bounce)
    }
    doc.appendChild($loading)
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
        this._loadEvent(this.page)
      },
      { once: true }
    )

    this._footer.appendChild($tip)
    this._footer.appendChild($btn)
  }

  /** 配置加载事件 */
  public load(fn: (page: number) => void) {
    this._loadEvent = fn
    this._loadData()
  }

  /** 0 - 本地加载完成，2 - 加载错误, 3 - 所有数据已经全部加载完 */
  public setStatus(status: number) {
    this._loadStatus = status
    if (status === 3) {
      this._footer.innerHTML =
        '<span style="color:#999999;">滑动到底啦！</span>'
    } else if (status === 2) {
      this._renderFailed()
    } else {
      this._renderLoading(this._footer)
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
      // let children = this._main.childNodes
      // let clone = this._main.cloneNode(true) as HTMLDivElement
      // let cloneChildren = clone.childNodes
      // let lastTop = 0
      // for (let i = 0, len = children.length; i < len; i++) {
      //   let $listItem = children[i] as HTMLElement
      //   let itemRect = $listItem.getBoundingClientRect()
      //   if (itemRect.height + itemRect.top > 0) {
      //     break
      //   }
      //   lastTop = itemRect.height + itemRect.top
      //   clone.removeChild(cloneChildren[0])
      // }
      // lastTop = this.el.scrollTop + lastTop
      // this._inner.style.transform = `translate3d(0, ${lastTop}px, 0)`
      let fragment = document.createDocumentFragment()
      for (let i = 0, len = data.length; i < len; i++) {
        fragment.appendChild(this._config.renderItem(data[i], i, data))
      }
      if (this._config.mode === 0) {
        this._main.appendChild(fragment)
      }
      // let oldHeight = this._wrapper.getBoundingClientRect()
      // this._wrapper.style.height = `${oldHeight.height + 500}px`
      // clone.appendChild(fragment)
      // this._main.innerHTML = clone.innerHTML
      // requestAnimationFrame(() => {
      //   let newHeight = this._inner.getBoundingClientRect().height
      //   this._wrapper.style.height = `${newHeight}px`
      // })
    }
  }

  /**
   * 重置状态，一般用于重新刷新数据
   */
  public reset() {
    this.page = 0
    this.setStatus(0)
  }
}
