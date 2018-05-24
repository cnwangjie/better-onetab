import __ from '@/common/i18n'

export const optionsList = [
  {
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
  // {
  //   name: 'itemDisplay',
  //   desc: __('opt_desc_itemDisplay'),
  //   type: String,
  //   default: 'title-and-url',
  //   items: [
  //     {
  //       value: 'title-and-url',
  //       label: 'title and url',
  //     },
  //     {
  //       value: 'title',
  //       label: 'title',
  //     },
  //     {
  //       value: 'url',
  //       label: 'url',
  //     },
  //   ],
  // },
  {
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
    name: 'addHistory',
    desc: __('opt_desc_addHistory'),
    type: Boolean,
    default: true,
  },
  {
    name: 'syncOptions',
    desc: __('opt_desc_syncOptions'),
    type: Boolean,
    default: true,
  },
  {
    name: 'syncList',
    desc: __('opt_desc_syncList'),
    type: Boolean,
    default: true,
  },
]

const getDefaultOptions = () => optionsList.reduce((opts, item) => {
  return Object.assign(opts, {[item.name]: item.default})
}, {})

export default {getDefaultOptions, optionsList}