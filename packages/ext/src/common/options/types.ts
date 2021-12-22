import type { ItemDisplayOption } from './enums'

export interface Options {
  browserAction: string
  itemClickAction: string
  popupItemClickAction: string
  nightMode: string
  itemDisplay: ItemDisplayOption
  hideFavicon: boolean
  addHistory: boolean
  ignorePinned: boolean
  pinNewList: boolean
  pageContext: boolean
  allContext: boolean
  openTabListWhenNewTab: boolean
  alertRemoveList: boolean
  excludeIllegalURL: boolean
  removeDuplicate: boolean
  removeDuplicateCrossGroup: boolean
  openEnd: boolean
  openTabListNoTab: boolean
  listsPerPage: number
  titleFontSize: string
  disableDynamicMenu: boolean
  disableExpansion: boolean
  disableTransition: boolean
  disableSearch: boolean
}

export type OptionKey = keyof Options
