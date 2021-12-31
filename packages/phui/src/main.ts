import '../style/reset.css'
import './style.css'
import { elem } from 'ph-utils/lib/dom'

import InfoIcon from '../lib/Icon/InfoIcon'
import WarnIcon from '../lib/Icon/WarnIcon'
import SuccessIcon from '../lib/Icon/SuccessIcon'
import ErrorIcon from '../lib/Icon/ErrorIcon'
import LoadingIcon from '../lib/Icon/LoadingIcon'
import SingleIcon from '../lib/Icon/SingleIcon'
import Icon from '../lib/Icon'

import Input from '../lib/Input'

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
console.log(nameInput.value)
nameInput.value = '李四'
console.log(nameInput.value)
console.log(nameInput.nameValue())
