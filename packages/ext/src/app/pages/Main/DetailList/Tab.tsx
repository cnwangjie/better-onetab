import { Icon } from '@iconify/react'
import { Checkbox } from '@mui/material'
import React, { FC } from 'react'
import { Tab } from 'src/common/storage/tabs'
import { getDefaultFavIcon } from 'src/common/util'
import { Draggable } from 'react-beautiful-dnd'

const Tab: FC<{ tab: Tab; index: number }> = ({ tab, index }) => {
  return (
    <Draggable draggableId={tab.id} index={index}>
      {({ innerRef, draggableProps, dragHandleProps }, snapshot) => {
        return (
          <div
            ref={innerRef}
            {...draggableProps}
            key={tab.id}
            className="flex h-10 w-full items-center pl-3"
          >
            <div {...dragHandleProps}>
              <Icon icon="mdi:drag-vertical" width="24" height="24" />
            </div>
            <Checkbox />
            <div className="pl-1">
              <div className="flex items-center gap-1">
                <img
                  className="w-4 h-4"
                  src={tab.favIconUrl || getDefaultFavIcon(tab.url)}
                />
                {tab.title}
              </div>
              <div className="text-opacity-50">{tab.url}</div>
            </div>
          </div>
        )
      }}
    </Draggable>
  )
}

export default Tab
