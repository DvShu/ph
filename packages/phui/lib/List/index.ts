import { throttle } from 'ph-utils/lib/index_m'
import './index.css'
import Component from '../utils/Component'

interface ListOption {
  /** 默认：0 - 加载更多, 1 - (分页模式)上一页，下一页 */
  mode?: 0 | 1
  /** 渲染列表项的模板 */
  renderItem: (el: HTMLDivElement, data: any, i: number, list: any[]) => void
  /** 滚动容器的高度 */
  height?: number | string
  /** 每一页条数, 填0则自动计算 */
  pageSize?: number
  /** 列表每项高度, 当 mode: 1 时此字段必填 */
  itemHeight?: number
}

export default class List extends Component<HTMLDivElement> {
  private _wrapper: HTMLDivElement
  private _inner: HTMLDivElement
  private _footer: HTMLDivElement
  /// 加载数据的事件
  private _loadEvent: (page: number, pageSize: number) => void
  private _config: Required<ListOption>
  /** 页码 */
  public page: number
  /** 滚动所在容器的可视高度 */
  public height: number
  /** 0 - 初始装, 1 - 正在加载数据, 2 - 加载错误, 3 - 加载完成 */
  private _loadStatus: number
  /** 所有已经加载过的数据 */
  public datas: any[]
  /** 每一页显示条数 */
  public pageSize: number
  private _positions: {
    index: number
    height: number
    top: number
    bottom: number
  }[]
  public constructor(el: string | HTMLDivElement, config: ListOption) {
    super(el)
    this._config = { mode: 0, height: 0, pageSize: 0, itemHeight: 0, ...config }
    this.page = 0
    this.height = 0
    this._loadStatus = 0
    this.datas = []
    this._positions = []

    /* 初始化列表基本结构 */
    this.el.classList.add('ph-list')
    this._wrapper = document.createElement('div')
    this._wrapper.className = 'ph-list-wrapper'
    this._inner = document.createElement('div')
    this._inner.className = 'ph-list-inner'
    this._wrapper.appendChild(this._inner)
    this._footer = document.createElement('div')
    this._footer.className = 'ph-list-loader-wrapper ph-list-footer'
    if (this._config.mode === 1) {
      this._footer.classList.add('ph-virtual-footer')
    }
    this._renderLoading(this._footer)
    this._wrapper.appendChild(this._footer)
    this.el.appendChild(this._wrapper)

    this._initHeight() // 初始化高度
    this._loadEvent = () => {}
    // 计算每一页显示的数量
    if (this._config.pageSize === 0 && this._config.itemHeight !== 0) {
      this.pageSize = Math.ceil(this.height / this._config.itemHeight) + 1
    } else {
      this.pageSize = this._config.pageSize
    }
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
    this._loadEvent(this.page, this.pageSize)
  }

  private _scroll() {
    let top = this.el.scrollTop // 滚动的距离
    let scrollHeight = this.el.scrollHeight // 滚动所在容器的实际高度
    if (scrollHeight - top - this.height <= 50) {
      // 加载下一页
      if (this._loadStatus === 0) {
        this._loadData()
      } else if (this._loadStatus === 3) {
        this.render([], 3)
      }
    } else {
      this.render([], 0)
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
        this._loadEvent(this.page, this.pageSize)
      },
      { once: true }
    )

    this._footer.appendChild($tip)
    this._footer.appendChild($btn)
  }

  /** 配置加载事件 */
  public load(fn: (page: number, pageSize: number) => void) {
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

  private getStartIndex(scrollTop: number) {
    let item = this._positions.find((i) => i && i.bottom >= scrollTop)
    return item ? item.index : 0
  }

  /** 渲染数据 */
  /**
   * 渲染数据
   * @param data  待渲染的数据列表
   * @param status 本次数据加载状态， 0 - 本次数据加载成功 , 2 - 数据加载失败, 3 - 全部数据加载完成
   */
  public render(data: any[], status?: number) {
    let s = status || 0
    if (this._loadStatus === 1) {
      this.setStatus(s)
    }
    if (s === 0 || s === 3) {
      let d = []
      let start = 0
      let end = 0
      if (this._config.mode === 1) {
        this.datas = this.datas.concat(data)
        // 当前滚动位置
        let scrollTop = this.el.scrollTop
        // 开始索引
        if (this._config.itemHeight !== 0) {
          start = Math.floor(scrollTop / this._config.itemHeight)
        } else {
          start = this.getStartIndex(scrollTop)
        }
        end = Math.min(start + this.pageSize, this.datas.length)
        let startOffset = 0
        if (this._config.itemHeight !== 0) {
          startOffset = scrollTop - (scrollTop % this._config.itemHeight)
        } else {
          let item = this._positions[start]
          if (item != null) {
            startOffset = scrollTop - (scrollTop % item.height)
          }
        }
        d = this.datas.slice(start, end)
        this._inner.style.transform = `translate3d(0, ${startOffset}px, 0)`
        if (data.length > 0 && this._config.itemHeight !== 0) {
          let h = this.datas.length * this._config.itemHeight + 50
          this._wrapper.style.height = `${h}px`
        }
      } else {
        d = data
      }
      let fragment = document.createDocumentFragment()
      for (let i = 0, len = d.length; i < len; i++) {
        let $item = document.createElement('div')
        $item.className = 'ph-list-item'
        if (this._config.mode === 1 && this._config.itemHeight === 0) {
          $item.id = `item${start + i}`
        }
        this._config.renderItem($item, d[i], i, d)
        fragment.appendChild($item)
      }
      if (this._config.mode === 0) {
        this._inner.appendChild(fragment)
      } else {
        this._inner.innerHTML = ''
        this._inner.appendChild(fragment)
        if (this._config.itemHeight === 0) {
          requestAnimationFrame(() => {
            let $items = this._inner.childNodes
            // 缓存每一个节点的位置信息
            for (let i = 0, len = $items.length; i < len; i++) {
              let $item = $items[i] as HTMLDivElement
              let rect = $item.getBoundingClientRect()
              let index = Number($item.id.slice(4))
              if (this._positions[index] == null) {
                this._positions[index] = {
                  index,
                  height: rect.height,
                  top: rect.height,
                  bottom: rect.bottom,
                }
              }
            }
            let len = this._positions.length
            let h = this._positions[len - 1].bottom + 50
            this._wrapper.style.height = `${h}px`
          })
        }
      }
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
