import { unescape, escape, set } from 'lodash/fp'
import React, { useCallback, useRef, useState } from 'react'
import ContentEditable from 'react-contenteditable'
import { changeList } from 'src/app/service/list'
import { useDetailListContext } from '..'

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

export default useChangeableListTitle
