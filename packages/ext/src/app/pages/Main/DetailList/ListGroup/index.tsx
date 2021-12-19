import { Accordion, AccordionSummary, Chip } from '@mui/material'
import React, { FC } from 'react'
import __ from 'src/common/util/i18n'
import { useListTabs } from 'src/app/service'
import { formatTime } from 'src/common/util/formatDate'
import { Droppable } from 'react-beautiful-dnd'
import TabItem from '../TabItem'
import useChecked from './useChecked'
import useChangeableListTitle from './useChangeableListTitle'
import StyledIconButton from 'src/app/component/StyledIconButton'
import type { List } from 'src/common/storage/lists'
import useHandler from './useHandler'

const ListGroup: FC<{ list: List }> = ({ list }) => {
  const { data: tabs } = useListTabs(list.id)

  const { checked, handleCheckedChange, someChecked, checkAllBox } = useChecked(
    tabs,
  )

  const { title, handleChangeListTitle } = useChangeableListTitle(list)

  const {
    handleRestoreAll,
    removeList,
  } = useHandler(list, tabs)

  const buttons = [
    {
      title: __('ui_bulk_operation'),
      icon: 'mdi:dots-vertical',
      disabled: !someChecked,
    },
    {
      title: __('ui_retitle_list'),
      icon: 'mdi:form-textbox',
      onClick: handleChangeListTitle,
    },
    {
      title: __('ui_restore_all'),
      icon: 'mdi:restore',
      onClick: handleRestoreAll(),
    },
    {
      title: __('ui_restore_all_in_new_window'),
      icon: 'mdi:window-restore',
      onClick: handleRestoreAll(true),
    },
    {
      title: __('ui_remove_list'),
      icon: 'mdi:playlist-remove',
      onClick: removeList,
    },
    {
      title: __('ui_edit_tag'),
      icon: 'mdi:tag-text',
    },
  ]

  return (
    <Accordion
      className="group"
      TransitionProps={{ unmountOnExit: true }}
      defaultExpanded
    >
      <AccordionSummary>
        <div className="flex items-center gap-4 w-full h-7">
          <Chip size="small" label={`${tabs?.length || 0} ${__('ui_tab')}`} />
          {__('ui_created')} {formatTime(list.createdAt)}
          {title}
          <div
            className="hidden gap-1 group-hover:flex"
            onClick={e => e.stopPropagation()}
          >
            <StyledIconButton
              title={__('ui_move_up')}
              size="small"
              icon="mdi:arrow-up"
            />
            <StyledIconButton
              title={__('ui_move_down')}
              size="small"
              icon="mdi:arrow-down"
            />
            <StyledIconButton
              title={__('ui_pin_list')}
              size="small"
              icon="mdi:pin"
            />
          </div>
        </div>
      </AccordionSummary>
      <div className="flex border-b h-10 items-center pl-5">
        {checkAllBox}
        {buttons.map((props, index) => {
          return <StyledIconButton key={index} {...props} />
        })}
      </div>
      <div className="py-1">
        <Droppable droppableId={list.id}>
          {({ droppableProps, innerRef, placeholder }) => {
            return (
              <div ref={innerRef} {...droppableProps}>
                {tabs?.map((tab, index) => {
                  return (
                    <TabItem
                      key={tab.id}
                      tab={tab}
                      index={index}
                      checked={!!checked[tab.id]}
                      onCheckedChange={handleCheckedChange(tab.id)}
                    />
                  )
                })}
                {placeholder}
              </div>
            )
          }}
        </Droppable>
      </div>
    </Accordion>
  )
}

export default ListGroup
