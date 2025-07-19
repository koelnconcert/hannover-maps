import fs from 'node:fs'
import os from 'node:os'
import { execSync } from 'node:child_process'

import { Downloader } from 'nodejs-file-downloader'
import logUpdate from 'log-update'
import decompress from 'decompress'
import spawn from 'nano-spawn'

import sources from './sources.js'

// console.debug(JSON.stringify(sources, null, 2))

const DOWNLOAD_DIR = 'download/dop'
const TILES_BASE_DIR = 'public/tiles/dop'
fs.mkdirSync(DOWNLOAD_DIR, { recursive: true })
fs.mkdirSync(TILES_BASE_DIR, { recursive: true })

const tiledriverForExtension = {
  webp: 'WEBP',
  jpg: 'JPEG'
}

const _log = (f, breadcrumbs, msg) => f(breadcrumbs.join('/') + ' > ' + msg)
const log = (...args) => _log(console.log, ...args)
const logReplace = (...args) => _log(logUpdate, ...args)

for (const [sourceId, source] of Object.entries(sources)) {
  log([sourceId], `"${source.name}"`)
  for (const [year, yearObject] of Object.entries(source.years)) {
    const logPrefix = [sourceId, year]
    for (const [part, partObject] of Object.entries(yearObject.parts)) {
      const logPrefixPart = logPrefix.concat(part)
      const name = year + '_' + part
      const file = name + '.zip'
      const fullFilename = DOWNLOAD_DIR + '/' + file

      if (fs.existsSync(fullFilename)) {
        log(logPrefixPart, `downloading skipped, because ${file} already exists`)
      } else {
        const url = partObject.downloadUrl
        const downloader = new Downloader({
          url,
          directory: DOWNLOAD_DIR,
          fileName: file,
          onProgress: function (percentage, chunk, remainingSize) {
            logReplace(logPrefixPart, `downloading ${url}: ${percentage}%`)
          }
        })
        await downloader.download()
      }

      const extractDir = DOWNLOAD_DIR + '/' + name
      if (fs.existsSync(extractDir)) {
        log(logPrefixPart, `unzipping skipped, because directory ${name} already exists`)
      } else {
        log(logPrefixPart, `unzipping ${file} to directory ${name}`)
        await decompress(fullFilename, extractDir)
      }
    }

    const vrtfile = year + '.vrt'
    log(logPrefix, 'creating ' + vrtfile)
    execSync(`gdalbuildvrt ${vrtfile} ${year}_*/*.jpg`, { cwd: DOWNLOAD_DIR })

    const tileConfig = yearObject.tiles

    const processes = Math.floor(os.cpus().length * 3 / 4 )
    const tiledriver = tiledriverForExtension[tileConfig.fileExtension]
    const tilesDir = TILES_BASE_DIR + '/' + year
    log(logPrefix, `converting to ${tiledriver} tiles with ${processes} threads to directory ${tilesDir}`)
    fs.mkdirSync(tilesDir, { recursive: true })
    const gdal2tilesArgs = [
      '--resume',
      '--processes', processes.toString(),
      '--zoom', tileConfig.minZoom + '-' + tileConfig.maxZoom,
      '--xyz',
      '--s_srs', yearObject.srs,
      '--tiledriver', tiledriver,
      DOWNLOAD_DIR + '/' + vrtfile,
      tilesDir
    ]
    await spawn('gdal2tiles', gdal2tilesArgs, {
      stdout: 'inherit'
    })
  }
}