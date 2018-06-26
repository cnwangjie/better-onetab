const Promise = require("bluebird")
let storage = null

/**
 * 获取所有配置项【异步】
 */
function getAll() {
  let res = new Promise((resolve, reject) => {
    if (storage) {
      resolve(storage)
    } else {
      chrome.storage.sync.get(function(obj) {
        storage = obj
        console.log(storage, 'init value')
        resolve(storage)
      })
    }
  })
  return res
}

/**
 * 获取某个键值对
 */
function get(key) {
  return storage[key]
}

/**
 * 删除某个键值对
 */
function remove(key) {
  delete storage[key]
	chrome.storage.sync.remove(key, function(){})
}

/**
 * 增加或修改某个键值对
 */
function set(key, value) {
  storage[key] = value;
	chrome.storage.sync.set(storage, function(){});
}

export { getAll, remove, set, get }