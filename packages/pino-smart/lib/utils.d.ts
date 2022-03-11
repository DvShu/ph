export declare function isObject(log: any): boolean;
/**
 * 格式化日志时间
 * @param log
 */
export declare function prettifyTime(log: any): any;
export declare function prettifyString(msg: string | null, color?: string): any;
export declare function prettifyHttp(log: any): any;
export declare function prettifyLevelMsg(msg: string, level?: string): any;
export declare function prettifyMessage(log: any): any;
/**
 * Prettifies an error string into a multi-line format.
 * @param {object} input
 * @param {string} input.keyName The key assigned to this error in the log object
 * @param {string} input.lines The STRINGIFIED error. If the error field has a
 *  custom prettifier, that should be pre-applied as well
 * @param {string} input.ident The indentation sequence to use
 * @param {string} input.eol The EOL sequence to use
 */
export declare function prettifyError(err: any): string;
