import './index.css'
import { elem, on } from 'ph-utils/lib/dom'
import ArrowLeftIcon from '../Icon/ArrowLeft'
import ArrowRightIcon from '../Icon/ArrowRight'
import MorefilledIcon from '../Icon/MoreFilled'
import DoubleArrowLeftIcon from '../Icon/DoubleArrowLeft'
import DoubleArrowRightIcon from '../Icon/DoubleArrowRight'
import Button from '../Button'

interface PaginationConfig {
  /** 每页条数 */
  pageSize?: number
  /** 数据总数 */
  total?: number
  /** 当前页数 */
  current?: number
  /** 是否显示每一页显示多少条切换 */
  showSizer?: boolean
  /** 每页显示个数选择器的选项设置 */
  pageSizes?: number[]
  /** 简洁版 */
  simple?: boolean
}

class Pagination {
  /** 页码数量，一共有多少页 */
  public pageCount: number
  private _el: HTMLElement
  private _sizeChange: (size: number) => void
  private _currentChange: (current: number) => void
  private _config: Required<PaginationConfig>
  public constructor(el: string | HTMLElement, config?: PaginationConfig) {
    this._el = typeof el === 'string' ? elem(el)[0] : el
    this._sizeChange = () => {}
    this._currentChange = () => {}
    this._config = {
      pageSize: 15,
      total: 0,
      current: 0,
      showSizer: false,
      simple: false,
      pageSizes: [],
      ...(config || {}),
    }
    this.pageCount = Math.ceil(this._config.total / this._config.pageSize)
    this._el.className = 'ph-pagination ' + this._el.className
    this._render()
    this._event()
  }

  public get current() {
    return this._config.current
  }
  public set current(current: number) {
    this._config.current = current
    this._render()
  }

  public sizeChange(fn: (size: number) => void) {
    this._sizeChange = fn
  }

  public currentChange(fn: (current: number) => void) {
    this._currentChange = fn
  }

  // eslint-disable-next-line
  private _render() {
    if (this._config.total <= this._config.pageSize) {
      this._el.innerHTML = ''
    } else {
      let htmls = []
      let btn: Button
      // 上一页切换按钮
      btn = new Button('', {
        icon: new ArrowLeftIcon(''),
        attrs: {
          title: '上一页',
          'ph-pagination-page': 'prev',
        },
        class: 'ph-pagination-icon',
      })
      btn.disabled = this._config.current > 1 ? false : true
      htmls.push(`${btn.toString()}`)
      if (this._config.simple === false) {
        // 首页按钮
        btn = new Button('', {
          text: '1',
          class: this._config.current === 1 ? 'ph-pagination-curr' : '',
          attrs: {
            title: '1',
            'ph-pagination-page': '1',
          },
        })
        htmls.push(`${btn.toString()}`)
        // 上一页更多部分，当前分页至少大于4页
        if (this.pageCount >= 5 && this._config.current > 4) {
          btn = new Button('', {
            attrs: {
              title: 'prevMore',
              'ph-pagination-page': 'prevMore',
            },
            class: 'ph-pagination-more-area',
          })
          btn.addInnerHTML(new MorefilledIcon('', { class: 'ph-pagination-more' }).toString())
          btn.addInnerHTML(new DoubleArrowLeftIcon('', { class: 'ph-pagination-more-arrow' }).toString())
          htmls.push(`${btn.toString()}`)
        }
        // 中间部分，显示包括当前页在内的最多5页
        for (let i = 1; i <= 5; i++) {
          let curr = this._config.current + i - 3
          if (curr > 1 && curr < this.pageCount) {
            btn = new Button('', {
              attrs: {
                title: String(curr),
                'ph-pagination-page': String(curr),
              },
              class: this._config.current === curr ? 'ph-pagination-curr' : '',
              text: String(curr),
            })
            htmls.push(`${btn.toString()}`)
          }
        }
        // 下一页更多部分
        if (this.pageCount >= 5 && this._config.current < this.pageCount - 3) {
          btn = new Button('', {
            attrs: {
              title: 'nextMore',
              'ph-pagination-page': 'nextMore',
            },
            class: 'ph-pagination-more-area',
          })
          btn.addInnerHTML(new MorefilledIcon('', { class: 'ph-pagination-more' }).toString())
          btn.addInnerHTML(new DoubleArrowRightIcon('', { class: 'ph-pagination-more-arrow' }).toString())
          htmls.push(`${btn.toString()}`)
        }
        // 末尾页
        btn = new Button('', {
          text: String(this.pageCount),
          class: this._config.current === this.pageCount ? 'ph-pagination-curr' : '',
          attrs: {
            title: String(this.pageCount),
            'ph-pagination-page': String(this.pageCount),
          },
        })
        htmls.push(`${btn.toString()}`)
      } else {
        htmls.push(
          `<div class="ph-pagination-simple-pager"><input ph-pagination-edit="simple" class="ph-input ph-pagination-curr-edit" type="search" value="${this.current}" />&nbsp;&nbsp;/&nbsp;&nbsp;${this.pageCount}</div>`,
        )
      }

      // 下一页切换按钮
      btn = new Button('', {
        icon: new ArrowRightIcon(''),
        attrs: {
          title: '下一页',
          'ph-pagination-page': 'next',
        },
        class: 'ph-pagination-icon',
      })
      btn.disabled = this._config.current < this.pageCount ? false : true
      htmls.push(`${btn.toString()}`)

      // 每页显示个数选择器的选项设置
      if (
        this._config.showSizer &&
        this._config.pageSizes != null &&
        this._config.pageSizes.length > 0 &&
        !this._config.simple
      ) {
        let sizestr = '<select ph-pagination-sizes="sizes" class="ph-input ph-pagination-sizes">'
        for (let p of this._config.pageSizes) {
          sizestr += `<option value="${p}"${p === this.pageCount ? ' selected' : ''}>${p}&nbsp;条/页</option>`
        }
        sizestr += '</select>'
        htmls.push(sizestr)
      }

      this._el.innerHTML = htmls.join('')
    }
  }

