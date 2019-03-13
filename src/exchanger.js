const parseLists = (compatible, data) => {
  const lists = compatible ? data.split('\n\n')
    .filter(i => i.trim())
    .map(i => i.split('\n')
      .filter(j => j)
      .map(j => {
        const [url, ...title] = j.split('|')
        return {
          url: url.trim(),
          title: title.join().trim(),
        }
      }))
    .map(tabs => ({tabs}))
    : JSON.parse(data)

  return lists
}

addEventListener('message', msg => {
  const {compatible, data} = msg.data
  if (compatible == null || !data) throw new Error('wrong message')
  const listsData = parseLists(compatible, data)
  if (!Array.isArray(listsData)) throw new Error('data must be an array')
  postMessage(listsData)
})
