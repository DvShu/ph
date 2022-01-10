import './index.css'
import { elem, on } from 'ph-utils/lib/dom'
import { isBlank } from 'ph-utils/lib/index_m'
import { format } from 'ph-utils/lib/date_m'

interface ColItem {
  /** 字段名。是表格数据列的唯一标识 */
  key?: string
  /** 标题名称(表头) */
  title?: string
  /** 是否对该列开启排序 */
  sort?: boolean
  /**
   * 数据格式化：
   *    int 解析为整数显示,
   *    datetime_pattern 解析为日期格式，后面为格式字符串 https://gitee.com/towardly/ph/wikis/utils/date 所支持的字符串
   *    函数：自定义处理
   */
  format?:
    | string
    | ((data: any, key: string) => string | number | { text: any; class?: string | null; style?: string | null })
}

interface TableConfig {
  class?: string
  /** 创建带斑马纹的表格 */
  stripe?: boolean
  /** 构建表头的函数，如果为 null，则通过 cols 的方式自动渲染表头 */
  createHead?: ((tableElem: HTMLTableElement) => void) | null
  /** 构建表格内容，如果为 null，则通过 cols 的方式自动渲染内容 */
  createBody?: ((tableElem: HTMLTableElement, datas: any) => void) | null
  /** 配置列 */
  cols?: ColItem[]
  /** 配置默认排序的列 */
  defaultSort?: { key?: string; order?: 'asc' | 'desc' }
  /** 排序回调函数 */
  sort?: (key: string, order: 'asc' | 'desc') => any
  /** 点击事件，使用了事件委托的形式，所以这里能够触发所有配置的点击事件 */
  click?: (e: Event, target: HTMLElement, flag: string) => void
}

type InnerTableConfig = Required<TableConfig>

class Table {
  private _el: HTMLTableElement
  private _config: InnerTableConfig
  private sortKey: string
  private sortOrder: 'asc' | 'desc'

  /**
   *
   * @param selector 选择器或者 节点
   * @param config 表格配置, class、stripe
   */
  public constructor(selector: string | HTMLTableElement, config?: TableConfig) {
    this._el = selector as HTMLTableElement
    if (typeof selector === 'string') {
      this._el = elem(selector)[0] as HTMLTableElement
    }
    this._config = {
      stripe: false,
      class: '',
      createHead: null,
      createBody: null,
      defaultSort: { key: '', order: 'asc' },
      cols: [],
      sort: () => {},
      click: () => {},
      ...(config || {}),
    }
    this.sortKey = this._config.defaultSort.key || ''
    this.sortOrder = this._config.defaultSort.order || 'asc'
    this._render()
    on(
      this._el,
      'click',
      (e: Event, target?: HTMLElement, flag?: string) => {
        if (flag !== null && target != null) {
          if (flag === 'sort') {
            // 排序
            let sortKey = target.getAttribute('phtable-col-key') || ''
            let sortOrder: 'asc' | 'desc' = 'asc'
            if (this.sortKey === sortKey) {
              sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
            }
            // 原来的排序的节点移除排序设置
            let sortElem = elem(`th[phtable-col-key="${this.sortKey}"]`, this._el.tHead as HTMLHeadElement)[0]
            sortElem.classList.remove('sort-asc', 'sort-desc')
            this.sortKey = sortKey
            this.sortOrder = sortOrder
            // 新的排序的节点
            sortElem = elem(`th[phtable-col-key="${this.sortKey}"]`, this._el.tHead as HTMLHeadElement)[0]
            sortElem.classList.add(sortOrder === 'asc' ? 'sort-asc' : 'sort-desc')
            let sortData = this._config.sort(sortKey, sortOrder)
            if (sortData != null) {
              this.changeData(sortData)
            }
          } else {
            if (this._config.click != null && typeof this._config.click === 'function') {
              this._config.click(e, target, flag || '')
            }
          }
        }
        e.preventDefault()
      },
      { eventFlag: 'phtable-event-flag' },
    )
  }

  /**
   * 数据改变后，需要重新渲染内容区域
   * @param data 改变后的数据
   */
  public changeData(data: any) {
    if (this._config.createBody != null && typeof this._config.createBody === 'function') {
      this._config.createBody(this._el, data)
    } else {
      let $bodyhtml = ''
      for (let d of data) {
        $bodyhtml += '<tr>'
        for (let col of this._config.cols) {
          if (col.key != null) {
            if (col.format == null) {
              $bodyhtml += `<td>${d[col.key]}</td>`
            } else if (col.format === 'int') {
              $bodyhtml += `<td>${parseInt(d[col.key], 10)}</td>`
            } else if (typeof col.format === 'string' && col.format.startsWith('datetime_')) {
              let pattern = col.format.substring(9)
              let timeD = d[col.key]
              // eslint-disable-next-line
              if (typeof timeD === 'number' && String(timeD).length === 10) {
                timeD = timeD * 1000
              }
              $bodyhtml += `<td>${format(timeD, pattern)}</td>`
            } else if (typeof col.format === 'function') {
              let fd = col.format(d, col.key)
              // eslint-disable-next-line
              if (typeof fd === 'object') {
                let _class = !isBlank(fd.class as any) ? ` class="${fd.class}"` : ''
                let _style = !isBlank(fd.style as any) ? ` style="${fd.style}"` : ''
                $bodyhtml += `<td${_class}${_style}>${fd.text}</td>`
              } else {
                $bodyhtml += `<td>${fd}</td>`
              }
            }
          }
        }
        $bodyhtml += '</tr>'
      }
      this._el.tBodies[0].innerHTML = $bodyhtml
    }
  }

  private _render() {
    let clazz = new Set(['ph-table', this._el.className])
    if (this._config.stripe) {
      clazz.add('ph-table-stripe')
    }
    if (!isBlank(this._config.class)) {
      clazz.add(this._config.class)
    }
    this._el.className = [...clazz].join(' ').trim()
    this._el.setAttribute('phtable-event-flag', '__stop__')
    if (this._config.createHead != null && typeof this._config.createHead === 'function') {
      this._el.innerHTML = '<thead></thead><tbody></tbody>'
      this._config.createHead(this._el)
    } else if (this._config.cols != null && this._config.cols.length > 0) {
      let $thead = ['<thead><tr>']
      for (let col of this._config.cols) {
        let thClass = []
        if (col.sort && !isBlank(col.key)) {
          // 对该列开启排序
          thClass.push('sort-column')
          if (this.sortKey === col.key) {
            thClass.push(this.sortOrder === 'desc' ? 'sort-desc' : 'sort-asc')
          }
        }
        if (!isBlank(col.title)) {
          let sortFlag = thClass.length === 0 ? '' : ` phtable-event-flag="sort" phtable-col-key="${col.key}" `
          $thead.push(`<th ${sortFlag}class="${thClass.join(' ')}"><span>${col.title}</span>`)
          if (thClass.length === 0) {
            $thead.push('</th>')
          } else {
            $thead.push('<span class="caret-wrapper">')
            $thead.push('<span class="sort-caret ascending"></span>')
            $thead.push('<span class="sort-caret descending"></span></span></th>')
          }
        }
      }
      $thead.push('</tr></thead><tbody></tbody>')
      this._el.innerHTML = $thead.join('')
    }
  }
}

export default Table
