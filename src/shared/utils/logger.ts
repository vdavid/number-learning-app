import debug from 'debug'

const hasDebugQueryParam = (): boolean => {
    if (typeof window === 'undefined') return false
    const params = new URLSearchParams(window.location.search)
    return params.has('debug') && !['false', '0', ''].includes(params.get('debug') || '')
}

const isDebug =
    (typeof localStorage !== 'undefined' && !['false', '0', ''].includes(localStorage.getItem('debug') || '')) ||
    import.meta.env.MODE === 'dev' ||
    hasDebugQueryParam()

/* eslint-disable no-console -- This is the only place we use `console` */
export const logger = {
    debug: isDebug ? console.log.bind(console, '[DEBUG]') : () => {},
    info: console.info.bind(console, '[INFO]'),
    warn: console.warn.bind(console, '[WARN]'),
    error: console.error.bind(console, '[ERROR]'),
}
/* eslint-enable no-console */

/**
 * Creates a namespaced debug logger using the `debug` package.
 * Only logs when debug is enabled via `localStorage.debug` or `DEBUG` env var.
 *
 * @example
 * const log = createDebugLogger('app:tts')
 * log('Playing audio for %d', number)
 */
export const createDebugLogger = (namespace: string): debug.Debugger => debug(namespace)
