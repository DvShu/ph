import '../style/vars.css'
import '../style/reset.css'
import List from '../lib/List'

let datas: number[] = []
for (let i = 0; i < 100; i++) {
  datas.push(i)
}

let list = new List('#list', {
  mode: 1,
  itemHeight: 50,
  renderItem: (d: number) => {
    let $item = document.createElement('div')
    $item.className = 'ph-list-item'
    $item.textContent = String(d)
    return $item
  },
})
list.load((page: number, pageSize: number) => {
  setTimeout(() => {
    let start = (page - 1) * pageSize
    let end = start + pageSize
    let status = end >= datas.length ? 3 : 0
    list.render(datas.slice(start, end), status)
  }, 500)
})
