import _ from 'lodash'
import {genObjectId} from './utils'
import {normalizeTab} from './tab'
import {PICKED_LIST_RPOPS} from './constants'

export const createNewTabList = ({_id, tabs, title, tags, time, pinned, expand, color, updatedAt}) => ({
  _id: _id || genObjectId(),
  tabs: Array.isArray(tabs) ? tabs.map(normalizeTab) : [],
  title: title || '',
  tags: tags || [],
  time: time || Date.now(),
  titleEditing: false,
  pinned: pinned === true, // default is false
  expand: expand !== false, // default is true
  color: color || '',
  updatedAt: updatedAt || time || Date.now(),
})

export const validateList = list => list != null && Array.isArray(list.tabs)

// Preserving the needed properties before store lists.
export const normalizeList = list => {
  const normalizedList = _.pick(list, PICKED_LIST_RPOPS)
  normalizedList.tabs = normalizedList.tabs.map(normalizeTab)
  return normalizedList
}

export default {createNewTabList, normalizeList, validateList}
