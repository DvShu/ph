import abstractTransport from 'pino-abstract-transport'
import SonicBoom from 'sonic-boom'
import { Transform } from 'stream'
import {
  isObject,
  prettifyTime,
  prettifyString,
  prettifyHttp,
  prettifyMessage,
  prettifyError,
  prettifyLevelMsg,
} from './lib/utils'

const nl = '\n'

/**
 * 将字符串解析为 JSON 格式
 * @param {string} input 待解析为JSON格式的字符串
 * @returns {Object} 解析后的结果；如果解析成功，则包含 value 字段为解析成功的值；否则 err 表示失败错误
 */
function jsonParse(input: string) {
  try {
    return { value: JSON.parse(input) }
  } catch (error) {
    return { err: error }
  }
}

function convertNumberLevel(log: any) {
  if (log.level === 10) log.level = 'trace'
  if (log.level === 20) log.level = 'debug'
  if (log.level === 30) log.level = 'info'
  if (log.level === 40) log.level = 'warn'
  if (log.level === 50) log.level = 'error'
  if (log.level === 60) log.level = 'fatal'
}

/**
 * JSON 日志格式化
 */
function prettyFactory() {
  return pretty
  /**
   * 格式化日志
   * @param {any} inputData 识别到的日志数据
   * @returns 格式化后的日志返回
   */
  function pretty(inputData: any) {
    let log
    if (typeof inputData === 'string') {
      const parsedData = jsonParse(inputData)
      if (!parsedData.value || parsedData.err) {
        return inputData + nl
      }
      log = parsedData.value
    } else if (isObject(inputData)) {
      log = inputData
    } else {
      return inputData + nl
    }
    if (!log.level) return inputData + nl
    if (typeof log.level === 'number') convertNumberLevel(log)
    // 保留每一行日志的每一个数据元
    const result = []
    result.push(prettifyTime(log)) // 格式化日志时间
    result.push(`[${prettifyLevelMsg(log.level.toUpperCase(log.level), log.level)}]`) // 格式化日志级别
    result.push(prettifyString(log.name || log.context, 'blue')) // 格式化标记
    result.push(prettifyHttp(log)) // 格式化 http 日志
    result.push(prettifyMessage(log))
    if (log.err && log.err.type === 'Error' && log.err.stack) {
      result.push(prettifyError(log.err))
    }
    return result.filter((val) => val != null && val.trim().length > 0).join(' ') + '\n'
  }
}

async function build(options: any) {
  const pretty = prettyFactory()
  return abstractTransport((source) => {
    const transportStream = new Transform({
      autoDestroy: true,
      objectMode: true,
      transform(chunk, _enc, cb) {
        const line = pretty(chunk)
        cb(null, line)
      },
    })
    let destination: any

    if (typeof options.destination === 'object' && typeof options.destination.write === 'function') {
      destination = options.destination
    } else {
      destination = new SonicBoom({
        dest: options.destination || 1,
        append: options.append,
        mkdir: options.mkdir,
        sync: options.sync, // by default sonic will be async
      })
    }
    source.on('unknown', (line) => {
      destination.write(line + '\n')
    })
    source.pipe(transportStream).pipe(destination)
  })
}

module.exports = build
export default build
