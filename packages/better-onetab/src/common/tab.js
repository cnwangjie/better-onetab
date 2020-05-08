import _ from 'lodash'
import {PICKED_TAB_PROPS} from './constants'

// it also be applied for the browser Tab object
export const normalizeTab = tab => {
  const normalizedTab = _.pick(tab, PICKED_TAB_PROPS)
  normalizedTab.muted = normalizedTab.muted || tab.mutedInfo && tab.mutedInfo.muted
  return normalizedTab
}
