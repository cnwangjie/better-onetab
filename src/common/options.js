import _ from 'lodash'
import __ from '@/common/i18n'

const cate = {
  BEHAVIOUR: 'behaviour',
  APPEARANCE: 'appearance',
  PERFOREMANCE: 'performance',
}

export const optionsList = [
  {
    cate: cate.BEHAVIOUR,
    name: 'browserAction',
    type: String,
    default: 'show-list',
    items: [
      {
        value: 'popup',
        label: __('opt_label_popup'),
      },
      {
        value: 'store-selected',
        label: __('opt_label_store_selected'),
      },
      {
        value: 'store-all',
        label: __('opt_label_store_all'),
      },
      {
        value: 'show-list',
        label: __('opt_label_show_list'),
      },
      {
        value: 'none',
        label: __('opt_label_none'),
      },
    ],
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'itemClickAction',
    type: String,
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
    cate: cate.BEHAVIOUR,
    name: 'popupItemClickAction',
    type: String,
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
    cate: cate.APPEARANCE,
    name: 'removeItemBtnPos',
    type: String,
    default: 'left',
    items: [
      {
        value: 'left',
        label: __('opt_label_left'),
      },
      {
        value: 'right',
        label: __('opt_label_right'),
      },
    ],
    deprecated: '1.4',
  },
  {
    cate: cate.APPEARANCE,
    name: 'defaultNightMode',
    type: Boolean,
    default: false,
  },
  {
    cate: cate.APPEARANCE,
    name: 'itemDisplay',
    type: String,
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
    cate: cate.APPEARANCE,
    name: 'hideFavicon',
    type: Boolean,
    default: false,
  },
  {
    cate: cate.APPEARANCE,
    name: 'fixedToolbar',
    type: Boolean,
    default: false,
    deprecated: '1.4',
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'addHistory',
    type: Boolean,
    default: true,
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'ignorePinned',
    type: Boolean,
    default: false,
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'pinNewList',
    type: Boolean,
    default: false,
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'pageContext',
    type: Boolean,
    default: true,
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'allContext',
    type: Boolean,
    default: false,
    deps: ({pageContext}) => pageContext,
    new: '1.3.6',
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'openTabListWhenNewTab',
    desc: true,
    deps: ({disableDynamicMenu}) => !disableDynamicMenu,
    type: Boolean,
    default: false,
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'alertRemoveList',
    type: Boolean,
    default: false,
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'excludeIllegalURL',
    type: Boolean,
    default: true,
    new: '1.3.6',
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'removeDuplicate',
    type: Boolean,
    default: false,
    new: '1.3.6',
  },
  {
    cate: cate.APPEARANCE,
    name: 'enableSearch',
    type: Boolean,
    default: true,
    new: '1.3.7',
    deprecated: '1.4',
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'openEnd',
    type: Boolean,
    default: true,
    new: '1.3.9',
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'openTabListNoTab',
    type: Boolean,
    default: true,
    new: '1.4.0',
  },
  {
    cate: cate.APPEARANCE,
    name: 'listsPerPage',
    type: String,
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
    cate: cate.APPEARANCE,
    name: 'titleFontSize',
    type: String,
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
    cate: cate.PERFOREMANCE,
    name: 'disableDynamicMenu',
    type: Boolean,
    default: false,
    new: '1.4.0',
  },
  {
    cate: cate.PERFOREMANCE,
    name: 'disableExpansion',
    type: Boolean,
    default: false,
    new: '1.4.0',
  },
  {
    cate: cate.PERFOREMANCE,
    name: 'disableTransition',
    type: Boolean,
    default: false,
    new: '1.4.0',
  },
  {
    cate: cate.PERFOREMANCE,
    name: 'disableSearch',
    type: Boolean,
    default: false,
    new: '1.4.0',
  },
]

const availableOptionsList = optionsList.filter(i => !i.deprecated)

if (DEBUG) {
  console.debug('current options number', availableOptionsList.length)
  window.printOptionsMap = () => console.debug(availableOptionsList.map(i => i.name + ': ' + i.type.name + ',').join('\n'))
}


const getDefaultOptions = () => _.mapValues(_.keyBy(availableOptionsList, 'name'), i => i.default)

export default {getDefaultOptions, optionsList: availableOptionsList}
