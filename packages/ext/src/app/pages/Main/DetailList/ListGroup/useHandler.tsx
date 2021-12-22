import React from 'react'
import { useCallback } from 'react'
import { confirm } from 'src/app/component/Confirm'
import { useOptions } from 'src/app/service/options'
import storage from 'src/common/storage'
import type { List } from 'src/common/storage/lists'
import type { Tab } from 'src/common/storage/tabs'
import { tabsManager } from 'src/common/tabsManager'
import { formatTime } from 'src/common/util/formatDate'
import __ from 'src/common/util/i18n'
import { useDetailListContext } from '..'

const useHandler = (list: List, tabs?: Tab[]) => {
  const { alertRemoveList } = useOptions() || {}

  const { mutate } = useDetailListContext()

  const removeList = useCallback(async (withDescription = false) => {
    const shouldRemoveList = !alertRemoveList || await confirm({
      title: __('ui_confirm_remove_list_title'),
      description: (
        <>
          {withDescription && <>{__('ui_confirm_remove_list_description')} <br /></>}
          <span>{__('ui_remove_list')}: {list.title || __('ui_untitled')}</span>
          <br />
          <span>{__('ui_tab_num')}: {tabs?.length || 0} </span>
          <br />
          <span>{__('ui_created')}: {formatTime(list.createdAt)}</span>
        </>
      ),
    })
    if (!shouldRemoveList) return
    await storage.lists.deleteList(list.id)
    mutate?.((data: any) => {
      if (data?.result) {
        return {
          ...data,
          result: data.result.filter((i: any) => i.id !== list.id),
        }
      }
      return data
    }, true)
  }, [list.id, tabs, alertRemoveList])

  const handleRestoreAll = useCallback(
    (inNewWindow = false) => {
      return async () => {
        if (inNewWindow) {
          tabsManager.restoreListInNewWindow(list.id)
        } else {
          tabsManager.restoreList(list.id)
        }
        if (list.pinned) return
        removeList(true)
      }
    },
    [list.id, removeList],
  )

  return {
    removeList: () => removeList(),
    handleRestoreAll,
  }
}

export default useHandler
