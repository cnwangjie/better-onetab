import React, { useMemo } from 'react'
import { matchPath, Route, Switch, useRouteMatch } from 'react-router-dom'
import AppLayout from '../../layout/AppLayout'
import DetailList from './DetailList'
import { history } from '../../App'

const routes = [
  {
    key: 'Tab lists',
    label: 'Tab lists',
    icon: 'mdi:view-list',
    path: '/app/list',
    exact: true,
  },
  {
    key: 'Pinned',
    label: 'Pinned',
    icon: 'mdi:pin-outline',
    path: '/app/list/pinned',
  },
]

const Main = () => {
  const tabs = useMemo(() => {
    return routes.map(({ key, label, icon, path }) => {
      return {
        key,
        label,
        icon,
        to: path,
      }
    })
  }, [])

  useRouteMatch()

  const activeTab = useMemo(() => {
    return (
      routes.find(({ path, exact }) => {
        const match = matchPath(history.location.pathname, {
          path,
          exact,
        })
        return match
      }) || routes[0]
    )
  }, [history.location.pathname])

  return (
    <AppLayout tabs={tabs} activeTab={activeTab.key}>
      <Switch>
        <Route path="/app">
          <DetailList />
        </Route>
        <Route path="/app/list">
          <DetailList />
        </Route>
      </Switch>
    </AppLayout>
  )
}

export default Main
