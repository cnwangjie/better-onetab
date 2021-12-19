import React, {
  FC,
  useState,
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  cloneElement,
} from 'react'

const allContainers = new Map<string, Context>()

export const dynamicCreateElement = (
  element: JSX.Element,
  { name }: { name?: string } = {},
) => {
  const c =
    name && allContainers.has(name)
      ? allContainers.get(name)
      : [...allContainers.values()][0]

  return c?.createElement(element, name)
}

export const useDynamicCreateElement = () => {
  const c = useContext(DynamicCreateElementContext)
  return c?.createElement || dynamicCreateElement
}

type CreateElement = (args: JSX.Element, name?: string) => () => void

interface Context {
  child: Set<Context>
  createElement: CreateElement
}

const DynamicCreateElementContext = createContext<Context>({
  child: new Set(),
  createElement: () => () => {},
})

const useForceUpdate = () => {
  const [, set] = useState(0)
  return useCallback(() => set(i => i + 1), [])
}

export const DynamicCreateElementContainer: FC<{
  name?: string
}> = ({ children, name = Math.random() + '' }) => {
  const forceUpdate = useForceUpdate()
  const elements = useMemo(() => new Set<JSX.Element>(), [])
  const parent = useContext(DynamicCreateElementContext)
  const child = useMemo(() => new Set<Context>(), [])
  const createElement = useCallback((args: JSX.Element, _name?: string) => {
    if (name !== _name && child.size) {
      const [c] = [...child.values()]
      return c.createElement(args)
    }
    elements.add(args)
    forceUpdate()
    return () => {
      elements.delete(args)
      forceUpdate()
    }
  }, [])
  const value = useMemo<Context>(() => {
    return {
      child,
      createElement,
    }
  }, [])

  useEffect(() => {
    parent.child.add(value)
    allContainers.set(name, value)
    return () => {
      parent.child.delete(value)
      allContainers.delete(name)
    }
  }, [])

  return (
    <DynamicCreateElementContext.Provider value={value}>
      {children}
      {[...elements.values()].map((el, index) => {
        return cloneElement(el, { key: index })
      })}
    </DynamicCreateElementContext.Provider>
  )
}
