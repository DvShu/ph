/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * 数据验证器
 */

// 默认的错误提示信息
const defaultMsgs = {
  mobile: '请输入正确的手机号',
  same: '两次输入不一致',
  required: '%s为必填字段',
}
const defaultMsg = '请输入正确的数据'

// 一些常用的验证正则
const ruleRegexs = {
  /** 验证跟其余数据相等的正则，一般用于验证再次输入密码 */
  same: /^same:(.+)$/i,
  /** 验证手机号的正则表达式 */
  mobile: /^1[34578]\d{9}$/,
  /** 非空验证的正则表达式 */
  required: /^\S{1}.*/,
}

// 规则比对函数
const ruleFns = {
  /** 验证相等 */
  same(val1, val2) {
    return val2 === val1
  },
  /** 正则匹配 */
  pattern(regex: RegExp, val) {
    if (val == null) {
      return false
    }
    return regex.test(String(val))
  },
}

interface RuleItem {
  rule: RegExp | ((v: any) => boolean) | 'required'
  message: string
  sameKey?: string
}

class ValidateError extends Error {
  public name: string
  public key: string
  public constructor(key: string, msg: string) {
    super(msg)
    this.name = 'ValidateError'
    this.key = key
  }
}

export type RuleType =
  | string
  | RegExp
  | ((v: any) => boolean)
  | (
      | RegExp
      | string
      | ((v: any) => boolean)
      | { rule: string | RegExp | ((v: any) => boolean); message?: string }
    )

export interface SchemaType {
  key: string
  required?: boolean
  type?: string | ((v: any) => void)
  rules: RuleType[]
}

/**
 * 数据验证器，除了进行数据验证外，还可以同时进行数据转化
 */
class Validator {
  public rules: { [index: string]: RuleItem[] }
  /**
   * 构造数据验证转换器
   * @param schemas 配置验证转换规则
   */
  public constructor(schemas: SchemaType[]) {
    let parsedRules = {}
    for (let schema of schemas) {
      // 解析规则
      let rules = []
      let rule = schema.rules
      if (typeof rule === 'string') {
        rules = rules.concat(this._parseStringRule(rule))
      } else if (rule instanceof Array) {
        for (let ruleItem of rule) {
          if (typeof ruleItem === 'string') {
            rules.push(...this._parseStringRule(ruleItem))
          } else if (
            ruleItem instanceof RegExp ||
            typeof ruleItem === 'function'
          ) {
            rules.push({ rule: ruleItem, message: defaultMsg })
          } else {
            if (typeof ruleItem.rule === 'string') {
              rules.push(
                ...this._parseStringRule(ruleItem.rule, ruleItem.message)
              )
            } else {
              rules.push({
                rule: ruleItem.rule,
                message: ruleItem.message || defaultMsg,
              })
            }
          }
        }
      } else {
        rules.push({ rule, message: defaultMsg })
      }
      if (
        schema.required === true &&
        rules.findIndex((r) => r.rule === 'required') === -1
      ) {
        rules.push(this._parseStringRule('required'))
      }
      parsedRules[schema.key] = rules
    }
    this.rules = parsedRules
  }

  /**
   * 进行数据验证
   * @param data 待验证的数据
   * @returns
   */
  public validate(data: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let errMsg = ''
      let errKey = ''
      for (let key in this.rules) {
        if ({}.hasOwnProperty.call(this.rules, key)) {
          errMsg = this._validateRule(this.rules[key], data[key], data)
          if (errMsg !== '') {
            errKey = key
            errMsg = errMsg.replace('%s', key)
            break
          }
        }
      }
      if (errMsg === '') {
        resolve(true)
      } else {
        reject(new ValidateError(errKey, errMsg))
      }
    })
  }

  /**
   * 只验证指定 key 的数据格式
   * @param key   指定待验证的 key
   * @param value 待验证的数据
   */
  public validateKey(key: string, value: any, data?: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let keyRules = this.rules[key]
      let errMsg = this._validateRule(keyRules, value, data)
      if (errMsg !== '') {
        errMsg = errMsg.replace('%s', key)
        reject(new ValidateError(key, errMsg))
      } else {
        resolve(true)
      }
    })
  }

  private _validateRule(rules: RuleItem[], value: string, data?: any) {
    let errMsg = ''
    for (let rule of rules) {
      // 如果数据为空，则判断是否是必填
      if (value == null || !ruleFns.pattern(ruleRegexs.required, value)) {
        if (rule.rule === 'required') {
          errMsg = rule.message
        }
      } else {
        if (typeof rule.rule === 'function') {
          if (!rule.rule(value)) {
            errMsg = rule.message
          }
        } else if (rule.sameKey != null) {
          if (data != null) {
            if (!ruleFns.same(value, data[rule.sameKey])) {
              errMsg = rule.message
            }
          }
        } else if (rule.rule === 'required') {
          if (!ruleFns.pattern(ruleRegexs.required, String(value))) {
            errMsg = rule.message
          }
        } else {
          if (!ruleFns.pattern(rule.rule, String(value))) {
            errMsg = rule.message
          }
        }
      }

      if (errMsg !== '') {
        break
      }
    }
    return errMsg
  }

  private _parseStringRule(rule: string, ruleErrMsg?: string) {
    let rules = []
    let trule = rule.split('|')
    for (let r of trule) {
      let message = defaultMsg
      let rrule: RegExp | 'required'
      let sameKey: string | undefined
      if (ruleRegexs.same.test(r)) {
        let m = r.match(ruleRegexs.same)
        if (m != null) {
          rrule = ruleRegexs.same
          sameKey = r.match(ruleRegexs.same)[1]
          message = defaultMsgs['same']
        }
      } else if (rule === 'required') {
        rrule = 'required'
        message = ruleErrMsg || defaultMsgs.required
      } else if (Object.prototype.hasOwnProperty.call(ruleRegexs, r)) {
        rrule = ruleRegexs[r]
        message = defaultMsgs[r] || defaultMsg
      }
      message = ruleErrMsg || message
      rules.push({ rule: rrule, message: message, sameKey })
    }
    return rules
  }
}

// @ts-ignore: Unreachable code error
export = Validator
