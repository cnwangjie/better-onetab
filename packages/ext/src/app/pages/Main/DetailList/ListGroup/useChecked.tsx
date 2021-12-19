import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Tab } from 'src/common/storage/tabs'
import { pick, fromPairs } from 'lodash/fp'
import React from 'react'
import { Checkbox } from '@mui/material'

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

  const checkAllBox = (
    <Checkbox
      checked={!!allChecked}
      indeterminate={!!indeterminate}
      onChange={handleCheckAll}
    />
  )

  return {
    checked,
    handleCheckedChange,
    someChecked,
    checkAllBox,
  }
}

export default useChecked
