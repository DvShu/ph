import '../style/reset.css'
import '../style/vars.css'

import { elem } from 'ph-utils/lib/dom'

import InfoIcon from '../lib/Icon/Info'
import WarnIcon from '../lib/Icon/Warn'
import SuccessIcon from '../lib/Icon/Success'
import ErrorIcon from '../lib/Icon/Error'
import LoadingIcon from '../lib/Icon/Loading'
import ArrowDownIcon from '../lib/Icon/ArrowDown'
import MenuIcon from '../lib/Icon/Menu'
import ArrowUpIcon from '../lib/Icon/ArrowUp'
import SingleIcon from '../lib/Icon/Single'
import SearchIcon from '../lib/Icon/Search'
import SettingIcon from '../lib/Icon/Setting'
import Icon from '../lib/Icon'
import Input from '../lib/Input'
import Button from '../lib/Button'
import Table from '../lib/Table'

import '../style/layout.css'
import './style.less'

class MultiLoadingIcon extends Icon {
  protected _template() {
    return '<path d="M204.8 204.8m-204.8 0a204.8 204.8 0 1 0 409.6 0 204.8 204.8 0 1 0-409.6 0Z" fill="#EBF2FC" p-id="2687"></path><path d="M819.2 204.8m-204.8 0a204.8 204.8 0 1 0 409.6 0 204.8 204.8 0 1 0-409.6 0Z" fill="#B5D2F3" p-id="2688"></path><path d="M819.2 819.2m-204.8 0a204.8 204.8 0 1 0 409.6 0 204.8 204.8 0 1 0-409.6 0Z" fill="#7FB0EA" p-id="2689"></path><path d="M204.8 819.2m-204.8 0a204.8 204.8 0 1 0 409.6 0 204.8 204.8 0 1 0-409.6 0Z" fill="#4A90E2" p-id="2690"></path>'
  }
}

/* eslint-disable */
new InfoIcon('#info')
new WarnIcon('#warn')
new SuccessIcon('#success')
new ErrorIcon('#error')
new LoadingIcon('#loading')
new MenuIcon('#menu')
new SettingIcon('#setting')
new ArrowDownIcon('#arrowDown')
new SearchIcon('#search')
new ArrowUpIcon('#arrowUp')
new MultiLoadingIcon('#multi')
new MultiLoadingIcon('#multi1', { fills: ['#5FB878', '#1E9FFF', '#FFB800', '#FF5722'] })

new SingleIcon(elem('.icon'))

/* 输入框 */
let nameInput = new Input('#nameIpt', {
  htmlType: 'text',
  name: 'username',
  placeholder: '请输入姓名',
  value: '张三',
  rules: [
    { reg: 'required', errmsg: '该字段必填' },
    { reg: 'equals', equalsElem: '#pwd', errmsg: '两次输入不一致' },
    { reg: /\d+/, errmsg: '请输入正确的值' },
  ],
})
new Input('#nameIpt1', { placeholder: '请输入姓名' })
nameInput.value = '李四'

/* 按钮 */
new Button('#btn', { round: true })
new Button('#primaryBtn', { type: 'primary' })
new Button('#textBtn', { type: 'text' })
new Button('#blockBtn', { block: true })
new Button('#iconBtn', { icon: new InfoIcon('') })
new Button('#iconsBtn', { icon: new SingleIcon('', { prefix: 'ph-icon-', icon: 'warn' }) })
let loadingBtn = new Button('#loadingBtn')
loadingBtn.on('click', () => {
  console.log('start loading……')
  loadingBtn.setLoading(true)
  setTimeout(() => {
    loadingBtn.setLoading(false)
  }, 30000)
})
new Button('#customeBtn', { class: 'custome-btn' })
new Button('#customeBtn1', { class: 'custome-btn1' })
new Button('#customeBtn2', { class: 'custome-btn2' })
new Button('#customeBtn3', { class: 'custome-btn3' })
new Button('#iconCircleBtn', { circle: true, icon: new InfoIcon('') })

/* 表格 */
let tableData = [
  { id: 1, name: '张三', sex: '男', age: 28, city: '中国', time: Date.now(), score: 12.12 },
  { id: 2, name: '张三', sex: '男', age: 29, city: '中国', time: Date.now(), score: 12.12 },
  { id: 3, name: '张三', sex: '男', age: 30, city: '中国', time: 1641804765, score: 12.12 },
  { id: 4, name: '张三', sex: '男', age: 31, city: '中国', time: Date.now(), score: 12.12 },
]
// 创建数据表格
let table = new Table('#table', {
  stripe: true,
  cols: [
    { title: '#', key: 'id', format: 'int' },
    { title: '用户名', key: 'name' },
    { title: '性别', key: 'sex' },
    {
      title: '年龄',
      sort: true,
      key: 'age',
      format: (d, key) => {
        let style = undefined
        if ((d[key] as any) >= 30) {
          style = 'color:red'
        }
        return {
          style,
          text: d[key],
        }
      },
    },
    { title: '城市', key: 'city' },
    { title: '注册日期', key: 'time', format: 'datetime_yyyy-mm-dd' },
    {
      key: '-',
      format: (d) => {
        let id = d.id
        return `<a phtable-event-flag="operate" data-operate="update" data-id="${id}">修改</a><a phtable-event-flag="operate" data-operate="del" data-id="${id}" style="margin-left:5px;">删除</a>`
      },
      title: '操作',
    },
  ],
  defaultSort: { key: 'age', order: 'asc' },
  sort: (key, order) => {
    console.log(key + ' _ ' + order)
  },
  click: (_e: Event, target: HTMLElement, flag: string) => {
    if (flag === 'operate') {
      let operate = target.getAttribute('data-operate') || ''
      let id = target.getAttribute('data-id') || ''
      if (operate === 'update') {
        // 点击了修改按钮
        console.log('修改用户信息: ' + id)
      } else if (operate === 'del') {
        // 点击了删除按钮
        console.log('删除用户数据: ' + id)
      }
    }
  },
})

// 更改数据表格数据，一般用于在翻页改变查询出数据后调用该参数
table.changeData(tableData)
