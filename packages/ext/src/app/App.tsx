import React, { lazy, Suspense } from 'react'
import { createHashHistory } from 'history'
import { Router, Switch, Route } from 'react-router-dom'
import './index.css'
import ColorModeProvider from './component/ColorMode'
import { SnackbarProvider } from 'notistack'
import { DynamicCreateElementContainer } from './util/dynamicCreate'
import renderNested from './util/renderNested'

export const history = createHashHistory()

const Popup = lazy(() =>
  import(/* webpackChunkName: "popup" */ './pages/Popup'),
)
const Main = lazy(() => import(/* webpackChunkName: "main" */ './pages/Main'))

const App = () => {
  return renderNested(
    [
      [Suspense, { fallback: '' }],
      [Router, { history }],
      DynamicCreateElementContainer,
      ColorModeProvider,
      SnackbarProvider,
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
