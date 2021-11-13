import type browser from 'webextension-polyfill'

export type RuntimeOnMessageListener = Parameters<typeof browser.runtime.onMessage.addListener>[0]

export const composeListeners = (...listeners: (RuntimeOnMessageListener | undefined)[]): RuntimeOnMessageListener => {
  return (message, sender) => {
    for (const listener of listeners) {
      const result = listener?.(message, sender)
      if (result) return result
    }
  }
}
