/** nodejs 文件操作工具类 */
const path = require('path')
const fs = require('fs')

export = {
  /**
   * 读取文件内容为JSON格式
   * @param filepath 读取的文件路径
   * @returns Promise<unknown>
   */
  readJSON<T>(filepath: string): Promise<T> {
    return new Promise((resolve, reject) => {
      fs.readFile(path.resolve(filepath), 'utf-8', (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(JSON.parse(data))
        }
      })
    })
  },

  /**
   * 写入 JSON 格式的数据到文件
   * @param file 待写入的文件
   * @param data 待写入的数据, JSON 格式
   */
  writeJSON(file: string, data: object) {
    const writeStream = fs.createWriteStream(path.resolve(file))
    writeStream.write(JSON.stringify(data))
    writeStream.close()
  },

  /**
   * 遍历文件夹
   * @param dir 待遍历的目录
   * @param callback 遍历到文件后的回调
   * @param done 遍历完成后的回调
   */
  traverseDir(dir: string, callback: (filename: string) => void, done: () => void) {
    let t: any = -1 // 定时任务，简单延迟作为遍历完成计算
    function list(dr: string, cb: (filename: string) => void, d: () => void) {
      fs.readdir(path.resolve(dr), { withFileTypes: true }, (err, files) => {
        if (err && err.errno === -4052) {
          // 本身就是文件
          if (typeof cb === 'function') cb(dr)
          if (typeof d === 'function') d() // 遍历完成
        } else {
          for (let i = 0, len = files.length; i < len; i++) {
            const file = files[i]
            if (file.isFile()) {
              if (typeof cb === 'function') cb(path.join(dr, file.name))
              clearTimeout(t)
              t = setTimeout(() => {
                setImmediate(() => {
                  done()
                })
              }, 10)
            } else {
              // 文件夹
              list(path.join(dr, file.name), cb, d)
            }
          }
        }
      })
    }
    list(dir, callback, done)
  },
}
