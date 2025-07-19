import fs from 'node:fs'

import sources from './sources.js'
import { createLogger } from './logger.js'
import { download, mkDir, unzip } from './utils.js'
import { createTiles, createVrt } from './gdal.js'

// console.debug(JSON.stringify(sources, null, 2))

const DOWNLOAD_BASE_DIR = 'download'
const TILES_BASE_DIR = 'public/tiles'

async function processYearsParts(sourceId, sourceConfig, logger) {
  for (const [year, yearConfig] of Object.entries(sourceConfig.years)) {
    const yearLogger = logger.createLogger(year)
    
    const downloadDir = mkDir(DOWNLOAD_BASE_DIR, sourceId, year)
    const tilesDir = mkDir(TILES_BASE_DIR, sourceId, year)

    for (const [part, partConfig] of Object.entries(yearConfig.parts)) {
      const partLogger = yearLogger.createLogger(part)
      const zipfile = downloadDir + '/' + part + '.zip'
      await download(partConfig.downloadUrl, zipfile, partLogger)
      await unzip(zipfile, yearLogger)
    }

    createVrt(downloadDir, yearLogger)
    await createTiles(downloadDir, tilesDir, yearConfig.tiles, yearLogger)
  }
}

for (const [sourceId, sourceConfig] of Object.entries(sources)) {
  const logger = createLogger(sourceId)
  logger.log(`"${sourceConfig.name}"`)
  const type = sourceConfig.type
  if (type === 'years/parts/zip') {
    await processYearsParts(sourceId, sourceConfig, logger)
  } else {
    logger.log(`ERROR: unknown type ${type}`)
  }
}

fs.writeFileSync(TILES_BASE_DIR + '/sources.json', JSON.stringify(sources, null, 2))