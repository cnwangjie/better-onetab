import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  IconButton,
} from '@mui/material'
import React, { FC } from 'react'
import __ from 'src/common/util/i18n'
import { useListTabs } from 'src/app/service'
import { formatTime } from 'src/common/util/formatDate'
import { Icon } from '@iconify/react'

const ListGroup: FC<{ list: any }> = ({ list }) => {
  const { data: tabs } = useListTabs(list.id)

  return (
    <Accordion className="group">
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
      <AccordionDetails>
        {tabs?.map((tab, index) => {
          return <div key={index}>{tab.url}</div>
        })}
      </AccordionDetails>
    </Accordion>
  )
}

export default ListGroup
