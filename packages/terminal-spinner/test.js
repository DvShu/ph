const Spinner = require('./index')

let spinner = new Spinner('数据加载中')
spinner.start()
setTimeout(() => {
  spinner.succeed('数据加载成功')
  spinner.start('重新加载')
}, 1500)
