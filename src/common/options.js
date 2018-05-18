export const optionsList = [
  {
    name: 'browserAction',
    desc: 'Behavior when icon is clicked',
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
    desc: 'Behavior when item in a list is clicked',
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
    desc: 'Contents of the items in a list',
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
    desc: 'Behavior when item in simple list is clicked',
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
    name: 'syncOptions',
    desc: 'Sync settings',
    type: Boolean,
    default: true,
  },
  {
    name: 'syncList',
    desc: 'Sync lists',
    type: Boolean,
    default: true,
  },
]

const getDefaultOptions = () => optionsList.reduce((opts, item) => {
  return Object.assign(opts, {[item.name]: item.default})
}, {})

export default {getDefaultOptions, optionsList}