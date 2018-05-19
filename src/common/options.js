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
        label: 'popup simple list',
      },
      {
        value: 'store-selected',
        label: 'store selected tabs',
      },
      {
        value: 'store-all',
        label: 'store all tabs in current window',
      },
      {
        value: 'show-list',
        label: 'show list',
      },
      {
        value: 'none',
        label: 'none',
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
        label: 'open and remove',
      },
      {
        value: 'open',
        label: 'open',
      },
      {
        value: 'none',
        label: 'none',
      },
    ],
  },
  {
    name: 'itemDisplay',
    desc: __('opt_desc_itemDisplay'),
    type: String,
    default: 'title-and-url',
    items: [
      {
        value: 'title-and-url',
        label: 'title and url',
      },
      {
        value: 'title',
        label: 'title',
      },
      {
        value: 'url',
        label: 'url',
      },
    ],
  },
  {
    name: 'popupItemClickAction',
    desc: __('opt_desc_popupItemClickAction'),
    type: String,
    default: 'restore',
    items: [
      {
        value: 'restore',
        label: 'restore',
      },
      {
        value: 'restore-new-window',
        label: 'restore in new window',
      },
      {
        value: 'none',
        label: 'none',
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