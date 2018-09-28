import _ from 'lodash'
import __ from '@/common/i18n'

const cate = {
  BEHAVIOUR: 'behaviour',
  APPEARANCE: 'appearance',
  // SYNC: 'sync',
}

export const optionsList = [
  {
    cate: cate.BEHAVIOUR,
    name: 'browserAction',
    desc: __('opt_desc_browserAction'),
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
    desc: __('opt_desc_itemClickAction'),
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
    desc: __('opt_desc_popupItemClickAction'),
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
    desc: __('opt_desc_removeItemBtnPos'),
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
  },
  {
    cate: cate.APPEARANCE,
    name: 'defaultNightMode',
    desc: __('opt_desc_defaultNightMode'),
    type: Boolean,
    default: false,
  },
  {
    cate: cate.APPEARANCE,
    name: 'itemDisplay',
    desc: __('opt_desc_itemDisplay'),
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
    desc: __('opt_desc_hideFavicon'),
    type: Boolean,
    default: false,
  },
  {
    cate: cate.APPEARANCE,
    name: 'fixedToolbar',
    desc: __('opt_desc_fixedToolbar'),
    type: Boolean,
    default: false,
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'addHistory',
    desc: __('opt_desc_addHistory'),
    type: Boolean,
    default: true,
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'ignorePinned',
    desc: __('opt_desc_ignorePinned'),
    type: Boolean,
    default: false,
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'pinNewList',
    desc: __('opt_desc_pinNewList'),
    type: Boolean,
    default: false,
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'pageContext',
    desc: __('opt_desc_pageContext'),
    type: Boolean,
    default: true,
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'allContext',
    desc: __('opt_desc_allContext'),
    type: Boolean,
    default: false,
    deps: 'pageContext',
    new: '1.3.6',
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'openTabListWhenNewTab',
    desc: __('opt_desc_openTabListWhenNewTab'),
    type: Boolean,
    default: false,
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'alertRemoveList',
    desc: __('opt_desc_alertRemoveList'),
    type: Boolean,
    default: false,
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'excludeIllegalURL',
    desc: __('opt_desc_excludeIllegalURL'),
    type: Boolean,
    default: true,
    new: '1.3.6',
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'removeDuplicate',
    desc: __('opt_desc_removeDuplicate'),
    type: Boolean,
    default: false,
    new: '1.3.6',
  },
  {
    cate: cate.APPEARANCE,
    name: 'enableSearch',
    desc: __('opt_desc_enableSearch'),
    type: Boolean,
    default: true,
    new: '1.3.7',
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'openEnd',
    desc: __('opt_desc_openEnd'),
    type: Boolean,
    default: true,
    new: '1.3.9',
  },
]

if (DEBUG) {
  console.debug('current options number', optionsList.length)
  window.printOptionsMap = () => console.debug(optionsList.map(i => i.name + ': ' + i.type.name + ',').join('\n'))
}

const getDefaultOptions = () => _.mapValues(_.keyBy(optionsList, 'name'), i => i.default)

export default {getDefaultOptions, optionsList}
