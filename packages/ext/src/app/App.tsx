import React, { FC, lazy, Suspense, useEffect, useState } from 'react'
import { createHashHistory } from 'history'
import { Router, Switch, Route } from 'react-router-dom'
import './index.css'
import ColorModeProvider from './component/ColorMode'
import { SnackbarProvider } from 'notistack'
import { DynamicCreateElementContainer } from './util/dynamicCreate'
import renderNested from './util/renderNested'
import storage from 'src/common/storage'
import { getDB } from 'src/common/storage/db'

export const history = createHashHistory()

const Popup = lazy(
  () => import(/* webpackChunkName: "popup" */ './pages/Popup'),
)
const Main = lazy(() => import(/* webpackChunkName: "main" */ './pages/Main'))

const App: FC = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let time = Date.now()
    getDB().then(db => {
      console.log(`db loaded in ${Date.now() - time}ms`)
      setLoading(false)
    })
  }, [])

  if (loading) return <div>loading...</div>

  return renderNested(
    [
      [Suspense, { fallback: '' }],
      [Router, { history }],
      DynamicCreateElementContainer,
      ColorModeProvider,
      [
        SnackbarProvider,
        {
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'center',
          },
        },
      ],
    ],
    <Switch>
      <Route exact path="/popup">
        <Popup />
      </Route>
      <Route path="/app">
        <Main />
      </Route>
    </Switch>,
  )
}

export default App
