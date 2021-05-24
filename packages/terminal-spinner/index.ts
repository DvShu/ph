import readline = require('readline')
import colors = require('ph-terminal-colors')
import icons = require('ph-terminal-icons')

/**
 * 帧动画配置项
 */
interface AnimStepsOption {
  /**
   * 定义帧动画的每一帧字符
   */
  frames: string[]
  /**
   * 定义帧动画的过渡时间
   */
  interval: number
}

/**
 * 命令行加载提示类
 */
class Spinner {
  /**
   * 命令行提示文本
   */
  public text: string
  /**
   * 配置动画
   */
  public animSteps: AnimStepsOption
  /**
   * 获取输入输出读取写入
   */
  public rl: readline.Interface
  private _interval: number
  private _frameIndex: number
  private _lastText: string

  /**
   * 构造命令行提示器
   * @param text 提示文本
   */
  public constructor(text: string) {
    this.text = text
    this.animSteps = {
      frames: ['|', '/', '—', '\\'],
      interval: 200,
    }
    this._interval = -1
    this._frameIndex = 0
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    this._lastText = ''
  }

  /**
   * 清除之前的渲染
   */
  public clear() {
    // 清除之前的渲染
    readline.clearLine(process.stdout, 0)
    // 移动光标到开始位置
    readline.moveCursor(process.stdout, -(this._lastText.length * 2 + 2), 0) // * 2 一个中文占两个字符
  }

  /**
   * 开启模拟加载动画
   */
  public start() {
    this._render()
    if (this._interval === -1) {
      this._interval = setInterval(() => {
        if (this._frameIndex < this.animSteps.frames.length - 1) {
          this._frameIndex++
        } else {
          this._frameIndex = 0
        }
        this._render()
      }, this.animSteps.interval) as any
    }
  }

  /**
   * 停止动画，更改图标为 √，重置文本
   * @param {String} text 显示文本
   */
  public succeed(text?: string) {
    this._resetStatus('success', text)
  }

  /**
   * 停止动画，更改图标为 ×，重置文本
   * @param {String} text
   */
  public fail(text?: string) {
    this._resetStatus('error', text)
  }

  /**
   * 停止加载动画
   */
  public stop() {
    clearInterval(this._interval)
    this.rl.close()
  }

  private _resetStatus(status?: string, text?: string) {
    clearInterval(this._interval)
    this._interval = -1
    this.clear()
    this._lastText = ''
    this.rl.write(icons[status || 'info'] || 'X' + ' ' + (text || this.text) + '\r\n')
  }

  /**
   * 重新渲染文本
   * @param text 待渲染的文本
   */
  private _render(text?: string) {
    this.clear()
    this._lastText = text || this.text
    this.rl.write(colors.blue(this.animSteps.frames[this._frameIndex] + ' ' + this._lastText))
  }
}

/**
 * 构造加载提示器
 * @param text 加载时的提示文本
 * @returns
 */
function loadSpinner(text: string): Spinner {
  return new Spinner(text)
}
export = loadSpinner
