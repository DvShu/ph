const Spinner = require('./index')

let spinner = Spinner('数据加载中')
spinner.start()
setTimeout(() => {
  spinner.succeed('数据加载成功')
}, 1500)
