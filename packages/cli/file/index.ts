/** 文件操作相关的命令函数类 */
import fs from 'fs/promises';
import path from 'path';

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
