import colors = require('ansi-colors')

/**
 * 命令行加载提示类
 */
class Spinner {
  /**
   * 命令行提示文本
   */
  public text: string
  // eslint-disable-next-line
  public stream: NodeJS.WriteStream
  public frames: string[]
  private _interval: any
  private _frameIndex: number

  /**
   * 构造命令行提示器
   * @param text 提示文本
   */
  public constructor(text?: string) {
    this.text = text || ''
    this.frames = ['|', '/', '—', '\\']
    this._interval = -1
    this._frameIndex = 0
    this.stream = process.stdout
  }

  /**
   * 清除之前的渲染
   */
  public clear() {
    // 清除之前的渲染
    this.stream.clearLine(0)
    // 移动光标到开始位置
    this.stream.cursorTo(0)
  }

  /**
   * 开启模拟加载动画
   */
  public start(text?: string) {
    if (text) this.text = text
    this.clear()
    this.stream.write('\u001b[?25l') // 隐藏光标
    if (this._interval == null) {
      this._render()
      this._interval = setInterval(() => {
        this._render()
      }, 200)
    }
  }

  /**
   * 停止动画，更改图标为 √，重置文本
   * @param {String} text 显示文本
   */
  public succeed(text?: string) {
    this._stopAndPersist(colors.green('✔'), text || this.text)
  }

  /**
   * 停止动画，更改图标为 ×，重置文本
   * @param {String} text
   */
  public fail(text?: string) {
    this._stopAndPersist(colors.red('✖'), text || this.text)
  }

  public warn(text?: string) {
    this._stopAndPersist(colors.yellow('⚠'), text || this.text)
  }

  public info(text?: string) {
    this._stopAndPersist(colors.blue('ℹ'), text || this.text)
  }

  /**
   * 停止加载动画
   */
  public stop() {
    clearInterval(this._interval)
    this._interval = null
    this.clear()
    this.stream.write('\u001b[?25h') // 显示光标
  }

  private _stopAndPersist(icon: string, text: string) {
    this.stop()
    this.stream.write(icon + ' ' + text + '\r\n')
  }

  private _frame() {
    let frame = this.frames[this._frameIndex]
    this._frameIndex = ++this._frameIndex % this.frames.length
    return frame + ' ' + this.text
  }

  /**
   * 重新渲染文本
   */
  private _render() {
    this.clear()
    this.stream.write(this._frame())
  }
}

export = Spinner
