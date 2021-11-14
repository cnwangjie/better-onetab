import {
  Accordion,
  AccordionSummary,
  Checkbox,
  Chip,
  IconButton,
  styled,
  Tooltip,
} from '@mui/material'
import React, { FC } from 'react'
import __ from 'src/common/util/i18n'
import { useListTabs } from 'src/app/service'
import { formatTime } from 'src/common/util/formatDate'
import { Icon } from '@iconify/react'
import { getDefaultFavIcon } from 'src/common/util'

// TODO: Decrease the distance between element and tooltip. Not working here.
// unsolved ref: https://github.com/mui-org/material-ui/issues/19848
const StyledTooltip = styled(Tooltip)(() => ({
  [`& .MuiTooltip-tooltipPlacementBottom`]: {
    marginTop: 0,
  },
}))

const ListGroup: FC<{ list: any }> = ({ list }) => {
  const { data: tabs } = useListTabs(list.id)

  const buttons = [
    {
      title: 'bulk operation',
      icon: 'mdi:dots-vertical',
    },
    {
      title: __('ui_retitle_list'),
      icon: 'mdi:form-textbox',
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
    <Accordion className="group" TransitionProps={{ unmountOnExit: true }} expanded>
      <AccordionSummary>
        <div className="flex items-center gap-4 w-full h-7">
          <Chip size="small" label={`${tabs?.length || 0} ${__('ui_tab')}`} />
          {__('ui_created')} {formatTime(list.createdAt)}
          <div className="flex-1" />
          <div
            className="hidden gap-1 group-hover:flex"
            onClick={e => e.stopPropagation()}
          >
            <IconButton size="small">
              <Icon icon="mdi:arrow-up" />
            </IconButton>
            <IconButton size="small">
              <Icon icon="mdi:arrow-down" />
            </IconButton>
            <IconButton size="small">
              <Icon icon="mdi:pin" />
            </IconButton>
          </div>
        </div>
      </AccordionSummary>
      <div className="flex border-b h-10 items-center pl-9">
        <Checkbox />
        {buttons.map(({ title, icon }) => {
          return (
            <StyledTooltip title={title} key={title} open>
              <IconButton>
                <Icon icon={icon} />
              </IconButton>
            </StyledTooltip>
          )
        })}
      </div>
      <div className="py-1">
        {tabs?.map((tab, index) => {
          return (
            <div key={tab.id} className="flex h-10 w-full items-center pl-3">
              <Icon icon="mdi:drag-vertical" width="24" height="24" />
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
        })}
      </div>
    </Accordion>
  )
}

export default ListGroup
