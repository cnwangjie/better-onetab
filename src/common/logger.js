import * as Sentry from '@sentry/browser'
import * as Integrations from '@sentry/integrations'
import {SENTRY_DSN} from './constants'
import {isBackground} from './utils'
import manifest from '../manifest.json'

const logger = {}

const genMethods = () => {
  for (const method in window.console) {
    if (typeof window.console[method] !== 'function') continue
    logger[method] = (...args) => {
      window.console[method](...args)
      args.forEach(arg => {
        if (arg instanceof Error) Sentry.captureException(arg)
        else Sentry.addBreadcrumb({data: arg, level: method})
      })
    }
  }
}

logger.init = (opts = {}) => {
  genMethods()
  if (DEBUG) {
    window.Sentry = Sentry
    return
  }

  const {Vue} = opts
  const integrations = Sentry.defaultIntegrations
  if (Vue) integrations.push(new Integrations.Vue({Vue}))
  Sentry.init({
    environment: DEBUG ? 'dev' : 'production',
    release: 'v' + manifest.version,
    dsn: SENTRY_DSN,
    debug: DEBUG,
    integrations,
  })

  Sentry.configureScope(async scope => {
    scope.setTag('background', await isBackground())
  })
}

export default logger
