import { Icon } from '@iconify/react'
import { Checkbox, useTheme } from '@mui/material'
import React, { FC } from 'react'
import { Tab } from 'src/common/storage/tabs'
import { getDefaultFavIcon } from 'src/common/util'
import { Draggable } from 'react-beautiful-dnd'
import './style.css'

const TabItem: FC<{
  tab: Tab
  index: number
  checked?: boolean
  onCheckedChange?: (checked: boolean) => any
}> = ({ tab, index, checked, onCheckedChange }) => {
  const theme = useTheme()
  return (
    <Draggable draggableId={tab.id} index={index}>
      {({ innerRef, draggableProps: { style, ...draggableProps }, dragHandleProps }, snapshot) => {
        return (
          <div
            ref={innerRef}
            {...draggableProps}
            key={tab.id}
            className="list-tab-item flex h-10 w-full items-center pl-1"
            style={{
              ...style,
              backgroundColor: theme.palette.background.default,
              opacity: snapshot.isDragging ? 0.5 : 1,
            }}
          >
            <div {...dragHandleProps} className="drag-indicator w-4">
              <Icon icon="mdi:drag-vertical" width="24" height="24" />
            </div>
            <Checkbox checked={checked} onChange={(_, checked) => onCheckedChange?.(checked)} />
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

export default TabItem
