import '../style/reset.less'
import './style.css'

import InfoIcon from '../lib/Icon/InfoIcon'
import WarnIcon from '../lib/Icon/WarnIcon'
import SuccessIcon from '../lib/Icon/SuccessIcon'
import ErrorIcon from '../lib/Icon/ErrorIcon'
import SingleIcon from '../lib/Icon/SingleIcon'
import LoadingIcon from '../lib/Icon/LoadingIcon'
import Icon from '../lib/Icon'

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

let $icons = document.getElementsByClassName('icon')
for (let i = 0, len = $icons.length; i < len; i++) {
  let $icon = $icons[i]
  new SingleIcon($icon, $icon.getAttribute('data-icon') as string, 'ph-icon-')
}
