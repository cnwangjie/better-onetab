import { Icon } from '@iconify/react'
import { Checkbox, useTheme } from '@mui/material'
import React, { FC } from 'react'
import { Tab } from 'src/common/storage/tabs'
import { getDefaultFavIcon } from 'src/common/util'
import { Draggable } from 'react-beautiful-dnd'
import './style.css'
import { useOptions } from 'src/app/service/options'
import { ItemClickActionOption, ItemDisplayOption } from 'src/common/options/enums'

const TabItem: FC<{
  tab: Tab
  index: number
  checked?: boolean
  onCheckedChange?: (checked: boolean) => any
}> = ({ tab, index, checked, onCheckedChange }) => {
  const theme = useTheme()
  const opts = useOptions()

  return (
    <Draggable draggableId={tab.id} index={index}>
      {(
        {
          innerRef,
          draggableProps: { style, ...draggableProps },
          dragHandleProps,
        },
        snapshot,
      ) => {
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
            <Checkbox
              checked={checked}
              onChange={(_, checked) => onCheckedChange?.(checked)}
            />
            <a
              href={tab.url}
              target="_blank"
              className="px-1 flex-1 flex flex-col overflow-hidden"
              onClick={e => {
                e.stopPropagation()
                if (opts?.itemClickAction === ItemClickActionOption.None) {
                  e.preventDefault()
                  return
                }
                if (opts?.itemClickAction === ItemClickActionOption.OpenAndRemove) {
                  // TODO: remove tab
                }
              }}
            >
              {[
                ItemDisplayOption.Title,
                ItemDisplayOption.TitleAndUrl,
              ].includes(opts?.itemDisplay as any) && (
                <div className="flex items-center gap-1 overflow-hidden whitespace-nowrap overflow-ellipsis">
                  {!opts?.hideFavicon &&
                    opts?.itemDisplay !== ItemDisplayOption.Url && (
                      <img
                        className="w-4 h-4"
                        src={tab.favIconUrl || getDefaultFavIcon(tab.url)}
                      />
                    )}
                  {tab.title}
                </div>
              )}
              {[ItemDisplayOption.TitleAndUrl, ItemDisplayOption.Url].includes(
                opts?.itemDisplay as any,
              ) && (
                <div className="flex items-center gap-1 text-opacity-50 overflow-hidden whitespace-nowrap overflow-ellipsis">
                  {!opts?.hideFavicon &&
                    opts?.itemDisplay === ItemDisplayOption.Url && (
                      <img
                        className="w-4 h-4"
                        src={tab.favIconUrl || getDefaultFavIcon(tab.url)}
                      />
                    )}
                  {tab.url}
                </div>
              )}
            </a>
          </div>
        )
      }}
    </Draggable>
  )
}

export default TabItem
