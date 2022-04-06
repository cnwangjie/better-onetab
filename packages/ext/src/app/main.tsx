import React from 'react'
import ReactDOM from 'react-dom'
import browser from 'webextension-polyfill'
import App from './App'
import * as store from './store'

// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('app'),
// )

window.store = store
window.browser = browser
const LokiIncrementalIndexeddbAdapter = require('lokijs/src/incremental-indexeddb-adapter')
const Loki = ((window as any).Loki = require('lokijs'))

const initLoki = async () => {
  const time = Date.now()
  const loki = ((window as any).loki = new Loki('bodb.db', {
    adapter: new LokiIncrementalIndexeddbAdapter(),
  }))
  const re = await new Promise(resolve => {
    loki.loadDatabase({}, resolve)
  })
  const lists = loki.getCollection('lists')
  const tabs = loki.getCollection('tabs')
  const tags = loki.getCollection('tags')

  console.log(`loki loaded in ${Date.now() - time}ms`)
  console.log(lists)
  console.log(tabs)
  console.log(tags)
}

initLoki()
