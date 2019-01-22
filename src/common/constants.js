export const COLORS = [
  '', 'red', 'pink', 'purple',
  'indigo', 'blue', 'cyan', 'teal',
  'green', 'yellow', 'orange', 'brown',
]

export const ILLEGAL_URLS = ['about:', 'chrome:', 'file:', 'wss:', 'ws:']

export const PICKED_TAB_PROPS = ['url', 'title', 'favIconUrl', 'pinned']
export const PICKED_LIST_RPOPS = ['_id', 'tabs', 'title', 'tags', 'time', 'pinned', 'expand', 'color']
export const SYNCED_LIST_PROPS = ['_id', 'tabs', 'title', 'tags', 'time', 'pinned', 'color']

export const TOKEN_KEY = 'token'
export const AUTH_HEADER = 'auth'

export const END_FRONT = 'front'
export const END_BACKGROUND = 'background'

export const SYNC_SERVICE_URL = DEBUG ? 'http://127.0.0.1:3000' : 'https://boss.cnwangjie.com'
export const SYNC_MAX_INTERVAL = 864e5

export const ADD_LIST = 'addList'
export const UPDATE_LIST_BY_ID = 'updateListById'
export const REMOVE_LIST_BY_ID = 'removeListById'
export const CHANGE_LIST_ORDER = 'changeListOrderRelatively'
