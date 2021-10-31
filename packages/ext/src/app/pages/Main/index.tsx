import React from 'react'
import { Route, Switch } from 'react-router-dom'
import AppLayout from '../../layout/AppLayout'
import DetailList from './DetailList'

const Main = () => {
  return (
    <AppLayout>
      <Switch>
        <Route path="/app/list">
          <DetailList />
        </Route>
      </Switch>
    </AppLayout>
  )
}

export default Main
