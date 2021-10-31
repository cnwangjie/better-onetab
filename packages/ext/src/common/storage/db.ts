import {
  addPouchPlugin,
  createRxDatabase,
  getRxStoragePouch,
} from 'rxdb'
import memoize from 'lodash/memoize'

addPouchPlugin(require('pouchdb-adapter-idb'))

const DatabaseName = 'bodb'

export const getDB = memoize(async () => {
  const db = await createRxDatabase({
    name: DatabaseName,
    storage: getRxStoragePouch('idb'),
  })

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
        indexes: [
          'order',
        ]
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
        indexes: [
          'listId',
          'order',
        ]
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
