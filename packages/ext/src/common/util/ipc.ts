import { isFunction, mapValues, once } from 'lodash'
import { browser } from 'webextension-polyfill-ts'
import { isBackground } from '.'

const handlers: Record<string, any> = {}

export const registerIpcHandler = (fn: any, name: string) => {
  handlers[name] = fn
  console.log('registered handler', name)
  return fn
}

export const registerIpcListener = once(async () => {
  if (!(await isBackground())) return

  browser.runtime.onMessage.addListener(message => {
    if (!message.ipcCall) return
    console.log('<- received ipc call', message.ipcCall)
    const { name, args } = message.ipcCall

    const fn = handlers[name]
    if (!fn) return

    return fn(...args).catch((error: any) => {
      console.error('-> perform ipc with error', error)
      if (error instanceof Error) {
        const { message, stack } = error
        return { error: { message, stack } }
      }
      return null
    })
  })
  console.log('ipc listener registered')
})

export const wrapBackgroundCommunication = <T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T => {
  const wrapped = async (...args: any[]) => {
    if (await isBackground()) {
      return fn(...args)
    }

    const ipcCall = { name, args }
    const start = Date.now()
    console.log('-> send ipc call', ipcCall)

    const result = await browser.runtime.sendMessage({
      ipcCall,
    })

    if (result?.error) {
      console.log('-> ipc with error', result.error)
      throw new Error(result.error.message)
    }

    console.log('<- result', result, `+${Date.now() - start}ms`)

    return result
  }

  return wrapped as any as T
}

export const wrapBackgroundCommunicationDeeply = <T extends Record<string, any>>(objects: T): T => {
  return mapValues(objects, (fn, name) => {
    if (isFunction(fn)) return wrapBackgroundCommunication(fn, name)
    return wrapBackgroundCommunicationDeeply(fn)
  }) as any as T
}

export const registerIpcHandlerDeeply = <T extends Record<string, any>>(objects: T) => {
  Object.entries(objects).map(([name, fn]) => {
    if (isFunction(fn)) return registerIpcHandler(fn, name)
    return registerIpcHandlerDeeply(fn)
  })
}