  private _event() {
    // 每一页显示条数切换事件
    on(
      this._el,
      'change',
      (_e, target: any) => {
        let pageSize = Number(target.value)
        this._config.pageSize = pageSize
        this.pageCount = Math.ceil(this._config.total / this._config.pageSize)
        this._sizeChange(pageSize)
      },
      { eventFlag: 'ph-pagination-sizes' },
    )
    // 监听键盘上、下按键
    this._el.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        let $simpleInput = e.target as HTMLInputElement
        let v: any = $simpleInput.value
        v = parseInt(v, 10)
        if (Number.isNaN(v)) {
          v = 1
        } else {
          v = e.key === 'ArrowUp' ? v + 1 : v - 1
        }
        if (v < 1) {
          v = 1
        } else if (v > this.pageCount) {
          v = this.pageCount
        }
        v = String(v)
        $simpleInput.value = v
        if (e.key === 'ArrowUp') {
          // 移动光标到末尾
          requestAnimationFrame(() => {
            $simpleInput.setSelectionRange(v.length, v.length)
          })
        }
      }
    })
    // 监听编辑框的search事件
    this._el.addEventListener('search', (e) => {
      let p = Number((e.target as HTMLInputElement).value)
      if (p >= 1 && p <= this.pageCount && p !== this.current) {
        this._currentChange(p)
      }
    })
    // 编辑框，输入事件
    on(this._el, 'input', (e) => {
      let $ipt = e.target as HTMLInputElement
      let editPage: any = $ipt.value
      editPage = parseInt(editPage, 10)
      if (Number.isNaN(editPage)) {
        editPage = ''
      } else {
        if (editPage !== this.current) {
          if (editPage <= 0) {
            editPage = 1
          } else if (editPage > this.pageCount) {
            editPage = this.pageCount
          }
        }
      }
      $ipt.value = String(editPage)
    })
    // 分页事件
    on(
      this._el,
      'click',
      (_e, _target, flag) => {
        let p = 0
        switch (flag) {
          case 'prev': // 上一页
            p = this.current - 1
            break
          case 'next': // 下一页
            p = this.current + 1
            break
          case 'prevMore': // 上一页更多
            p = this.current - 5
            break
          case 'nextMore': // 下一页更多
            p = this.current + 5
            break
          default:
            p = Number(flag)
            break
        }
        if (p <= 0) {
          p = 1
        }
        if (p > this.pageCount) {
          p = this.pageCount
        }
        if (p !== this.current) {
          this._currentChange(p)
        }
      },
      { eventFlag: 'ph-pagination-page' },
    )
  }
}

export default Pagination
