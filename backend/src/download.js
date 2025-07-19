import fs from 'node:fs'

import sources from './sources.js'
import { createLogger } from './logger.js'
import { download, mkDir, unzip } from './utils.js'
import { createTiles, createVrt } from './gdal.js'

// console.debug(JSON.stringify(sources, null, 2))

const DOWNLOAD_BASE_DIR = 'download'
const TILES_BASE_DIR = 'public/tiles'

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