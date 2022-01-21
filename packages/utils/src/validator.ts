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

// 允许的内置 type
const validTypes = new Set(['string', 'boolean', 'number', 'float', 'int'])

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

const typeFns = {
  string(v: any) {
    return String(v)
  },
  boolean(v: any) {
    return Boolean(v)
  },
  number(v: any) {
    return Number(v)
  },
  int(v: any) {
    return parseInt(v, 10)
  },
  floag(v: any) {
    return parseFloat(v)
  },
}

interface RuleItem {
  rule: RegExp | ((v: any) => boolean)
  message: string
  sameKey?: string
}

class ValidateError extends Error {
  public name: string
  public constructor(msg: string) {
    super(msg)
    this.name = 'ValidateError'
  }
}

/**
 * 数据验证器，除了进行数据验证外，还可以同时进行数据转化
 */
class Validator {
  public rules: { [index: string]: RuleItem[] }
  public types: { [index: string]: string | ((v: any) => void) }
  /**
   * 构造数据验证转换器
   * @param schemas 配置验证转换规则
   */
  public constructor(
    schemas: {
      key: string
      type?: string | ((v: any) => void)
      rules:
        | string
        | RegExp
        | ((v: any) => boolean)
        | (
            | RegExp
            | string
            | ((v: any) => boolean)
            | { rule: string | RegExp | ((v: any) => boolean); message?: string }
          )[]
    }[],
  ) {
    let parsedRules = {}
    let types = {}
    for (let schema of schemas) {
      // 解析 types 用于进行数据类型转换
      if (typeof schema.type === 'function') {
        types[schema.key] = schema.type
      } else {
        types[schema.key] = validTypes.has(schema.type || '') ? schema.type : 'string'
      }
      // 解析规则
      let rules = []
      let rule = schema.rules
      if (typeof rule === 'string') {
        rules = rules.concat(this._parseStringRule(rule))
      } else if (rule instanceof Array) {
        for (let ruleItem of rule) {
          if (typeof ruleItem === 'string') {
            rules = rules.concat(this._parseStringRule(ruleItem))
          } else if (ruleItem instanceof RegExp || typeof ruleItem === 'function') {
            rules.push({ rule: ruleItem, message: defaultMsg })
          } else {
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
      parsedRules[schema.key] = rules
    }
    this.types = types
    this.rules = parsedRules
  }

  /**
   * 进行数据验证，同时根据 type 进行数据类型转换
   * @param data 待验证的数据
   * @returns
   */
  public validate<T>(data: any) {
    return new Promise((resolve, reject) => {
      let errMsg = ''
      let resData: any = {}
      for (let key in this.rules) {
        if ({}.hasOwnProperty.call(this.rules, key)) {
          errMsg = this._validateRule(this.rules[key], data[key], data)
          if (errMsg === '') {
            resData[key] = this._conversionType(this.types[key], data[key])
          } else {
            errMsg = errMsg.replace('%s', key)
            break
          }
        }
      }
      if (errMsg === '') {
        resolve(resData as T)
      } else {
        reject(new ValidateError(errMsg))
      }
    })
  }

  /**
   * 只验证指定 key 的数据格式
   * @param key   指定待验证的 key
   * @param value 待验证的数据
   */
  public validateKey(key: string, value: any) {
    return new Promise((resolve, reject) => {
      let keyRules = this.rules[key]
      let errMsg = this._validateRule(keyRules, value, null)
      if (errMsg === '') {
        resolve(this._conversionType(this.types[key], value))
      } else {
        errMsg = errMsg.replace('%s', key)
        reject(new ValidateError(errMsg))
      }
    })
  }

  private _conversionType(type: string | ((v: any) => any), v: any) {
    if (typeof type === 'function') {
      return type(v)
    } else {
      return typeFns[type](v)
    }
  }

  private _validateRule(rules: RuleItem[], value: any, data?: any) {
    let errMsg = ''
    for (let rule of rules) {
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
      } else {
        if (!ruleFns.pattern(rule.rule, value)) {
          errMsg = rule.message
        }
      }
      if (errMsg !== '') {
        break
      }
    }
    return errMsg
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
