/** laytpl 模板渲染引擎 */
declare module 'laytpl' {
  /**
   * 渲染模板文件
   * @param filename  模板文件路径
   * @param options   渲染的数据
   * @param fn        标准的 nodejs 回调
   */
  export const renderFile: (filename: string, options: any, fn: (err, tpl) => void) => void;
}
