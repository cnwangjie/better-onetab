import React, { useMemo } from 'react'
import { matchPath, Route, Switch, useRouteMatch } from 'react-router-dom'
import AppLayout, { DividerIdentifier, TabConfig } from '../../layout/AppLayout'
import DetailList from './DetailList'
import { history } from '../../App'
import Options from './Options'

interface RouteConfig {
  key: string
  label: string
  icon: string
  path: string
  exact?: boolean
}

const routes: RouteConfig[] = [
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

const extraRoutes: RouteConfig[] = [
  {
    key: 'Options',
    label: 'Options',
    icon: 'mdi:cog',
    path: '/app/options',
    exact: true,
  }
]

const createTab = ({ key, label, icon, path }: RouteConfig): TabConfig => {
  return {
    key,
    label,
    icon,
    to: path,
  }
}

const Main = () => {
  const tabs = useMemo(() => {
    return [
      routes.map(createTab),
      extraRoutes.map(createTab),
    ]
  }, [])

  useRouteMatch()

  const activeTab = useMemo(() => {
    return (
      [...routes, ...extraRoutes].find(({ path, exact }) => {
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
        <Route path="/app/options" exact>
          <Options />
        </Route>
        <Route path="/app" exact>
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