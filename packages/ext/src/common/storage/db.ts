import { addRxPlugin, createRxDatabase } from 'rxdb/plugins/core'
import { getRxStorageLoki } from 'rxdb/plugins/lokijs'
import { RxDBJsonDumpPlugin } from 'rxdb/plugins/json-dump'
import { RxDBValidatePlugin } from 'rxdb/plugins/validate'
import { memoize } from 'lodash'

addRxPlugin(RxDBValidatePlugin)
addRxPlugin(RxDBJsonDumpPlugin)

if (DEBUG) {
  import('rxdb/plugins/dev-mode').then(({ RxDBDevModePlugin }) => {
    addRxPlugin(RxDBDevModePlugin)
  })
}

const LokiIncrementalIndexedDBAdapter = require('lokijs/src/incremental-indexeddb-adapter')

const DatabaseName = 'bodb'

export const getDB = memoize(async () => {
  console.log('init db')

  const db = (window.db = await createRxDatabase({
    name: DatabaseName,
    storage: getRxStorageLoki({
      adapter: new LokiIncrementalIndexedDBAdapter(),
    }),
  }))

  const collections = db.addCollections({
    lists: {
      schema: {
        version: 0,
        primaryKey: 'id',
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          title: {
            type: 'string',
          },
          pinned: {
            type: 'boolean',
          },
          color: {
            type: 'string',
          },
          order: {
            type: 'number',
          },
          createdAt: {
            type: 'number',
          },
          updatedAt: {
            type: 'number',
          },
        },
        indexes: ['order', 'createdAt', 'updatedAt', 'color'],
      },
    },
    tabs: {
      schema: {
        version: 0,
        primaryKey: 'id',
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          url: {
            type: 'string',
          },
          title: {
            type: 'string',
          },
          favIconUrl: {
            type: 'string',
          },
          pinned: {
            type: 'boolean',
          },
          listId: {
            type: 'string',
          },
          order: {
            type: 'number',
          },
        },
        indexes: ['listId', 'order'],
      },
    },
    tags: {
      schema: {
        version: 0,
        primaryKey: 'id',
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
        },
      },
    },
  })

  return collections
})

window.getDB
