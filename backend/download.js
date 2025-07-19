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

const tiledriverForExtension = {
  webp: 'WEBP',
  jpg: 'JPEG'
}

const _log = (f, breadcrumbs, msg) => f(breadcrumbs.join('/') + ' > ' + msg)
const log = (...args) => _log(console.log, ...args)
const logReplace = (...args) => _log(logUpdate, ...args)

const VRT_FILENAME = 'all.vrt'

function mkDir(...paths) {
  const dir = paths.join('/')
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

async function download(url, filename, logPrefix) {
  if (fs.existsSync(filename)) {
    log(logPrefix, `downloading skipped, because ${filename} already exists`)
    return
  }
  const downloader = new Downloader({
    url,
    fileName: filename,
    onProgress: function (percentage, chunk, remainingSize) {
      logReplace(logPrefix, `downloading ${url}: ${percentage}%`)
    }
  })
  await downloader.download()
}

async function unzip(filename, extractDir, logPrefix) {
  if (fs.existsSync(extractDir)) {
    log(logPrefix, `unzipping skipped, because directory ${extractDir} already exists`)
  } else {
    log(logPrefix, `unzipping ${file} to directory ${extractDir}`)
    await decompress(filename, extractDir)
  }
}

function createVrt(directory, logPrefix) {
  log(logPrefix, 'creating ' + VRT_FILENAME)
  execSync(`gdalbuildvrt ${VRT_FILENAME} */*.jpg`, { cwd: directory })
}

async function createTiles(downloadDir, tilesDir, tileConfig, logPrefix) {
  const processes = Math.floor(os.cpus().length * 3 / 4 )
  const tiledriver = tiledriverForExtension[tileConfig.fileExtension]
  log(logPrefix, `converting to ${tiledriver} tiles with ${processes} threads to directory ${tilesDir}`)
  const gdal2tilesArgs = [
    '--resume',
    '--processes', processes.toString(),
    '--zoom', tileConfig.minZoom + '-' + tileConfig.maxZoom,
    '--xyz',
    '--s_srs', tileConfig.sourceSrs,
    '--tiledriver', tiledriver,
    downloadDir + '/' + VRT_FILENAME,
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

    for (const [partId, partConfig] of Object.entries(yearConfig.parts)) {
      const zipfile = downloadDir + '/' + partId + '.zip'
      await download(partConfig.url, zipfile, logPrefix.concat(partId))
      await unzip(zipfile, downloadDir + '/' + partId, logPrefix.concat(partId))
    }

    createVrt(downloadDir, logPrefix)
    await createTiles(downloadDir, tilesDir, yearConfig.tiles, logPrefix)
  }
}

fs.writeFileSync(TILES_BASE_DIR + '/sources.json', JSON.stringify(sources, null, 2))