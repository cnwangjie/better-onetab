import { BrowserAction } from '../constants'
import { __ } from '../util/i18n'
import { OptionKey, Options } from './types'

export enum Category {
  behavior = 'behavior',
  appearance = 'appearance',
  performance = 'performance',
}

export enum Type {
  boolean = 'boolean',
  string = 'string',
}

interface OptionItem {
  value: any
  label: string | number
}

interface OptionConfig {
  category: Category
  name: OptionKey
  desc?: string
  type: Type
  deps?: (opt: Options) => boolean
  default: any
  items?: OptionItem[]
  new?: string
  deprecated?: string
}

export const browserActionConfigItems = [
  {
    value: BrowserAction.Popup,
    label: __('opt_label_popup'),
  },
  {
    value: BrowserAction.StoreSelected,
    label: __('opt_label_store_selected'),
  },
  {
    value: BrowserAction.StoreAll,
    label: __('opt_label_store_all'),
  },
  {
    value: BrowserAction.ShowList,
    label: __('opt_label_show_list'),
  },
  {
    value: BrowserAction.None,
    label: __('opt_label_none'),
  },
]

export const optionsList: OptionConfig[] = [
  {
    category: Category.behavior,
    name: 'browserAction',
    type: Type.string,
    default: 'show-list',
    items: browserActionConfigItems,
  },
  {
    category: Category.behavior,
    name: 'itemClickAction',
    type: Type.string,
    default: 'open-and-remove',
    items: [
      {
        value: 'open-and-remove',
        label: __('opt_label_open_and_remove'),
      },
      {
        value: 'open',
        label: __('opt_label_open'),
      },
      {
        value: 'none',
        label: __('opt_label_none'),
      },
    ],
  },
  {
    category: Category.behavior,
    name: 'popupItemClickAction',
    type: Type.string,
    default: 'restore',
    items: [
      {
        value: 'restore',
        label: __('opt_label_restore'),
      },
      {
        value: 'restore-new-window',
        label: __('opt_label_restore_new_window'),
      },
      {
        value: 'none',
        label: __('opt_label_none'),
      },
    ],
  },
  {
    category: Category.appearance,
    name: 'nightMode',
    type: Type.string,
    default: 'off',
    items: [
      {
        value: 'off',
        label: __('opt_label_off'),
      },
      {
        value: 'on',
        label: __('opt_label_on'),
      },
      {
        value: 'auto',
        label: __('opt_label_auto'),
      },
    ],
  },
  {
    category: Category.appearance,
    name: 'itemDisplay',
    type: Type.string,
    default: 'title-and-url',
    items: [
      {
        value: 'title-and-url',
        label: __('opt_label_title_and_url'),
      },
      {
        value: 'title',
        label: __('opt_label_title'),
      },
      {
        value: 'url',
        label: __('opt_label_url'),
      },
    ],
  },
  {
    category: Category.appearance,
    name: 'hideFavicon',
    type: Type.boolean,
    default: false,
  },
  {
    category: Category.behavior,
    name: 'addHistory',
    type: Type.boolean,
    default: true,
  },
  {
    category: Category.behavior,
    name: 'ignorePinned',
    type: Type.boolean,
    default: false,
  },
  {
    category: Category.behavior,
    name: 'pinNewList',
    type: Type.boolean,
    default: false,
  },
  {
    category: Category.behavior,
    name: 'pageContext',
    type: Type.boolean,
    default: true,
  },
  {
    category: Category.behavior,
    name: 'allContext',
    type: Type.boolean,
    default: false,
    deps: ({ pageContext }) => pageContext,
    new: '1.3.6',
  },
  {
    category: Category.behavior,
    name: 'openTabListWhenNewTab',
    desc: __('opt_desc_openTabListWhenNewTab'),
    deps: ({ disableDynamicMenu }) => !disableDynamicMenu,
    type: Type.boolean,
    default: false,
  },
  {
    category: Category.behavior,
    name: 'alertRemoveList',
    type: Type.boolean,
    default: false,
  },
  {
    category: Category.behavior,
    name: 'excludeIllegalURL',
    type: Type.boolean,
    default: true,
    new: '1.3.6',
  },
  {
    category: Category.behavior,
    name: 'removeDuplicate',
    type: Type.boolean,
    default: false,
    new: '1.3.6',
  },
  {
    category: Category.behavior,
    name: 'openEnd',
    type: Type.boolean,
    default: true,
    new: '1.3.9',
  },
  {
    category: Category.behavior,
    name: 'openTabListNoTab',
    type: Type.boolean,
    default: true,
    new: '1.4.0',
  },
  {
    category: Category.appearance,
    name: 'listsPerPage',
    type: Type.string,
    default: 10,
    items: [
      {
        value: 5,
        label: 5,
      },
      {
        value: 10,
        label: 10,
      },
      {
        value: 15,
        label: 15,
      },
    ],
    new: '1.4.0',
  },
  {
    category: Category.appearance,
    name: 'titleFontSize',
    type: Type.string,
    default: '12px',
    items: [
      {
        value: '12px',
        label: '12px',
      },
      {
        value: '18px',
        label: '18px',
      },
      {
        value: '24px',
        label: '24px',
      },
    ],
    new: '1.4.0',
  },
  {
    category: Category.performance,
    name: 'disableDynamicMenu',
    type: Type.boolean,
    default: false,
    new: '1.4.0',
  },
  {
    category: Category.performance,
    name: 'disableExpansion',
    type: Type.boolean,
    default: false,
    new: '1.4.0',
  },
  {
    category: Category.performance,
    name: 'disableTransition',
    type: Type.boolean,
    default: false,
    new: '1.4.0',
  },
  {
    category: Category.performance,
    name: 'disableSearch',
    type: Type.boolean,
    default: false,
    new: '1.4.0',
  },
]
