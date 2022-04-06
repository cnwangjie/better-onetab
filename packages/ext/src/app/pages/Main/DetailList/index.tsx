import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import ListGroup from './ListGroup'
import { fetchLists, mutateListTabs, useLists } from '../../../service'
import { DragDropContext } from 'react-beautiful-dnd'
import {
  recordTabState,
  reorderTab,
  reorderTabLocally,
} from 'src/app/service/reorder'
import type { KeyedMutator } from 'swr/dist/types'
import __ from 'src/common/util/i18n'
import { useQs } from 'src/app/util/qs'
import { pick } from 'lodash'
import { Button } from '@mui/material'
import { Link, useHistory } from 'react-router-dom'
import { useOptions } from 'src/app/service/options'
import { Virtuoso } from 'react-virtuoso'
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useObservable } from 'rxjs-hooks'
import { $lists } from 'src/app/store'

const DetailListContext = createContext<{
  mutate?: KeyedMutator<any>
}>({})

export const useDetailListContext = () => useContext(DetailListContext)

const DetailList = () => {
  const { qs, set } = useQs()

  const opts = useOptions()

  const opt = {
    sort: { createdAt: -1 },
    ...pick(qs, ['before', 'after']),
    limit: opts?.listsPerPage,
  } as const

  const lists = useObservable(() => $lists, [])

  const history = useHistory()

  useEffect(() => {
    fetchLists(opt)
  }, [])

  // const pagination = useMemo(() => {
  //   const previousEnabled = (qs.before && data?.hasNext) || qs.after
  //   const nextEnabled = qs.before || data?.hasNext

  //   const previous = (
  //     <Button
  //       variant="outlined"
  //       disabled={!previousEnabled}
  //       onClick={() => {
  //         if (previousEnabled) {
  //           set({
  //             before: qs.before ? data!.next : data!.result[0].id,
  //             after: null,
  //           })
  //         }
  //       }}
  //     >
  //       {__('ui_prev_page')}
  //     </Button>
  //   )
  //   const next = (
  //     <Button
  //       variant="outlined"
  //       disabled={!nextEnabled}
  //       onClick={() => {
  //         if (nextEnabled) {
  //           set({
  //             before: null,
  //             after: qs.before
  //               ? data!.result[data!.result.length - 1].id
  //               : data!.next,
  //           })
  //         }
  //       }}
  //     >
  //       {__('ui_next_page')}
  //     </Button>
  //   )

  //   return (
  //     <div className="w-full flex justify-center">
  //       {data && (
  //         <div className="flex gap-4">
  //           {previous}
  //           {next}
  //         </div>
  //       )}
  //     </div>
  //   )
  // }, [data, qs?.after, qs?.before, history])

  const sensors = useSensors(useSensor(MouseSensor))

  const recoverTabsStateRef = useRef<() => void>()
  const orderingRef = useRef(false)

  const dndKit = (
    <DndContext
      sensors={sensors}
      onDragOver={async e => {
        if (orderingRef.current) return
        orderingRef.current = true
        do {
          if (e.over == null || e.active.id === e.over.id) break
          console.log('onDragOver', e)
          const src = e.active.data.current?.tab
          const dst = e.over.data.current?.tab
          if (!src || !dst) break
          const targetIndex = e.over.data.current?.sortable.index
          const fromListId = src.listId
          const toListId = dst.listId
          recoverTabsStateRef.current = await recordTabState(
            fromListId,
            toListId,
          )
          console.log(src.id, fromListId, toListId, targetIndex)
          reorderTabLocally(src.id, fromListId, toListId, targetIndex)
        } while (false)
        orderingRef.current = false
      }}
      onDragCancel={async e => {
        console.log('onDragCancel', e)
        recoverTabsStateRef.current?.()
      }}
    >
      <SortableContext items={lists} strategy={verticalListSortingStrategy}>
        {lists.map(list => {
          return <ListGroup key={list.id} list={list} />
        })}

        {/* <Virtuoso
          style={{ height: '100vh' }}
          data={lists}
          itemContent={(index, list) => {
            return <ListGroup key={list.id} list={list} />
          }}
          overscan={1}
        /> */}
      </SortableContext>
      <DragOverlay>
        <div className="flex justify-center">drag overlay</div>
      </DragOverlay>
    </DndContext>
  )

  return (
    <div className="flex flex-col gap-4">
      {/* {pagination} */}
      {dndKit}
      {/* {pagination} */}
    </div>
  )
}

export default DetailList
