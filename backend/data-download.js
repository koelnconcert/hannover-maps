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

for (const [sourceId, source] of Object.entries(sources)) {
  console.log(source.name)
  for (const [year, yearObject] of Object.entries(source.years)) {
    console.log('  ' + year)
    for (const [part, partObject] of Object.entries(yearObject.parts)) {
      console.log('    ' + part)
      const name = year + '_' + part
      const file = name + '.zip'
      const fullFilename = DOWNLOAD_DIR + '/' + file

      if (fs.existsSync(fullFilename)) {
        console.log(`      downloading skipped, because ${file} already exists`)
      } else {
        const url = partObject.downloadUrl
        const downloader = new Downloader({
          url,
          directory: DOWNLOAD_DIR,
          fileName: file,
          onProgress: function (percentage, chunk, remainingSize) {
            logUpdate('      downloading ' + url + ' ' + percentage + '%')
          }
        })
        await downloader.download()
      }

      const extractDir = DOWNLOAD_DIR + '/' + name
      if (fs.existsSync(extractDir)) {
        console.log(`      unzipping skipped, because directory ${name} already exists`)
      } else {
        console.log(`      unzipping ${file} to directory ${name}`)
        await decompress(fullFilename, extractDir)
      }

      const vrtfile = year + '.vrt'
      console.log('    creating ' + vrtfile)
      execSync(`gdalbuildvrt ${vrtfile} ${year}_*/*.jpg`, { cwd: DOWNLOAD_DIR })

      const processes = Math.floor(os.cpus().length * 3 / 4 )
      const tiledriver = (year <= 2002) ? 'JPEG' : 'WEBP' // grayscale images not supported by WEBP
      const tilesDir = TILES_BASE_DIR + '/' + year
      console.log(`    converting to ${tiledriver} tiles with ${processes} threads to directory ${tilesDir}`)
      fs.mkdirSync(tilesDir, { recursive: true })
      const gdal2tilesArgs = [
        '--resume',
        '--processes', processes.toString(),
        '--zoom', '12-19',
        '--xyz',
        '--s_srs', 'EPSG:25832',
        '--tiledriver', tiledriver,
        DOWNLOAD_DIR + '/' + vrtfile,
        tilesDir
      ]
      await spawn('gdal2tiles', gdal2tilesArgs, {
        stdout: 'inherit'
      })
    }
  }
}