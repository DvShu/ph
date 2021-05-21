"use strict";
const color16s = [
    'black',
    'red',
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
    'white',
];
const styles = {
    bold: 1,
    italic: 3,
    underline: 4,
    inverse: 7,
    strikethrough: 9,
};
/**
 * 文本颜色
 * @param text      加颜色的文本
 * @param color255  颜色序列, 0 ~ 255 之间的颜色值
 * @returns 加上颜色字符的字符串
 */
const termColor = function (text, color255 = 255) {
    return `\x1b[38;5;${color255}m${text}\x1b[0m`;
};
/* eslint-disable */
for (let i in color16s) {
    termColor[color16s[i]] = function (text) {
        return `\x1b[3${i}m${text}\x1b[0m`;
    };
    termColor['bright' +
        (color16s[i].charAt(0).toUpperCase() +
            color16s[i].slice(1))] = (text) => {
        return `\x1b[9${i}m${text}\x1b[0m`;
    };
    termColor['bg' +
        (color16s[i].charAt(0).toUpperCase() +
            color16s[i].slice(1))] = function (text) {
        return `\x1b[4${i}m${text}\x1b[0m`;
    };
    termColor['bgBright' +
        (color16s[i].charAt(0).toUpperCase() +
            color16s[i].slice(1))] = (text) => {
        return `\x1b[10${i}m${text}\x1b[0m`;
    };
}
termColor.grey = termColor.gray = termColor.brightBlack;
termColor.bgGrey = termColor.bgGray = termColor.bgBrightBlack;
termColor.brightGrey = termColor.brightGray = termColor.white;
termColor.bgBrightGrey = termColor.bgBrightGray = termColor.bgWhite;
for (let style in styles) {
    termColor[style] = function (text) {
        return `\x1b[${styles[style]}m${text}\x1b[0m`;
    };
}
/* eslint-disable */
/**
 * 给文本添加多种样式集
 * @param text  文本
 * @param styls 样式集
 * @returns
 */
termColor.style = function (text, styls) {
    let prefixs = [];
    for (let styl of styls) {
        // 样式
        if (Object.prototype.hasOwnProperty.call(styles, styl)) {
            prefixs.push(`\x1b[${styles[styl]}m`);
        }
        else {
            // 颜色
            let isBg = styl.startsWith('bg'); // 是否是背景色
            let colorName = '';
            let prefixIndex = -1;
            if (styl.toLowerCase().includes('bright')) {
                // 明亮颜色
                colorName = styl.substring(isBg ? 8 : 6);
                prefixIndex = isBg ? 10 : 9;
            }
            else {
                colorName = isBg ? styl.substring(2) : styl;
                prefixIndex = isBg ? 4 : 3;
            }
            let colorIndex = color16s.indexOf(colorName.toLowerCase());
            if (colorIndex === -1) {
                throw new Error(`unknown style ${styl}`);
            }
            prefixs.push(`\x1b[${prefixIndex}${colorIndex}m`);
        }
    }
    return `${prefixs.join('')}${text}\x1b[0m`;
};
module.exports = termColor;
