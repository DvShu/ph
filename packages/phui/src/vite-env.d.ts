// / <reference types="vite/client" />

interface MessageConfig {
  class?: string
  type?: string
  duration?: number
  /** 显示的消息 */
  message?: string
}

interface MessageInstance {
  info: (msg: string | MessageConfig) => void
  success: (msg: string | MessageConfig) => void
  warn: (msg: string | MessageConfig) => void
  /**
   * 显示错误信息
   * @property msg: string 错误信息
   * @property customClass: string 自定义的 class
   */
  error: (msg: string | MessageConfig) => void
  (options: string | MessageConfig): void
  [index: string]: any
}

declare let $message: MessageInstance

interface Window {
  /** 显示 Message 提示信息 */
  $message: MessageInstance
}
