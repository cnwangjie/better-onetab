import { Button, Card, Tab, Tabs, TextField } from '@mui/material'
import { useSnackbar } from 'notistack'
import React, { FC, useCallback, useRef, useState } from 'react'
import { importFromText } from 'src/app/service/swap'
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

  const { enqueueSnackbar } = useSnackbar()

  const exportList = useCallback(async (compatible = false) => {
    if (processing.current) return
  }, [])

  const importList = useCallback(async (compatible = false) => {
    if (processing.current) return
    processing.current = true
    const data = await new Promise<string>(resolve =>
      setImportData(data => {
        resolve(data)
        return data
      }),
    )
    if (!data) return
    try {
      const results = await importFromText(data, compatible)
      enqueueSnackbar(__('ui_success_import_lists', [results.length]), {
        variant: 'success',
      })
    } catch (e) {
      enqueueSnackbar(__('ui_error_import_lists'), {
        variant: 'error',
      })
    } finally {
      processing.current = false
    }
  }, [])

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
          <Button variant="outlined" onClick={() => importList(true)}>
            {__('ui_import_comp')}
          </Button>
          <Button variant="outlined" onClick={() => importList()}>
            {__('ui_import_json')}
          </Button>
        </div>
        <div className="px-4 pb-4">
          <DataField
            value={importData}
            onChange={e => setImportData(e.target.value)}
            placeholder={__('ui_import_field_placeholder')}
          />
        </div>
      </TabPanel>
      <TabPanel value={currentTab} index={1}>
        <div className="flex gap-4 p-4">
          <Button variant="outlined">{__('ui_export_comp')}</Button>
          <Button variant="outlined">{__('ui_export_json')}</Button>
        </div>
        <div className="px-4 pb-4">
          <DataField
            value={exportData}
            onChange={e => setExportData(e.target.value)}
            placeholder={__('ui_export_field_placeholder')}
          />
        </div>
      </TabPanel>
    </Card>
  )
}

export default ImportExport
