import fs from 'node:fs'
import os from 'node:os'
import { execSync } from 'node:child_process'

import spawn from 'nano-spawn'

import sources from './sources.js'
import { createLogger } from './logger.js'
import { download, mkDir, unzip } from './utils.js'

// console.debug(JSON.stringify(sources, null, 2))

const DOWNLOAD_BASE_DIR = 'download'
const TILES_BASE_DIR = 'public/tiles'

const tiledriverForExtension = {
  webp: 'WEBP',
  jpg: 'JPEG'
}

const VRT_FILENAME = 'all.vrt'

function createVrt(directory, loggger) {
  loggger.log('creating ' + VRT_FILENAME)
  execSync(`gdalbuildvrt ${VRT_FILENAME} */*.jpg`, { cwd: directory })
}

async function createTiles(downloadDir, tilesDir, tileConfig, logger) {
  const processes = Math.floor(os.cpus().length * 3 / 4 )
  const tiledriver = tiledriverForExtension[tileConfig.fileExtension]
  logger.log(`converting to ${tiledriver} tiles with ${processes} threads to directory ${tilesDir}`)
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
  const sourceLogger = createLogger(sourceId)
  sourceLogger.log(`"${source.name}"`)
  for (const [year, yearConfig] of Object.entries(source.years)) {
    const yearLogger = sourceLogger.createLogger(year)
    
    const downloadDir = mkDir(DOWNLOAD_BASE_DIR, sourceId, year)
    const tilesDir = mkDir(TILES_BASE_DIR, sourceId, year)

    for (const [part, partConfig] of Object.entries(yearConfig.parts)) {
      const partLogger = yearLogger.createLogger(part)
      const zipfile = downloadDir + '/' + part + '.zip'
      await download(partConfig.url, zipfile, partLogger)
      await unzip(zipfile, downloadDir + '/' + part, yearLogger)
    }

    createVrt(downloadDir, yearLogger)
    await createTiles(downloadDir, tilesDir, yearConfig.tiles, yearLogger)
  }
}

fs.writeFileSync(TILES_BASE_DIR + '/sources.json', JSON.stringify(sources, null, 2))