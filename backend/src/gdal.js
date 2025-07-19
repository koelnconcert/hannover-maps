import os from 'node:os'
import { execSync } from 'node:child_process'

import spawn from 'nano-spawn'

const VRT_FILENAME = 'all.vrt'

const tiledriverForExtension = {
  webp: 'WEBP',
  jpg: 'JPEG'
}

export function createVrt(directory, loggger) {
  loggger.log('creating ' + VRT_FILENAME)
  execSync(`gdalbuildvrt ${VRT_FILENAME} */*.jpg`, { cwd: directory })
}

export async function createTiles(downloadDir, tilesDir, tileConfig, logger) {
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

