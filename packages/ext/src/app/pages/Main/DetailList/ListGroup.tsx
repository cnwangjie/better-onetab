import {
  Accordion,
  AccordionSummary,
  Checkbox,
  Chip,
  IconButton,
} from '@mui/material'
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import __ from 'src/common/util/i18n'
import { useListTabs } from 'src/app/service'
import { formatTime } from 'src/common/util/formatDate'
import { Icon } from '@iconify/react'
import { Droppable } from 'react-beautiful-dnd'
import TabItem from './TabItem'
import IconTooltip from 'src/app/component/IconTooltip'
import { unescape, fromPairs, pick, escape, set } from 'lodash/fp'
import { Tab } from 'src/common/storage/tabs'
import ContentEditable from 'react-contenteditable'
import { useDetailListContext } from '.'
import { changeList } from 'src/app/service/list'

const useChecked = (tabs?: Tab[]) => {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setChecked(checked => {
      return pick(tabs?.map(tab => tab.id) || [], checked)
    })
  }, [tabs])

  const handleCheckedChange = useCallback((id: string) => {
    return (target: boolean) => {
      setChecked(checked => {
        return {
          ...checked,
          [id]: target,
        }
      })
    }
  }, [])

  const someChecked = useMemo(() => {
    return tabs?.map(tab => tab.id).some(id => checked[id])
  }, [checked, tabs])

  const allChecked = useMemo(() => {
    return tabs?.map(tab => tab.id).every(id => checked[id])
  }, [checked, tabs])

  const indeterminate = useMemo(() => {
    return someChecked && !allChecked
  }, [checked, tabs])

  const handleCheckAll = useCallback(() => {
    allChecked
      ? setChecked({})
      : setChecked(fromPairs(tabs?.map(tab => [tab.id, true]) ?? []))
  }, [allChecked, indeterminate, tabs])

  return {
    checked,
    handleCheckedChange,
    someChecked,
    allChecked,
    indeterminate,
    handleCheckAll,
  }
}

const useChangeableListTitle = (list: any) => {
  const titleRef = useRef<HTMLDivElement>(null)
  const [titleEditing, setTitleEditing] = useState(false)
  const [value, setValue] = useState('')
  const { mutate } = useDetailListContext()
  const handleChangeListTitle = useCallback(() => {
    setTitleEditing(true)
    setValue(list?.title || '')
    setTimeout(() => {
      if (!titleRef.current) return
      titleRef.current.focus()
      window.getSelection()?.selectAllChildren(titleRef.current)
    })
  }, [list])

  const submitListTitleChange = useCallback(async () => {
    const title = await new Promise<string>(resolve => {
      setValue(value => (resolve(value), value))
    })
    await changeList(list.id, {
      title,
    })
    setTitleEditing(false)
    mutate?.((data: any) => {
      const index = data?.result?.findIndex((i: any) => i.id === list.id)
      if (index != null && index != -1) return set(['result', index, 'title'], title, data)
      return data
    })
  }, [])

  const className = 'flex-1 h-full flex items-center font-medium text-sm'

  const title = titleEditing ? (
    <ContentEditable
      className={className}
      innerRef={titleRef}
      html={escape(value)}
      onChange={e => {
        const value = unescape(e.target.value).slice(0, 255)
        console.log(value)
        setValue(value)
      }}
      onFocus={e => e.stopPropagation()}
      onClick={e => {
        e.stopPropagation()
      }}
      onKeyPress={e => {
        if (e.key === 'Enter') {
          submitListTitleChange()
          e.preventDefault()
          return
        }
        if (e.key === 'Escape') setTitleEditing(false)
      }}
    />
  ) : (
    <div className={className}>{list.title}</div>
  )

  return {
    title,
    handleChangeListTitle,
  }
}

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
