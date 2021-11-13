import { isFunction, mapValues, once } from 'lodash'
import browser from 'webextension-polyfill'
import { isBackground } from '.'
import { RuntimeOnMessageListener } from './composeListener'

const handlers: Record<string, (...args: any) => Promise<any>> = {}

export const registerIpcHandler = (fn: any, name: string) => {
  handlers[name] = fn
  console.log('registered handler', name)
  return fn
}

export const createIpcListener = once(
  async (): Promise<undefined | RuntimeOnMessageListener> => {
    if (!(await isBackground())) return

    return message => {
      if (!message.ipcCall) return
      console.log('<- received ipc call', message.ipcCall)
      const { name, args } = message.ipcCall

      const fn = handlers[name]
      if (!fn) return

      return fn(...args)
        .then(result => {
          console.log('-> result', result)
          return Promise.resolve(result)
        })
        .catch((error: any) => {
          console.error('-> perform ipc with error', error)
          if (error instanceof Error) {
            const { message, stack } = error
            return { error: { message, stack } }
          }
          return null
        })
    }
  },
)

export const wrapBackgroundCommunication = <T extends (...args: any[]) => any>(
  fn: T,
  name: string,
): T => {
  const wrapped = async (...args: any[]) => {
    if (await isBackground()) {
      return fn(...args)
    }

    const ipcCall = { name, args }
    const start = Date.now()
    console.log('-> send ipc call', 'name:', name, 'args:', ...args)

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

  return wrapped as T
}

export const wrapBackgroundCommunicationDeeply = <
  T extends Record<string, any>
>(
  objects: T,
  path = '',
): T => {
  return (mapValues(objects, (fn, name) => {
    const fullName = path ? path + '.' + name : name
    if (isFunction(fn)) return wrapBackgroundCommunication(fn, fullName)
    return wrapBackgroundCommunicationDeeply(fn, fullName)
  }) as any) as T
}

export const registerIpcHandlerDeeply = <T extends Record<string, any>>(
  objects: T,
  path = '',
) => {
  Object.entries(objects).map(([name, fn]) => {
    const fullName = path ? path + '.' + name : name
    if (isFunction(fn)) return registerIpcHandler(fn, fullName)
    return registerIpcHandlerDeeply(fn, fullName)
  })
}
