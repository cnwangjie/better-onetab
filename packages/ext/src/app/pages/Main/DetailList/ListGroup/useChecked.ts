import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Tab } from 'src/common/storage/tabs'
import { pick, fromPairs } from 'lodash/fp'

const useChecked = (tabs?: Tab[]) => {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setChecked(checked => {
      return pick(tabs?.map(tab => tab.id) || [], checked)
    })
  }, [tabs])

  const handleCheckedChange = useCallback((id: string) => {
    return (target: boolean) => {
      setChecked(checked => {
        return {
          ...checked,
          [id]: target,
        }
      })
    }
  }, [])

  const someChecked = useMemo(() => {
    return tabs?.map(tab => tab.id).some(id => checked[id])
  }, [checked, tabs])

  const allChecked = useMemo(() => {
    return tabs?.map(tab => tab.id).every(id => checked[id])
  }, [checked, tabs])

  const indeterminate = useMemo(() => {
    return someChecked && !allChecked
  }, [checked, tabs])

  const handleCheckAll = useCallback(() => {
    allChecked
      ? setChecked({})
      : setChecked(fromPairs(tabs?.map(tab => [tab.id, true]) ?? []))
  }, [allChecked, indeterminate, tabs])

  return {
    checked,
    handleCheckedChange,
    someChecked,
    allChecked,
    indeterminate,
    handleCheckAll,
  }
}

export default useChecked
