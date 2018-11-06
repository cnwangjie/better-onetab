export const ILLEGAL_URLS = ['about:', 'chrome:', 'file:', 'wss:']

export const PICKED_TAB_PROPS = ['url', 'title', 'favIconUrl', 'pinned']
export const PICKED_LIST_RPOPS = ['_id', 'tabs', 'title', 'time', 'pinned', 'expand', 'color']
export const SYNCED_LIST_PROPS = ['_id', 'tabs', 'title', 'time', 'pinned', 'color']

export const TOKEN_KEY = 'token'
export const AUTH_HEADER = 'auth'

export const END_FRONT = 'front'
export const END_BACKGROUND = 'background'

export const SYNC_SERVICE_URL = DEBUG ? 'http://127.0.0.1:3000' : 'https://boss.cnwangjie.com'
