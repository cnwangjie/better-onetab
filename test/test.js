/* eslint-env mocha, node */
const path = require('path')
const assert = require('assert')
const chromedriver = require('chromedriver')
const chrome = require('selenium-webdriver/chrome')
const {Builder, Capabilities} = require('selenium-webdriver')

let driver
let ext
let backgroundTabId

before(async () => {
  const opt = new chrome.Options()
    .addArguments('--load-extension=' + path.join(__dirname, '../dist'))

  const service = new chrome.ServiceBuilder(chromedriver.path).build()
  chrome.setDefaultService(service)

  driver = new Builder()
    .forBrowser('chrome')
    .withCapabilities(Capabilities.chrome())
    .setChromeOptions(opt)
    .build()

  await driver.sleep(1000)
})

describe('background', () => {
  it('should init without error', async () => {
    await driver.get('chrome-extension://geghaancpajoplmhcocjboinmihhmpjf/_generated_background_page.html')
    ext = await driver.getWindowHandle()
    backgroundTabId = await driver.executeAsyncScript(`
      var callback = arguments[arguments.length - 1];
      browser.tabs.getCurrent()
        .then(tab => callback(tab.id))
      `)
    const result = await driver.executeAsyncScript(`
      var callback = arguments[arguments.length - 1];
      browser.storage.local.get(null)
        .then(Object.keys)
        .then(browser.storage.local.remove)
        .then(() => window.init())
        .then(callback)
        .catch(error => callback(error.message));
      `)
    assert.strictEqual(result, null)
  })
})

describe('tabs manager', () => {
  it('should store selected tabs correctly', async () => {
    await driver.executeAsyncScript(`
      var callback = arguments[arguments.length - 1];
      Promise.all([
        browser.tabs.create({url: 'http://example.com/'}),
        browser.tabs.create({url: 'http://example.com/'})
      ]).then(callback)
    `)
    await driver.sleep(1000)
    await driver.switchTo().window(ext)
    const expectedTabs = await driver.executeAsyncScript(`
      var callback = arguments[arguments.length - 1];
      browser.tabs.query({})
        .then(tabs => tabs.filter(({ id }) => id !== ${backgroundTabId}))
        .then(tabs => tabs.map(({ url }) => url))
        .then(callback)
    `)
    const lists = await driver.executeAsyncScript(`
      var callback = arguments[arguments.length - 1];
      browser.tabs.query({})
        .then(tabs => tabs.filter(tab => tab.id !== ${backgroundTabId}))
        .then(tabs => { console.log(tabs); return tabs })
        .then(tabs => tabs.map(({id}) => browser.tabs.update(id, {highlighted: true})))
        .then(task => Promise.all(task))
        .then(() => window.tabs.storeSelectedTabs())
        .then(() => browser.storage.local.get('lists'))
        .then(({lists}) => lists)
        .then(callback)
      `)
    assert.strictEqual(lists.length, 1)
    const actualTabs = lists[0].tabs.map(({url}) => url)
    assert.deepStrictEqual(actualTabs, expectedTabs)
  })
})

after(async () => {
  if (driver) await driver.quit()
})
