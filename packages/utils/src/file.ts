/** nodejs 文件操作工具类 */
const path = require('path')
import fs = require('fs')

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
   * @param data 待写入的数据
   * @param opts 写入配置
   * @property opts.json 是否写入 JSON 格式的数据，写入数据时对数据进行 JSON 格式化，默认为：true
   * @property opts.format 是否在写入 json 数据时，将 JSON 数据格式化2个空格写入, 默认为 true
   */
  write(file: string, data: any, opts?: { json: boolean; format: boolean }) {
    return new Promise((resolve, reject) => {
      let writeData: string = data.toString()
      opts = { json: true, format: true, ...(opts || {}) }
      if (opts.json === true && typeof data === 'object') {
        writeData = JSON.stringify(data, null, opts.format === true ? 2 : 0)
      }
      fs.writeFile(path.resolve(file), writeData, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve(0)
        }
      })
    })
  },

  /**
   * 遍历文件夹
   * @param dir 待遍历的目录
   * @param callback 遍历到文件后的回调
   * @param done 遍历完成后的回调
   */
  traverseDir(dir: string, callback?: (filename: string) => void, done?: () => void) {
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
