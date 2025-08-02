import fs from 'node:fs/promises'

import sources from './sources.js'
import { createLogger } from './logger.js'
import { download, mkDir, unzip } from './utils.js'
import { createTiles, createVrt } from './gdal.js'

// console.debug(JSON.stringify(sources, null, 2))

const DOWNLOAD_BASE_DIR = 'download'
const TILES_BASE_DIR = 'public/tiles'

async function processYearsPartsZip(sourceId, sourceConfig, logger) {
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

    const vrtFile = downloadDir + '/all.vrt'
    createVrt(vrtFile, '*/*.jpg', yearLogger)
    await createTiles(vrtFile, tilesDir, yearConfig.tiles, yearLogger)
  }
}

async function processZipYears(sourceId, sourceConfig, logger) {
  const downloadDir = mkDir(DOWNLOAD_BASE_DIR)
  const zipfile = downloadDir + '/' + sourceId + '.zip'
  await download(sourceConfig.downloadUrl, zipfile, logger)
  await unzip(zipfile, logger)

  const unzipDir = downloadDir + '/' + sourceId
  const yearsPattern = new RegExp(sourceConfig.yearsPattern)
  const files = await fs.readdir(unzipDir)
  const jpegs = files.filter(filename => filename.endsWith('.jpg'))
  for (const jpeg of jpegs) {
    const year = yearsPattern.exec(jpeg)?.groups.year
    if (!year) {
      logger.log(`cannot get year from file '${jpeg}'`)
    }
    sourceConfig.years[year] = {}
    const yearLogger = logger.createLogger(year)
    const vrtFile = `${unzipDir}/${year}.vrt`
    const tilesDir = mkDir(TILES_BASE_DIR, sourceId, year)
    createVrt(vrtFile, year + '_*.jpg', yearLogger)
    await createTiles(vrtFile, tilesDir, sourceConfig.tiles, yearLogger)
  }
}

for (const [sourceId, sourceConfig] of Object.entries(sources)) {
  const logger = createLogger(sourceId)
  logger.log(`"${sourceConfig.name}"`)
  const type = sourceConfig.type
  if (type === 'years/parts/zip') {
    await processYearsPartsZip(sourceId, sourceConfig, logger)
  } else if (type === 'zip/years') {
    await processZipYears(sourceId, sourceConfig, logger)
  } else {
    logger.log(`ERROR: unknown type ${type}`)
  }
}

await fs.writeFile(TILES_BASE_DIR + '/sources.json', JSON.stringify(sources, null, 2))