import { Icon } from '@iconify/react'
import { IconButton, IconButtonProps } from '@mui/material'
import React, { FC } from 'react'
import IconTooltip from './IconTooltip'

export interface StyledIconButtonProps extends IconButtonProps {
  icon: string
  title: string
}

const StyledIconButton: FC<StyledIconButtonProps> = ({
  icon,
  title,
  ...props
}) => {
  return (
    <IconTooltip title={title}>
      {/* for disabled button */}
      <span>
        <IconButton {...props} title={title}>
          <Icon icon={icon} />
        </IconButton>
      </span>
    </IconTooltip>
  )
}

export default StyledIconButton
