import React from 'react'
import ListGroup from './ListGroup'
import { useLists } from '../../../service'

const DetailList = () => {
  const { data } = useLists()

  return (
    <div>
      {
        data?.result.map(list => {
          console.log(list)
          return <ListGroup key={list.id} list={list} />
        })
      }
    </div>
  )
}

export default DetailList
