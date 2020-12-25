import React from 'react'
import { createBrowserHistory } from 'history'
import { loadableReady } from '@loadable/component'
import { Router } from 'react-router-dom'
import { hydrate } from 'react-dom'

import App from 'app'

const history = createBrowserHistory()

loadableReady(() => {
  hydrate(
    <Router history={history}>
      <App />
    </Router>,
    document.getElementById('app')
  )
})
