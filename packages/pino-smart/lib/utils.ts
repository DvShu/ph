import * as colors from 'ansi-colors';
/**
 * 不足位数, 前位补 0
 * @param s 日期数字
 * @param l 截取位数
 * @returns {string}  补0后的日期数字
 */
function p(s: string, l = 2) {
  /*
   * 由于年份最多为4为，所以前面先添3个0
   * slice() 从后开始提前字符串
   */
  return ('000' + s).slice(l * -1);
}

export function isObject(log: any) {
  return Object.prototype.toString.apply(log) === '[object Object]';
}

/**
 * 格式化日志时间
 * @param log
 */
export function prettifyTime(log: any) {
  const date = new Date(log.time || Date.now());
  const hours = p(date.getHours().toString());
  const minutes = p(date.getMinutes().toString());
  const seconds = p(date.getSeconds().toString());
  return colors.white(hours + ':' + minutes + ':' + seconds);
}

export function prettifyString(msg: string | null, color = 'white') {
  if (msg == null) {
    return '';
  }
  return (colors as any)[color](msg);
}

export function prettifyHttp(log: any) {
  // 格式化请求日志
  const req = log.req;
  const res = log.res;
  let httpRes = [];
  const statusCode = res ? res.statusCode : log.statusCode;
  if (statusCode) {
    httpRes.push(statusCode);
  }
  const responseTime = log.responseTime ? parseInt(log.responseTime, 10) + 'ms' : '';
  if (responseTime !== '') {
    httpRes.push(responseTime);
  }
  const method = req ? req.method : log.method;
  if (method) {
    httpRes.push(method);
  }
  const contentLength = log.contentLength;
  if (contentLength) {
    httpRes.push(contentLength);
  }
  const url = req ? req.url : log.url;
  if (url) {
    httpRes.push(url);
  }
  if (httpRes.length > 0) {
    return prettifyString(httpRes.join(' '));
  }
  return '';
}

export function prettifyLevelMsg(msg: string, level = 'info') {
  let pretty = colors.blueBright(msg);
  if (level === 'error') pretty = colors.red(msg);
  if (level === 'trace') pretty = colors.white(msg);
  if (level === 'warn') pretty = colors.yellow(msg);
  if (level === 'debug') pretty = colors.magenta(msg);
  if (level === 'fatal') pretty = colors.cyan(msg);
  return pretty;
}

export function prettifyMessage(log: any) {
  const msg = log.msg || log.message || log.sql;
  return colors.magenta('-- ') + prettifyLevelMsg(msg, log.level);
}

/**
 * Prettifies an error string into a multi-line format.
 * @param {object} input
 * @param {string} input.keyName The key assigned to this error in the log object
 * @param {string} input.lines The STRINGIFIED error. If the error field has a
 *  custom prettifier, that should be pre-applied as well
 * @param {string} input.ident The indentation sequence to use
 * @param {string} input.eol The EOL sequence to use
 */
export function prettifyError(err: any) {
  return '\n' + colors.redBright(err.stack);
}
