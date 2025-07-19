import logUpdate from 'log-update'

export function createLogger(...breadcrumbs) {
  const prefix = breadcrumbs.join('/') + ' > '
  return {
    log: (msg) => console.log(prefix + msg),
    logReplace: (msg) => logUpdate(prefix + msg),
    createLogger: (...additionalBreadcrumbs) => createLogger(...breadcrumbs, ...additionalBreadcrumbs)
  }
}

