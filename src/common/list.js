const createNewTabList = ({tabs, title, time}) => {
  return {
    tabs: tabs || [],
    title: title || '',
    time: time || Date.now(),
    titleEditing: false,
    pinned: false,
    expand: true,
  }
}

export default {createNewTabList}