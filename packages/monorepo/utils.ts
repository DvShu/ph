import https = require('https')
import path = require('path')
import fileUtils = require('ph-utils/lib/file')

/**
 * 检查依赖的库的版本信息
 * @param name
 * @returns
 */
export function checkDev(name: string): Promise<[string, string]> {
  return new Promise((resolve, reject) => {
    https
      .get(`https://registry.npmmirror.com/${name}/latest`, (res) => {
        let resData = ''
        const statusCode = res.statusCode as number
        res.setEncoding('utf8')
        res.on('data', (chunk) => {
          resData += chunk
        })
        res.on('end', () => {
          if (statusCode >= 200 && statusCode < 300) {
            const pkgInfo = JSON.parse(resData)
            resolve([pkgInfo.name, pkgInfo.version])
          } else {
            reject(new Error(statusCode + ' & ' + (res as any).statusText))
          }
        })
      })
      .on('error', (e) => {
        reject(e)
      })
  })
}

/** 构建文件 */
export function createFiles(
  template: Map<string, any>,
  queues: any[],
  target: string,
  templateVars: { [index: string]: string }
): void {
  for (const [k, v] of template.entries()) {
    if (k.startsWith('fr:')) {
      const nv = v.replace(/{{(.+?)}}*/g, (_m: string, p1: string) => {
        return templateVars[p1]
      })
      queues.push(fileUtils.write(path.join(target, k.substring(3)), nv))
    } else {
      queues.push(fileUtils.write(path.join(target, k), v))
    }
  }
}

/** 检查依赖，重新构建 package.json */
export async function createPackage(
  name: string,
  vue: boolean,
  template: any
): Promise<any> {
  const d = new Set<string>()
  const dd = new Set(['typescript', 'vite'])
  if (vue) {
    d.add('vue')
    dd.add('@vitejs/plugin-vue')
    dd.add('vue-tsc')
  }
  const queues = []
  for (const n of d.values()) {
    queues.push(checkDev(n))
  }
  for (const n of dd.values()) {
    queues.push(checkDev(n))
  }
  const pkgs = await Promise.all(queues)
  const dj: { [index: string]: string } = {}
  const ddj: { [index: string]: string } = {}
  for (const pkg of pkgs) {
    if (d.has(pkg[0])) {
      dj[pkg[0]] = `^${pkg[1]}`
    } else {
      ddj[pkg[0]] = `^${pkg[1]}`
    }
  }
  template.name = name
  template.repository.url = `git+https://gitee.com/towardly/${name}.git`
  template.dependencies = dj
  template.devDependencies = ddj
  return template
}
