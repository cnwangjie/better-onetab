import storage from "src/common/storage"

const parseCompatibleLists = (data: string) => {
  return data.split('\n\n')
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
    .map(tabs => ({ tabs }))
}

const importFromText = async (data: string, compatible = false) => {
  const lists: any[] = compatible ? parseCompatibleLists(data) : JSON.parse(data)
  // const tasks = await lists.map(async list => {
  //   const list = await storage.lists.createList(list)
  //   await storage.tabs.createTabs(list.id, list.tabs)
  // })
}
