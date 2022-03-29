import '../style/vars.css'
import '../style/reset.css'
import List from '../lib/List'

let datas: number[] = []
for (let i = 0; i < 100; i++) {
  datas.push(i)
}

let list = new List('#list', {
  mode: 1,
  template: (d: number) => {
    let $item = document.createElement('div')
    $item.className = 'ph-list-item'
    $item.textContent = String(d)
    return $item
  },
})
list.load((page) => {
  setTimeout(() => {
    let start = (page - 1) * 20
    let end = start + 20
    let status = page === 5 ? 3 : 0
    list.render(datas.slice(start, end), status)
  }, 500)
})
