import { fromPairs } from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'

export const getQs = () => {
  const url = new URL(window.location.href)
  const qs = fromPairs([...url.searchParams.entries()])
  return qs
}

export const setQs = (obj: Record<string, any>) => {
  const url = new URL(window.location.href)
  url.hash = window.location.hash
  Object.entries(obj).forEach(([k, v]) => {
    if (v === null) {
      url.searchParams.delete(k)
    } else if (v) {
      url.searchParams.set(k, v)
    }
  })
  window.history.pushState({}, window.document.title, url.toString())
}

interface UseQs {
  set: (o: Record<string, any>) => void

  [k: string]: any
}

export const useQs = (): UseQs => {
  const [data, setData] = useState<Record<string, string>>({})

  const refreshQs = useCallback(() => {
    const qs = getQs()
    setData(qs)
  }, [])

  useEffect(() => {
    refreshQs()
  }, [window.location.search])

  const set = useCallback((o: Record<string, any>) => {
    setQs(o)
    setData(o)
  }, [])

  return useMemo(() => ({ qs: data, set }), [data])
}
