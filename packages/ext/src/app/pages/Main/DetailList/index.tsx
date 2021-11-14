import React from 'react'
import ListGroup from './ListGroup'
import { useLists } from '../../../service'
import { DragDropContext } from 'react-beautiful-dnd'

const DetailList = () => {
  const { data } = useLists()

  return (
    <div>
      <DragDropContext onDragEnd={() => {}}>
        {data?.result.map(list => {
          console.log(list)
          return <ListGroup key={list.id} list={list} />
        })}
      </DragDropContext>
    </div>
  )
}

export default DetailList
