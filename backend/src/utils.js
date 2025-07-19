import fs from 'node:fs'

import { Downloader } from 'nodejs-file-downloader'
import decompress from 'decompress'

export function mkDir(...paths) {
  const dir = paths.join('/')
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

export async function download(url, filename, logger) {
  if (fs.existsSync(filename)) {
    logger.log(`downloading skipped, because ${filename} already exists`)
    return
  }
  const downloader = new Downloader({
    url,
    fileName: filename,
    onProgress: function (percentage, chunk, remainingSize) {
      logger.logReplace(`downloading ${url}: ${percentage}%`)
    }
  })
  await downloader.download()
}

export async function unzip(filename, extractDir, logger) {
  if (fs.existsSync(extractDir)) {
    logger.log(`unzipping skipped, because directory ${extractDir} already exists`)
  } else {
    logger.log(`unzipping ${file} to directory ${extractDir}`)
    await decompress(filename, extractDir)
  }
}

