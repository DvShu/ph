/**
 * 数据验证器
 */

// 默认的错误提示信息
const defaultMsgs = {
  mobile: '请输入正确的手机号',
  same: '两次输入不一致',
  required: '该字段为必填字段',
}
const defaultMsg = '请输入正确的数据'

// 一些常用的验证正则
const ruleRegexs = {
  /** 验证跟其余数据相等的正则，一般用于验证再次输入密码 */
  same: /^same:(.+)$/i,
  /** 验证手机号的正则表达式 */
  mobile: /^1[34578]d{9}$/,
  /** 非空验证的正则表达式 */
  required: /^\S{1}.*/,
}

// 规则比对函数
const ruleFns = {
  /** 验证必填 */
  required(val) {
    if (val == null) {
      return false
    }
    let str = String(val).trim()
    return str.length > 0
  },
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

/**
 * 数据验证器
 */
class Validator {
  public rules: { [index: string]: { rule: RegExp; message: string; sameKey?: string }[] }
  public constructor(schemas: {
    [index: string]: string | RegExp | (RegExp | string | { rule: string | RegExp; message?: string })[]
  }) {
    this.rules = {}
    for (let key in schemas) {
      if ({}.hasOwnProperty.call(schemas, key)) {
        let rules = []
        let rule = schemas[key]
        if (typeof rule === 'string') {
          rules = rules.concat(this._parseStringRule(rule))
        } else if (rule instanceof Array) {
          for (let ruleItem of rule) {
            if (typeof ruleItem === 'string') {
              rules = rules.concat(this._parseStringRule(ruleItem))
            } else if (ruleItem instanceof RegExp) {
              rules.push({ rule: ruleItem, message: defaultMsg })
            } else {
              let message = defaultMsg
              // eslint-disable-next-line
              if (typeof ruleItem.rule === 'string') {
                rules = rules.concat(this._parseStringRule(ruleItem.rule))
              } else {
                rules.push({ rule: ruleItem.rule, message: ruleItem.message || defaultMsg })
              }
            }
          }
        } else {
          rules.push({ rule, message: defaultMsg })
        }
        this.rules[key] = rules
      }
    }
  }

  private _parseStringRule(rule: string) {
    let rules = []
    let trule = rule.split('|')
    for (let r of trule) {
      let message = defaultMsg
      let rrule: RegExp
      let sameKey: string | undefined
      if (ruleRegexs.same.test(r)) {
        let m = r.match(ruleRegexs.same)
        if (m != null) {
          rrule = ruleRegexs.same
          sameKey = r.match(ruleRegexs.same)[1]
          message = defaultMsgs['same']
        }
      } else if (ruleRegexs.hasOwnProperty(r)) {
        rrule = ruleRegexs[r]
        message = defaultMsgs[r] || defaultMsg
      }
      rules.push({ rule: rrule, message: message, sameKey })
    }
    return rules
  }
}

export = Validator
