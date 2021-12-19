import { ReactNode, createElement as h } from 'react'

type ComponentType = any

type Level = [ComponentType, any?]

const wrap = (
  components: (ComponentType | Level)[],
  children?: ReactNode,
): ReactNode => {
  if (components.length === 0) return children
  const [inner, ...rest] = components
  const [Component, props] = ([] as any).concat(inner) as Level
  return wrap(rest, h(Component, props, children))
}

export default wrap
