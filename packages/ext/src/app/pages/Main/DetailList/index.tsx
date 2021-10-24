import React from 'react'
import ListGroup from './ListGroup'

const DetailList = () => {
  const [lists, setLists] = React.useState([
    1,2,3,4
  ])

  return (
    <div>
      {
        lists.map(list => {
          return <ListGroup key={list} />
        })
      }
    </div>
  )
}

export default DetailList
