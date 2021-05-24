/// <reference types="node" />
import readline = require('readline');
/**
 * 帧动画配置项
 */
interface AnimStepsOption {
    /**
     * 定义帧动画的每一帧字符
     */
    frames: string[];
    /**
     * 定义帧动画的过渡时间
     */
    interval: number;
}
/**
 * 命令行加载提示类
 */
declare class Spinner {
    /**
     * 命令行提示文本
     */
    text: string;
    /**
     * 配置动画
     */
    animSteps: AnimStepsOption;
    /**
     * 获取输入输出读取写入
     */
    rl: readline.Interface;
    private _interval;
    private _frameIndex;
    private _lastText;
    /**
     * 构造命令行提示器
     * @param text 提示文本
     */
    constructor(text: string);
    /**
     * 清除之前的渲染
     */
    clear(): void;
    /**
     * 开启模拟加载动画
     */
    start(): void;
    /**
     * 停止动画，更改图标为 √，重置文本
     * @param {String} text 显示文本
     */
    succeed(text?: string): void;
    /**
     * 停止动画，更改图标为 ×，重置文本
     * @param {String} text
     */
    fail(text?: string): void;
    /**
     * 停止加载动画
     */
    stop(): void;
    private _resetStatus;
    /**
     * 重新渲染文本
     * @param text 待渲染的文本
     */
    private _render;
}
declare const _default: (text: string) => Spinner;
/**
 * fdsafds
 */
export = _default;
