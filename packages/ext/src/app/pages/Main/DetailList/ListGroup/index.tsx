import {
  Accordion,
  AccordionSummary,
  Checkbox,
  Chip,
  IconButton,
} from '@mui/material'
import React, {
  FC,
} from 'react'
import __ from 'src/common/util/i18n'
import { useListTabs } from 'src/app/service'
import { formatTime } from 'src/common/util/formatDate'
import { Icon } from '@iconify/react'
import { Droppable } from 'react-beautiful-dnd'
import TabItem from '../TabItem'
import IconTooltip from 'src/app/component/IconTooltip'
import useChecked from './useChecked'
import useChangeableListTitle from './useChangeableListTitle'

const ListGroup: FC<{ list: any }> = ({ list }) => {
  const { data: tabs } = useListTabs(list.id)

  const {
    checked,
    handleCheckedChange,
    someChecked,
    allChecked,
    indeterminate,
    handleCheckAll,
  } = useChecked(tabs)

  const { title, handleChangeListTitle } = useChangeableListTitle(list)

  const buttons = [
    {
      title: 'bulk operation',
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
    },
    {
      title: __('ui_restore_all_in_new_window'),
      icon: 'mdi:window-restore',
    },
    {
      title: __('ui_remove_list'),
      icon: 'mdi:playlist-remove',
    },
    {
      title: 'edit tag',
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
            <IconTooltip title="move up">
              <IconButton size="small">
                <Icon icon="mdi:arrow-up" />
              </IconButton>
            </IconTooltip>
            <IconTooltip title="move down">
              <IconButton size="small">
                <Icon icon="mdi:arrow-down" />
              </IconButton>
            </IconTooltip>
            <IconTooltip title="pin list">
              <IconButton size="small">
                <Icon icon="mdi:pin" />
              </IconButton>
            </IconTooltip>
          </div>
        </div>
      </AccordionSummary>
      <div className="flex border-b h-10 items-center pl-5">
        <Checkbox
          checked={!!allChecked}
          indeterminate={!!indeterminate}
          onChange={handleCheckAll}
        />
        {buttons.map(({ title, icon, disabled, onClick }) => {
          return (
            <IconTooltip title={title} key={title}>
              <IconButton disabled={disabled} onClick={onClick}>
                <Icon icon={icon} />
              </IconButton>
            </IconTooltip>
          )
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
