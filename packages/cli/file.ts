/** 文件操作相关的命令函数类 */
import fs from 'fs/promises';
import path from 'path';
import { isBlank } from './util.js';

/**
 * 删除目录或者文件
 * @param dirs 路径
 */
export async function rm(dirs: string[]) {
  const queues = [];
  for (let i = 0, len = dirs.length; i < len; i++) {
    queues.push(
      fs.rm(path.join(process.cwd(), dirs[i]), {
        force: true,
        recursive: true,
      }),
    );
  }
  await Promise.all(queues);
}

/**
 * 读取文件内容为JSON格式
 * @param filepath 读取的文件路径
 * @returns Promise<any>
 */
export async function readJSON<T>(filepath: string): Promise<T> {
  let c = await read(filepath);
  return isBlank(c) ? null : JSON.parse(await read(filepath));
}

/**
 * 读取文件内容
 * @param filepath 文件路径
 * @returns
 */
export async function read(filepath: string): Promise<string> {
  let content = '';
  try {
    content = await fs.readFile(path.resolve(filepath), 'utf-8');
  } catch (err) {
    content = '';
  }
  return content;
}

/** 写入 JSON 格式的数据到文件
 * @param file 待写入的文件
 * @param data 待写入的数据
 * @param opts 写入配置
 * @property opts.json 是否写入 JSON 格式的数据，写入数据时对数据进行 JSON 格式化，默认为：true
 * @property opts.format 是否在写入 json 数据时，将 JSON 数据格式化2个空格写入, 默认为 true
 */
export function write(file: string, data: any, opts?: { json: boolean; format: boolean }) {
  let writeData: string = data.toString();
  opts = { json: true, format: true, ...(opts || {}) };
  if (opts.json === true && typeof data === 'object') {
    writeData = JSON.stringify(data, null, opts.format === true ? 2 : 0);
  }
  return fs.writeFile(path.resolve(file), writeData);
}
