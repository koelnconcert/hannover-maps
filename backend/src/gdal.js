import os from 'node:os'
import path from 'node:path'
import { execSync } from 'node:child_process'

import spawn from 'nano-spawn'

const tiledriverForExtension = {
  webp: 'WEBP',
  jpg: 'JPEG'
}

export function createVrt(vrtFile, glob, loggger) {
  loggger.log('creating ' + vrtFile)
  execSync(`gdalbuildvrt ${path.basename(vrtFile)} ${glob}`, { cwd: path.dirname(vrtFile) })
}

export async function createTiles(vrtFile, tilesDir, tileConfig, logger) {
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
    vrtFile,
    tilesDir
  ]
  await spawn('gdal2tiles', gdal2tilesArgs, {
    stdout: 'inherit'
  })
}

