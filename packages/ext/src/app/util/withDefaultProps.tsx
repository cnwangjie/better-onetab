import React, {
  ComponentRef,
  ComponentType,
  FC,
  forwardRef,
  PropsWithoutRef,
  createElement as h,
} from 'react'

const withDefaultProps = <
  C extends ComponentType,
  D extends Partial<P>,
  P = PropsWithoutRef<C>,
  NP = Omit<P, keyof D> & Partial<P>,
  R = ComponentRef<C>,
>(
  Component: ComponentType<P>,
  defaultProps: D,
) => {
  const wrapped = forwardRef<R, NP>(({ children, ...props }, ref) => {
    return h(
      Component as any,
      {
        ...defaultProps,
        ...props,
        ref,
      },
      children,
    )
  })

  wrapped.displayName = `withDefaultProps(${
    Component.displayName || Component.name || 'Component'
  })`

  return wrapped
}

export default withDefaultProps

if (DEBUG) {
  const A: FC<{ a: number; b: string }> = () => null
  const B = withDefaultProps(A, { a: 1 })
  {
    ;<B b="a" />
  }
}
