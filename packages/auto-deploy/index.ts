#!/usr/bin/env node

import path = require('path')
import AdmZip = require('adm-zip')
import fileUtils = require('ph-utils/lib/file')
import commander = require('commander')
const program = commander.program
import pkg = require('./package.json')
import enquirer = require('enquirer')
import Spinner = require('ph-terminal-spinner')
import mm = require('micromatch')
import undici = require('undici')
import fs = require('fs')

const sourcePath = process.cwd() // path.normalize('E:\\workspace1\\vue-app\\packages\\yz-hjfs')

async function readJson(jsonPath: string) {
  let jsonData = {}
  try {
    jsonData = await fileUtils.readJSON(jsonPath)
  } catch (error) {
    jsonData = {}
  }
  return jsonData
}

function fromFile(filePath: string) {
  return new Promise((resolve, reject) => {
    let s = fs.createReadStream(filePath)
    let chunks: Buffer[] = []
    s.on('data', (chunk: Buffer) => {
      chunks.push(chunk)
    })
    s.on('end', () => {
      let buf = Buffer.concat(chunks)
      resolve(new undici.File([buf], 'deploy.zip'))
    })
    s.on('error', (err) => {
      reject(err)
    })
  })
}

function traverseDir(dirPath: string): Promise<string[]> {
  return new Promise((resolve) => {
    const l: string[] = []
    fileUtils.traverseDir(
      dirPath,
      (filename: string) => {
        const relativePath = path.relative(dirPath, filename)
        l.push(relativePath)
      },
      () => {
        resolve(l)
      },
    )
  })
}

// 版本
program.name(pkg.name).description(pkg.description).version(pkg.version)

program
  .command('init')
  .description('初始化自动化部署配置')
  .action(async () => {
    let projectPkg: any = await readJson(path.join(sourcePath, 'package.json'))
    const response = await enquirer.prompt<any>([
      {
        type: 'input',
        name: 'name',
        message: '请输入项目名称?',
        initial: projectPkg.name,
      },
      {
        type: 'select',
        name: 'type',
        message: '请选择项目类型',
        initial: 0,
        choices: [{ name: 'normal', message: '普通项目' }],
      },
      {
        type: 'input',
        name: 'buildedPath',
        message: '待打包的子目录(基于当前目录)，在前端工程中通常为 dist',
        initial: 'dist',
      },
      {
        type: 'list',
        name: 'files',
        message: '包含的文件或目录列表,跟 .gitignore 规则类似(多个规则以 , 分隔)',
        initial: '**,!*.zip',
      },
      {
        type: 'confirm',
        name: 'packByUpdate',
        message: '是否根据修改时间进行增量打包部署(只部署已经修改过的文件[修改时间发生变化])',
        initial: true,
      },
      {
        type: 'input',
        name: 'url',
        message: '部署地址，填写部署了 auto-deploy 后端项目的服务器的部署的地址',
      },
      {
        type: 'input',
        name: 'htmlPath',
        message: 'html文件在服务器上的地址',
      },
      {
        type: 'input',
        name: 'assetsPath',
        message: '其它资源文件在服务器的地址',
      },
    ])
    response.urlParam = {
      name: response.name,
      htmlPath: response.htmlPath,
      assetsPath: response.assetsPath,
    }
    delete response.htmlPath
    delete response.assetsPath
    await fileUtils.write(path.join(sourcePath, 'deploy.json'), response)
    let spinner = new Spinner()
    spinner.succeed(
      '初始化自动化部署成功！请将 "deploy":"deploy d" 或者 "deploy": "vite build & deploy d" 添加到 package.json 的 scripts 命令下',
    )
  })

program
  .command('d')
  .description('部署项目')
  .action(async () => {
    let spinner = new Spinner()
    spinner.start('正在进行项目打包……')
    const deployinfoPath = path.join(sourcePath, 'deployinfo.json')
    let r: any = await Promise.all([readJson(path.join(sourcePath, 'deploy.json')), readJson(deployinfoPath)])
    let config: any = {
      name: '',
      type: 'normal',
      buildedPath: 'dist',
      files: [],
      packByUpdate: true,
      ...r[0],
    }
    let zip = new AdmZip()
    // 遍历目标文件夹
    const targetPath = path.join(sourcePath, config.buildedPath)
    let matchFiles = await traverseDir(targetPath)
    matchFiles = mm(matchFiles, config.files)
    let uc = 0
    for (let mf of matchFiles) {
      let dirPath = path.dirname(mf)
      let absPath = path.join(targetPath, mf)
      // 配置了按修改时间按需打包
      if (config.packByUpdate) {
        // 验证文件是否修改
        let currEtag = await fileUtils.statTag(absPath)
        if ((r[1][mf] || '') !== currEtag) {
          r[1][mf] = currEtag
          zip.addLocalFile(absPath, dirPath === '.' ? '' : dirPath)
          uc++
        }
      } else {
        zip.addLocalFile(absPath, dirPath === '.' ? '' : dirPath)
        uc++
      }
    }
    fileUtils.write(deployinfoPath, r[1]).then(() => {})
    if (uc > 0) {
      let zipPath = path.join(sourcePath, config.buildedPath, 'deploy.zip')
      zip.writeZip(zipPath)
      spinner.succeed('项目打包完成！')
      spinner.start('正在上传压缩包到服务器进行部署……')
      const formdata = new undici.FormData()
      // eslint-disable-next-line
      for (let key in config.urlParam) {
        formdata.set(key, config.urlParam[key])
      }
      let file = await fromFile(zipPath)
      formdata.set('file', file)
      undici
        .fetch(config.url, {
          body: formdata,
          method: 'post',
        })
        .then((res) => {
          if (res.ok) {
            return res.json()
          } else {
            return Promise.reject(new Error(`${res.status} -- ${res.statusText}`))
          }
        })
        .then((res: any) => {
          if (res.code === 10000) {
            spinner.succeed('部署成功！')
          } else {
            spinner.fail(`部署失败：${res.message}`)
          }
        })
        .catch((err) => {
          spinner.fail(`部署失败`)
          console.error(err)
        })
    } else {
      spinner.warn('没有文件改变，不需要进行打包部署！')
    }
  })

program.parse(process.argv)
