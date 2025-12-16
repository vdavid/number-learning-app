const hasDebugQueryParam = (): boolean => {
    if (typeof window === 'undefined') return false
    const params = new URLSearchParams(window.location.search)
    return params.has('debug') && !['false', '0', ''].includes(params.get('debug') || '')
}

const isDebug =
    (typeof localStorage !== 'undefined' && !['false', '0', ''].includes(localStorage.getItem('debug') || '')) ||
    import.meta.env.MODE === 'dev' ||
    hasDebugQueryParam()

/* eslint-disable no-console -- This is one of the two places where we use `console` */
export const logger = {
    debug: isDebug
        ? (format: string, ...args: unknown[]) => {
              console.log(`[DEBUG] ${format}`, ...args)
          }
        : () => {},
    info: (format: string, ...args: unknown[]) => {
        console.info(`[INFO] ${format}`, ...args)
    },
    warn: (format: string, ...args: unknown[]) => {
        console.warn(`[WARN] ${format}`, ...args)
    },
    error: (format: string, ...args: unknown[]) => {
        console.error(`[ERROR] ${format}`, ...args)
    },
}
/* eslint-enable no-console */

/**
 * Creates a namespaced debug logger.
 * Only logs when debug is enabled (dev mode, localStorage.debug, or ?debug query param).
 *
 * @example
 * const log = createDebugLogger('app:tts')
 * log('Playing audio for %d', number)
 */
export const createDebugLogger = (_namespace: string) => {
    /* eslint-disable no-console -- This is one of the two places where we use `console` */
    return isDebug
        ? (format: string, ...args: unknown[]) => {
              console.log(`[DEBUG ${_namespace}] ${format}`, ...args)
          }
        : () => {}
}
