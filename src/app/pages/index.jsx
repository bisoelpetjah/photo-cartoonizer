import React from 'react'
import { Switch, Route } from 'react-router-dom'

import Home from './Home'
import NotFound from 'app/components/NotFound'

const Pages = () => (
  <Switch>
    <Route
      path="/"
      exact
      component={Home} />
    <Route component={NotFound} />
  </Switch>
)

export default Pages
