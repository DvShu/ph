/**
 * 数据验证器
 */

// 默认的错误提示信息
const defaultMsgs: { [index: string]: string } = {
  mobile: '请输入正确的手机号',
  same: '两次输入不一致',
  required: '%s为必填字段',
};
const defaultMsg = '请输入正确的数据';

// 一些常用的验证正则
const ruleRegexs: any = {
  /** 验证跟其余数据相等的正则，一般用于验证再次输入密码 */
  same: /^same:(.+)$/i,
  /** 验证手机号的正则表达式 */
  mobile: /^1[34578]\d{9}$/,
  /** 非空验证的正则表达式 */
  required: /^\S{1}.*/,
};

// 规则比对函数
const ruleFns = {
  /** 验证相等 */
  same(val1: string, val2: string) {
    return val2 === val1;
  },
  /** 正则匹配 */
  pattern(regex: RegExp, val: string) {
    if (val == null) {
      return false;
    }
    return regex.test(String(val));
  },
};

interface RuleItem {
  rule: RegExp | ((v: any) => boolean) | 'required';
  message: string;
  sameKey?: string;
}

class ValidateError extends Error {
  public name: string;
  public key: string;
  public constructor(key: string, msg: string) {
    super(msg);
    this.name = 'ValidateError';
    this.key = key;
  }
}

export type RuleType =
  | string
  | RegExp
  | ((v: any) => boolean)
  | (RegExp | string | ((v: any) => boolean) | { rule: string | RegExp | ((v: any) => boolean); message?: string });

export interface SchemaType {
  key: string;
  required?: boolean;
  type?: string | ((v: any) => void);
  rules?: RuleType[];
  message?: string;
}

/**
 * 数据验证器，除了进行数据验证外，还可以同时进行数据转化
 */
class Validator {
  public rules: { [index: string]: RuleItem[] };
  /**
   * 构造数据验证转换器
   * @param schemas 配置验证转换规则
   */
  public constructor(schemas: SchemaType[]) {
    let parsedRules: any = {};
    for (let schema of schemas) {
      // 解析规则
      let rules: any[] = [];
      let rule = schema.rules;
      if (rule != null) {
        if (typeof rule === 'string') {
          rules = rules.concat(this._parseStringRule(rule, schema.message));
        } else if (rule instanceof Array) {
          for (let ruleItem of rule) {
            if (typeof ruleItem === 'string') {
              rules.push(...this._parseStringRule(ruleItem, schema.message));
            } else if (ruleItem instanceof RegExp || typeof ruleItem === 'function') {
              rules.push({
                rule: ruleItem,
                message: schema.message || defaultMsg,
              });
            } else {
              if (typeof ruleItem.rule === 'string') {
                rules.push(...this._parseStringRule(ruleItem.rule, ruleItem.message));
              } else {
                rules.push({
                  rule: ruleItem.rule,
                  message: ruleItem.message || defaultMsg,
                });
              }
            }
          }
        } else {
          rules.push({ rule, message: defaultMsg });
        }
      }
      if (schema.required === true && (rules == null || rules.findIndex((r) => r.rule === 'required') === -1)) {
        rules.push(...this._parseStringRule('required', schema.message));
      }
      parsedRules[schema.key] = rules;
    }
    this.rules = parsedRules;
  }

  /**
   * 进行数据验证
   * @param data 待验证的数据
   * @returns
   */
  public validate(data: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let errMsg = '';
      let errKey = '';
      for (let key in this.rules) {
        // eslint-disable-next-line no-prototype-builtins
        if (this.rules.hasOwnProperty(key)) {
          errMsg = this._validateRule(this.rules[key], data[key], data);
          if (errMsg !== '') {
            errKey = key;
            errMsg = errMsg.replace('%s', key);
            break;
          }
        }
      }
      if (errMsg === '') {
        resolve(true);
      } else {
        reject(new ValidateError(errKey, errMsg));
      }
    });
  }

  /**
   * 只验证指定 key 的数据格式
   * @param key   指定待验证的 key
   * @param value 待验证的数据
   */
  public validateKey(key: string, value: any, data?: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let keyRules = this.rules[key];
      let errMsg = this._validateRule(keyRules, value, data);
      if (errMsg !== '') {
        errMsg = errMsg.replace('%s', key);
        reject(new ValidateError(key, errMsg));
      } else {
        resolve(true);
      }
    });
  }

  private _validateRule(rules: RuleItem[], value: string, data?: any) {
    let errMsg = '';
    for (let rule of rules) {
      // 如果数据为空，则判断是否是必填
      if (rule.rule === 'required') {
        if (value == null || !ruleFns.pattern(ruleRegexs.required, value)) {
          errMsg = rule.message;
        }
      }
      if (typeof rule.rule === 'function') {
        if (!rule.rule(value)) {
          errMsg = rule.message;
        }
      } else if (rule.sameKey != null) {
        if (data != null) {
          if (!ruleFns.same(value, data[rule.sameKey])) {
            errMsg = rule.message;
          }
        }
      } else if (rule.rule === 'required') {
        if (!ruleFns.pattern(ruleRegexs.required, String(value))) {
          errMsg = rule.message;
        }
      } else {
        if (!ruleFns.pattern(rule.rule, String(value))) {
          errMsg = rule.message;
        }
      }

      if (errMsg !== '') {
        break;
      }
    }
    return errMsg;
  }

  private _parseStringRule(rule: string, ruleErrMsg?: string) {
    let rules: any[] = [];
    let trule = rule.split('|');
    for (let r of trule) {
      let message = ruleErrMsg;
      let rrule: RegExp | 'required' | null = null;
      let sameKey: string | undefined;
      if (ruleRegexs.same.test(r)) {
        let m = r.match(ruleRegexs.same);
        if (m != null) {
          rrule = ruleRegexs.same;
          let m = r.match(ruleRegexs.same);
          if (m != null) {
            sameKey = m[1];
          }
          message = message || defaultMsgs['same'];
        }
      } else if (rule === 'required') {
        rrule = 'required';
        message = message || ruleErrMsg || defaultMsgs.required;
        // eslint-disable-next-line no-prototype-builtins
      } else if (ruleRegexs.hasOwnProperty(r)) {
        rrule = ruleRegexs[r];
        message = message || defaultMsgs[r];
      }
      rules.push({ rule: rrule, message: message, sameKey });
    }
    return rules;
  }
}

export default Validator;
