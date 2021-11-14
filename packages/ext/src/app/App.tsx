import React, { lazy, Suspense } from 'react'
import { createHashHistory } from 'history'
import { Router, Switch, Route } from 'react-router-dom'
import './index.css'
import ColorModeProvider from './component/ColorMode'

export const history = createHashHistory()

const Popup = lazy(() => import(/* webpackChunkName: "popup" */ './pages/Popup'))
const Main = lazy(() => import(/* webpackChunkName: "main" */ './pages/Main'))

const App = () => {
  return (
    <ColorModeProvider>
      <Router history={history}>
        <Suspense fallback={''}>
          <Switch>
            <Route exact path="/popup">
              <Popup />
            </Route>
            <Route path="/app">
              <Main />
            </Route>
          </Switch>
        </Suspense>
      </Router>
    </ColorModeProvider>
  )
}

export default App
