const openGeoDataWebsiteBaseUrl = 'https://www.hannover.de/Leben-in-der-Region-Hannover/Verwaltungen-Kommunen/Die-Verwaltung-der-Landeshauptstadt-Hannover/Dezernate-und-Fachbereiche-der-LHH/Stadtentwicklung-und-Bauen/Fachbereich-Planen-und-Stadtentwicklung/Geoinformation/Open-GeoData'
const dopWebsiteBaseUrl = openGeoDataWebsiteBaseUrl + '/Digitale-Orthophotos-DOP20'
const downloadBaseUrl = 'https://opengeodata.hannover-stadt.de'

const YEARS = [1957, 1965, 1977, 1981, 1991, 2002, 2006, 2015, 2021, 2023]
const PARTS = ['Nord']

const arrayToObject = (array, mapper) => Object.fromEntries(array.map(key => [key, mapper(key)]))

// source: https://www.hannover.de/Leben-in-der-Region-Hannover/Verwaltungen-Kommunen/Die-Verwaltung-der-Landeshauptstadt-Hannover/Dezernate-und-Fachbereiche-der-LHH/Stadtentwicklung-und-Bauen/Fachbereich-Planen-und-Stadtentwicklung/Geoinformation/Open-GeoData/Nutzungsbedingungen
const defaultLicense = {
  name: 'CC BY 4.0',
  url: 'https://creativecommons.org/licenses/by/4.0/deed.de',
  holder: 'Bereich Geoinformation – LH Hannover'
}

const sources = {
  dop: {
    name: 'Digitale Orthophotos (DOP20)',
    type: 'years/parts/zip',
    website: dopWebsiteBaseUrl,
    years: arrayToObject(YEARS, year => ({
      website: dopWebsiteBaseUrl + '/' +
        ((year === 2023) ? 'Digitale' : 'Historische') + '-Orthophotos-Jahrgang-' + year,
      license: defaultLicense,
      parts: arrayToObject(PARTS, part => ({
        downloadUrl: downloadBaseUrl + '/' +
          ((year === 2023) ? `DOP20_Teil_${part}.zip` : `${year}_${part}.zip`),
      })),
      tiles: {
        sourceSrs: 'EPSG:25832',
        minZoom: 12,
        maxZoom: 19,
        fileExtension: (year <= 2002) ? 'jpg' : 'webp' // grayscale images not supported by WEBP
      }
    }))
  },
  skh: {
    name: 'Stadtkarte 1:20 000 (historisch)',
    type: 'zip/years',
    yearsPattern: '^(?<year>[0-9]+)_',
    website: openGeoDataWebsiteBaseUrl + '/Digitale-Stadtkarten/Stadtkarte-1-20-000-historisch',
    downloadUrl: downloadBaseUrl + '/SKH20_historisch.zip',
    tiles: {
      sourceSrs: 'EPSG:25832',
      minZoom: 12,
      maxZoom: 17,
      fileExtension: 'webp'
    }
  }
}

export default sources