import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import React, { FC, ReactNode, useState } from 'react'
import __ from 'src/common/util/i18n'
import { dynamicCreateElement } from '../util/dynamicCreate'

interface ConfirmProps {
  title?: string
  defaultOpen?: boolean
  description?: ReactNode
  submitText: string
  cancelText: string
  afterClose?: () => void
  onSubmit?: () => void
  onCancel?: () => void
}

const Confirm: FC<ConfirmProps> = ({
  title,
  defaultOpen = false,
  description,
  submitText,
  cancelText,
  afterClose,
  onCancel,
  onSubmit,
}) => {
  const [open, setOpen] = useState(defaultOpen)

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => afterClose?.(), 300)
  }

  const cancel = () => {
    onCancel?.()
    handleClose()
  }

  const submit = () => {
    onSubmit?.()
    handleClose()
  }

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={cancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      {title && <DialogTitle id="alert-dialog-title">{title}</DialogTitle>}
      {description && (
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {description}
          </DialogContentText>
        </DialogContent>
      )}
      <DialogActions>
        <Button onClick={cancel}>{cancelText}</Button>
        <Button onClick={submit}>{submitText}</Button>
      </DialogActions>
    </Dialog>
  )
}

export default Confirm

export const confirm = ({
  title,
  description,
  submitText = __('ui_confirm'),
  cancelText = __('ui_cancel'),
}: Partial<ConfirmProps>) => {
  return new Promise<boolean>(resolve => {
    const clear = dynamicCreateElement(
      <Confirm
        defaultOpen
        title={title}
        description={description}
        submitText={submitText}
        cancelText={cancelText}
        onSubmit={() => resolve(true)}
        onCancel={() => resolve(false)}
        afterClose={() => clear?.()}
      />,
    )
  })
}
