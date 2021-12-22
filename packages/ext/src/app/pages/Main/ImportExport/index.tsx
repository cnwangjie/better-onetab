import { Button, Card, Tab, Tabs, TextField } from '@mui/material'
import React, { FC, useCallback, useRef, useState } from 'react'
import withDefaultProps from 'src/app/util/withDefaultProps'
import __ from 'src/common/util/i18n'

const TabPanel: FC<{ value: number; index: number }> = ({
  children,
  value,
  index,
}) => {
  if (value !== index) return null

  return <div>{children}</div>
}

const DataField = withDefaultProps(TextField, {
  fullWidth: true,
  variant: 'outlined',
  multiline: true,
  minRows: 4,
  maxRows: 40,
})

const ImportExport = () => {
  const [currentTab, setCurrentTab] = useState(0)

  const [importData, setImportData] = useState('')
  const [exportData, setExportData] = useState('')
  const processing = useRef(false)

  const exportList = useCallback(
    async (compatible = false) => {
      if (processing.current) return

    },
    [],
  )

  return (
    <Card>
      <Tabs
        value={currentTab}
        onChange={(_, tab) => setCurrentTab(tab)}
        centered
      >
        <Tab label={__('ui_import')} />
        <Tab label={__('ui_export')} />
      </Tabs>
      <TabPanel value={currentTab} index={0}>
        <div className="flex gap-4 p-4">
          <Button variant="outlined">{__('ui_import_comp')}</Button>
          <Button variant="outlined">{__('ui_import_json')}</Button>
        </div>
        <div className="px-4 pb-4">
          <DataField placeholder={__('ui_import_field_placeholder')} />
        </div>
      </TabPanel>
      <TabPanel value={currentTab} index={1}>
        <div className="flex gap-4 p-4">
          <Button variant="outlined">{__('ui_export_comp')}</Button>
          <Button variant="outlined">{__('ui_export_json')}</Button>
        </div>
        <div className="px-4 pb-4">
          <DataField placeholder={__('ui_export_field_placeholder')} />
        </div>
      </TabPanel>
    </Card>
  )
}

export default ImportExport
