import { Card, MenuItem, Select, styled, Switch } from '@mui/material'
import { groupBy } from 'lodash/fp'
import React, { Fragment, useCallback } from 'react'
import { setOption, useOptions } from 'src/app/service/options'
import { optionsList, Type } from 'src/common/options/list'
import __ from 'src/common/util/i18n'
import { useSnackbar } from 'notistack'

const groupedOptions = groupBy('category', optionsList)

const StyledSelect = styled(Select)(() => {
  return {
    height: 32,
    width: 200,
    fontSize: 14,
  }
})

const Options = () => {
  const opts = useOptions()

  const { enqueueSnackbar } = useSnackbar()

  const handleChange = useCallback((name: string) => {
    return async (e: any) => {
      const value = e.target?.value ?? e
      await setOption(name, value)
      enqueueSnackbar(__('ui_opt_changes_saved'), {
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'center',
        }
      })
    }
  }, [])

  return (
    <div>
      {Object.entries(groupedOptions).map(([category, options]) => {
        return (
          <Fragment key={category}>
            <div className="flex items-center font-bold text-sm h-12">
              {__('ui_options_' + category)}
            </div>
            <Card className="divide-y">
              {options.map(option => {
                return (
                  <div
                    key={option.name}
                    className="flex items-center text-xs"
                    style={{
                      minHeight: 48,
                      padding: 8,
                    }}
                  >
                    <div className="flex-1">
                      {__('opt_name_' + option.name) || '!!! ' + option.name}
                    </div>

                    <div className="select-none">
                      {option.items && (
                        <StyledSelect
                          value={opts?.[option.name] || ''}
                          onChange={handleChange(option.name)}
                        >
                          {option.items.map(item => {
                            return (
                              <MenuItem key={item.label} value={item.value}>
                                {item.label}
                              </MenuItem>
                            )
                          })}
                        </StyledSelect>
                      )}

                      {option.type === Type.boolean && (
                        <Switch
                          checked={(opts?.[option.name] as boolean) ?? false}
                          onChange={(e, checked) => {
                            handleChange(option.name)(checked)
                          }}
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </Card>
          </Fragment>
        )
      })}
    </div>
  )
}

export default Options
