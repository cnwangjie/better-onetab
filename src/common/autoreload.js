const filesInDirectory = dir => new Promise(resolve =>
  dir.createReader().readEntries(entries =>
    Promise.all(entries.filter (e => e.name[0] !== '.').map(e =>
      e.isDirectory ? filesInDirectory (e) : new Promise(resolve => e.file(resolve))
    ))
    .then(files => [].concat(...files))
    .then(resolve)
  )
)

const timestampForFilesInDirectory = dir =>
  filesInDirectory (dir).then(files =>
    files.map(f => f.name + f.lastModifiedDate).join ())

const reload = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs[0]) chrome.tabs.reload(tabs[0].id)
    chrome.runtime.reload()
  })
}

const watchChanges = (dir, lastTimestamp) => {
  timestampForFilesInDirectory(dir).then(timestamp => {
    if (!lastTimestamp || (lastTimestamp === timestamp)) {
      setTimeout(() => watchChanges(dir, timestamp), 1000)
    } else {
      reload()
    }
  })
}

export const autoreload = () => {
  chrome.management.getSelf(self => {
    if (self.installType === 'development') {
      console.log('autoreload watching changes')
      chrome.runtime.getPackageDirectoryEntry(dir => watchChanges(dir))
    }
  })
}

export default autoreload