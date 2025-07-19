import fs from 'node:fs'
import os from 'node:os'
import { execSync } from 'node:child_process'

import { Downloader } from 'nodejs-file-downloader'
import logUpdate from 'log-update'
import decompress from 'decompress'
import spawn from 'nano-spawn'

import sources from './sources.js'

// console.debug(JSON.stringify(sources, null, 2))

const DOWNLOAD_BASE_DIR = 'download'
const TILES_BASE_DIR = 'public/tiles'

function mkDir(...paths) {
  const dir = paths.join('/')
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

const tiledriverForExtension = {
  webp: 'WEBP',
  jpg: 'JPEG'
}

const _log = (f, breadcrumbs, msg) => f(breadcrumbs.join('/') + ' > ' + msg)
const log = (...args) => _log(console.log, ...args)
const logReplace = (...args) => _log(logUpdate, ...args)

async function downloadPart(partId, partConfig, downloadDir, logPrefix) {
  const name = partId
  const file = name + '.zip'
  const fullFilename = downloadDir + '/' + file

  if (fs.existsSync(fullFilename)) {
    log(logPrefix, `downloading skipped, because ${file} already exists`)
  } else {
    const url = partConfig.downloadUrl
    const downloader = new Downloader({
      url,
      directory: downloadDir,
      fileName: file,
      onProgress: function (percentage, chunk, remainingSize) {
        logReplace(logPrefix, `downloading ${url}: ${percentage}%`)
      }
    })
    await downloader.download()
  }
}

async function unzipPart(name, downloadDir, logPrefix) {
  const fullFilename = downloadDir + '/' + name + '.zip'
  const extractDir = downloadDir + '/' + name
  if (fs.existsSync(extractDir)) {
    log(logPrefix, `unzipping skipped, because directory ${name} already exists`)
  } else {
    log(logPrefix, `unzipping ${file} to directory ${name}`)
    await decompress(fullFilename, extractDir)
  }
}

function createVrt(downloadDir, logPrefix) {
  const vrtfile = 'all.vrt'
  log(logPrefix, 'creating ' + vrtfile)
  execSync(`gdalbuildvrt ${vrtfile} */*.jpg`, { cwd: downloadDir })
}

async function createTiles(yearConfig, downloadDir, tilesDir, logPrefix) {
  const tileConfig = yearConfig.tiles
  const processes = Math.floor(os.cpus().length * 3 / 4 )
  const tiledriver = tiledriverForExtension[tileConfig.fileExtension]
  log(logPrefix, `converting to ${tiledriver} tiles with ${processes} threads to directory ${tilesDir}`)
  const gdal2tilesArgs = [
    '--resume',
    '--processes', processes.toString(),
    '--zoom', tileConfig.minZoom + '-' + tileConfig.maxZoom,
    '--xyz',
    '--s_srs', yearConfig.srs,
    '--tiledriver', tiledriver,
    downloadDir + '/all.vrt',
    tilesDir
  ]
  await spawn('gdal2tiles', gdal2tilesArgs, {
    stdout: 'inherit'
  })
}

for (const [sourceId, source] of Object.entries(sources)) {
  log([sourceId], `"${source.name}"`)
  for (const [year, yearConfig] of Object.entries(source.years)) {
    const logPrefix = [sourceId, year]
    
    const downloadDir = mkDir(DOWNLOAD_BASE_DIR, sourceId, year)
    const tilesDir = mkDir(TILES_BASE_DIR, sourceId, year)
    fs.mkdirSync(downloadDir, { recursive: true })
    fs.mkdirSync(tilesDir, { recursive: true })

    for (const [partId, partConfig] of Object.entries(yearConfig.parts)) {
      await downloadPart(partId, partConfig, downloadDir, logPrefix.concat(partId))
      await unzipPart(partId, downloadDir, logPrefix.concat(partId))
    }

    createVrt(downloadDir, logPrefix)
    await createTiles(yearConfig, downloadDir, tilesDir, logPrefix)
  }
}

fs.writeFileSync(TILES_BASE_DIR + '/sources.json', JSON.stringify(sources, null, 2))