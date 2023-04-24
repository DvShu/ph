/** 文件操作相关的命令函数类 */
import fsc from 'node:fs';
import path from 'path';

const fs = fsc.promises;

/**
 * 删除目录或者文件
 * @param dirs 路径
 */
export async function rm(dirs: string[]) {
  const queues = [];
  for (let i = 0, len = dirs.length; i < len; i++) {
    queues.push(
      fs.rm(dirs[i], {
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
  return c == null ? null : JSON.parse(c);
}

/**
 * 读取文件内容
 * @param filepath 文件路径
 * @returns
 */
export async function read(filepath: string): Promise<string | null> {
  let content = null;
  try {
    content = await fs.readFile(path.resolve(filepath), 'utf-8');
  } catch (err) {
    content = null;
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

/**
 * 检查文件权限
 * @param filepath  文件目录
 * @param mode      模式, 默认为检查文件是否存在
 */
export async function access(filepath: string, mode?: number) {
  await fs.access(filepath, mode);
}

function fnDone(done?: () => void) {
  return setTimeout(() => {
    setImmediate(() => {
      process.nextTick(() => {
        Promise.resolve().then(() => {
          if (typeof done === 'function') {
            done();
          }
        });
      });
    });
  }, 10);
}

/**
 * 遍历文件夹
 * @param dir 待遍历的目录
 * @param callback 遍历到文件后的回调
 * @param done 遍历完成后的回调
 * @param ignorePath  待忽略的文件夹
 */
export function traverseDir(dir: string, callback?: (filename: string) => void, done?: () => void) {
  let t: any = -1; // 定时任务，简单延迟作为遍历完成计算
  function list(dr: string, cb?: (filename: string) => void, d?: () => void) {
    fsc.readdir(path.resolve(dr), { withFileTypes: true }, (err, files) => {
      if (err && err.errno === -4052) {
        // 本身就是文件
        if (typeof cb === 'function') cb(dr);
        if (typeof d === 'function') d(); // 遍历完成
      } else {
        for (let i = 0, len = files.length; i < len; i++) {
          const file = files[i];
          if (file.isFile()) {
            if (typeof cb === 'function') cb(path.join(dr, file.name));
            clearTimeout(t);
            t = fnDone(done);
          } else {
            // 文件夹
            list(path.join(dr, file.name), cb, d);
          }
        }
      }
    });
  }
  list(dir, callback, done);
}
