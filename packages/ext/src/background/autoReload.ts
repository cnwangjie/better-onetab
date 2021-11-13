import browser from 'webextension-polyfill'

const filesInDirectory = (dir: any) =>
  new Promise(resolve => {
    dir.createReader().readEntries((entries: any) => {
      Promise.all(
        entries
          .filter((e: any) => e.name[0] !== '.')
          .map((e: any) =>
            e.isDirectory
              ? filesInDirectory(e)
              : new Promise(resolve => e.file(resolve)),
          ),
      )
        .then((files: any) => [].concat(...files))
        .then(resolve)
    })
  })

const timestampForFilesInDirectory = (dir: any) =>
  filesInDirectory(dir).then((files: any) =>
    files.map((f: any) => f.name + f.lastModifiedDate).join(),
  )

const reload = () => {
  try {
    browser.runtime.reload()
  } catch (err) {
    console.log('failed to reload with error', err)
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const watchChanges = async (dir: any, lastTimestamp?: any) => {
  // console.log('watch', dir)
  await Promise.race([
    timestampForFilesInDirectory(dir).then(timestamp => {
      // console.log(timestamp)
      if (!lastTimestamp || lastTimestamp === timestamp) {
        setTimeout(() => watchChanges(dir, timestamp), 1000)
      } else {
        reload()
      }
    }),
    sleep(5000).then(() => {
      throw new Error('timeout')
    }),
  ]).catch(err => {
    if (err) sleep(1000).then(() => reload())
  })
}

export const autoReload = async () => {
  const self = await browser.management.getSelf()
  if (self.installType === 'development') {
    console.log('autoReload watching changes', new Date())
    ;(window as any)['chrome'].runtime.getPackageDirectoryEntry((dir: any) =>
      watchChanges(dir),
    )
  }
}

export default autoReload
