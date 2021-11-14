import React from 'react'
import ListGroup from './ListGroup'
import { mutateListTabs, useLists } from '../../../service'
import { DragDropContext } from 'react-beautiful-dnd'
import { reorderTab, reorderTabLocally } from 'src/app/service/reorder'

const DetailList = () => {
  const { data } = useLists()

  return (
    <div>
      <DragDropContext
        onDragEnd={async result => {
          console.log('drop result', result)
          const { draggableId, source, destination } = result
          if (!destination) return
          reorderTabLocally(
            draggableId,
            source.droppableId,
            destination.droppableId,
            destination.index,
          )
          await reorderTab(
            draggableId,
            source.droppableId,
            destination.droppableId,
            destination.index,
          )
          mutateListTabs([source.droppableId])
          mutateListTabs([destination.droppableId])
        }}
      >
        {data?.result.map(list => {
          console.log(list)
          return <ListGroup key={list.id} list={list} />
        })}
      </DragDropContext>
    </div>
  )
}

export default DetailList
