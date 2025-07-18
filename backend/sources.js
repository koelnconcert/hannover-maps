const openGeoDataWebsiteBaseUrl = 'https://www.hannover.de/Leben-in-der-Region-Hannover/Verwaltungen-Kommunen/Die-Verwaltung-der-Landeshauptstadt-Hannover/Dezernate-und-Fachbereiche-der-LHH/Stadtentwicklung-und-Bauen/Fachbereich-Planen-und-Stadtentwicklung/Geoinformation/Open-GeoData'
const dopWebsiteBaseUrl = openGeoDataWebsiteBaseUrl + '/Digitale-Orthophotos-DOP20'
const downloadBaseUrl = 'https://opengeodata.hannover-stadt.de'

const YEARS = [1957, 1965, 1977, 1981, 1991, 2002, 2006, 2015, 2021, 2023]
const PARTS = ['Nord']

const arrayToObject = (array, mapper) => Object.fromEntries(array.map(key => [key, mapper(key)]))

const licenses = {
  'CC-BY-4.0': {
    name: 'Creative Commons Namensnennung 4.0 DE',
    url: 'https://creativecommons.org/licenses/by/4.0/deed.de'
  }
}

const defaultLicenseHolder = 'Landeshauptstadt Hannover'

const sources = {
  dop: {
    name: 'Digitale Orthophotos (DOP20)',
    website: dopWebsiteBaseUrl,
    years: arrayToObject(YEARS, year => ({
      website: dopWebsiteBaseUrl + '/' +
        ((year === 2023) ? 'Digitale' : 'Historische') + '-Orthophotos-Jahrgang-' + year,
      license: {
        ...licenses['CC-BY-4.0'],
        holder: defaultLicenseHolder
      },
      parts: arrayToObject(PARTS, part => ({
        downloadUrl: downloadBaseUrl + '/' +
          ((year === 2023) ? `DOP20_Teil_${part}.zip` : `${year}_${part}.zip`),
      })),
      srs: 'EPSG:25832',
      tiles: {
        minZoom: 12,
        maxZoom: 19,
        fileExtension: (year <= 2002) ? 'jpg' : 'webp' // grayscale images not supported by WEBP
      }
    }))
  }
}

export default sources