import React from 'react'
import express from 'express'
import path from 'path'
import { ChunkExtractor, ChunkExtractorManager } from '@loadable/server'
import { StaticRouter } from 'react-router'
import { renderToString } from 'react-dom/server'
import 'marko/node-require'
import marko from '@marko/express'

import manifest from '../../manifest.json'

import App from 'app'
import { cartoonize } from './utils/cartoonize'

import template from './index.marko'

const app = express()

app.use(express.static(path.resolve(__dirname, '..', '..', 'public')))

app.post('/cartoonize', express.text({ limit: '50mb' }), (req, res) => {
  const base64File = req.body

  const base64Result = cartoonize(base64File)

  res.header('content-type', 'text/plain')
  return res.send(base64Result)
})

app.use((req, res, next) => {
  const routerContext = {}

  const extractor = new ChunkExtractor({
    stats: manifest,
    entrypoints: ['app'],
  })

  const component = (
    <ChunkExtractorManager extractor={extractor}>
      <StaticRouter location={req.url} context={routerContext}>
        <App />
      </StaticRouter>
    </ChunkExtractorManager>
  )

  const componentString = renderToString(component)

  if (routerContext.url) return res.redirect(routerContext.url)

  res.data = {
    assets: {
      linkTags: extractor.getLinkTags(),
      styleTags: extractor.getStyleTags(),
      scriptTags: extractor.getScriptTags(),
    },
    content: componentString,
  }

  return next()
})

app.use(marko())

app.get('*', (req, res) => res.marko(template, res.data))

export default app
