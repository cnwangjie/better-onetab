
const GOOGLE_ACCESS_TOKEN_KEY = 'at'
const STORAGE_FOLDER_NAME = 'better-onetab-storage'

const getAuth = async () => {
  const token = await new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ 'interactive': true }, token => {
      const err = chrome.runtime.lastError
      if (err) reject(err)
      else resolve(token)
    })
  })
  localStorage.setItem(GOOGLE_ACCESS_TOKEN_KEY, token)
  return token
}

export const loadGapi = async () => {
  return new Promise(resolve => {
    window.gapiLoaded = () => setTimeout(resolve, 0)
    const po = document.createElement('script')
    po.type = 'text/javascript'
    po.async = true
    po.src = 'https://apis.google.com/js/api.js?onload=gapiLoaded'
    const s = document.getElementsByTagName('script')[0]
    s.parentNode.insertBefore(po, s)
  })
}

export const prepareGapi = async token => {
  if (!token) token = await getAuth()
  let gapi = window.gapi
  if (!gapi) await loadGapi()
  gapi = window.gapi
  await new Promise(resolve => {
    gapi.load('client', resolve)
  })
  gapi.client.setApiKey('AIzaSyCyOBoGAipfBCC74QGhDd6CohnPZhnmb3A')
  await gapi.client.load('https://content.googleapis.com/discovery/v1/apis/drive/v3/rest')
  gapi.client.setToken(token)
  return gapi
}

const createFile = async ({ token, filename, data }) => {
  const gapi = await prepareGapi(token)
  const bytes = new Uint8Array(data.length)
  for (let i = 0; i < data.length; i += 1) {
    bytes[i] = data.charCodeAt(i)
  }
  // const blob = new Blob([bytes], {type: 'application/json'})
  gapi.client.request({
    path: 'https://www.googleapis.com/drive/v3/files',
    method: 'POST',
    params: {uploadType: 'multipart'},
  })
  return gapi.client.drive.files.create({
    resource: {
      name: filename,
    },
    media: {
      mimeType: 'application/json',
      body: data,
    },
    field: 'id',
  })
}

// const getFile = async ({ token, fileId }) => {
//   await prepareGapi(token)
//   return gapi.client.drive.files.get({fileId})
// }

const uploadJSON = ({ token, json, filename }) => {
  const jsonstr = JSON.stringify(json, null, 4)
  const content = new Blob([jsonstr], {type: 'application/json'})
  content.name = filename || 'test.json'
  return new Promise((resolve, reject) => {
    const uploader = new MediaUploader({
      file: content,
      token,
      onComplete: resolve,
      onError: reject,
    })
    uploader.upload()
  })
}

const getStorageFolder = async () => {
  const gapi = await prepareGapi()
  const files = await gapi.client.drive.files.list({
    q: `mimeType = 'application/vnd.google-apps.folder' and name = '${STORAGE_FOLDER_NAME}'`
  })
  const [folder] = files.files
  if (folder) return folder
  return gapi.client.drive.files.create({
    "resource": {
      "name": "better-onetab-storage",
      "mimeType": "application/vnd.google-apps.folder"
    }
  })
}

const getFileInStorageFolder = async filename => {
  const gapi = await prepareGapi()
  const folder = await getStorageFolder()
  const files = await gapi.client.drive.files.list({
    q: `'${folder.id}' in parents and name = ${filename}`,
  })
  const [file] = files.files
  return file
}

const forceSaveFile = async (data, filename) => {
  const file = await getFileInStorageFolder(filename)
  const token = await getAuth()

  let value, type
  if (typeof data === 'object') {
    value = JSON.stringify(data, null, 4)
    type = 'application/json'
  } else {
    value = data.toString()
    type = 'text/plain'
  }
  const content = new Blob([value], {type})
  content.name = filename

  return new Promise((resolve, reject) => {
    const opts = {
      file: content,
      token,
      onComplete: resolve,
      onError: reject,
    }
    if (file && file.id) opts.fileId = file.id
    const uploader = new MediaUploader(opts)
    uploader.upload()
  })
}

const gdrive = {
  getAuth,
  createFile,
  uploadJSON,
  forceSaveFile,
}

window.gdrive = gdrive

export default gdrive

/**
 * Helper for implementing retries with backoff. Initial retry
 * delay is 1 second, increasing by 2x (+jitter) for subsequent retries
 *
 * @constructor
 */
var RetryHandler = function() {
  this.interval = 1000; // Start at one second
  this.maxInterval = 60 * 1000; // Don't wait longer than a minute
};

/**
 * Invoke the function after waiting
 *
 * @param {function} fn Function to invoke
 */
RetryHandler.prototype.retry = function(fn) {
  setTimeout(fn, this.interval);
  this.interval = this.nextInterval_();
};

/**
 * Reset the counter (e.g. after successful request.)
 */
RetryHandler.prototype.reset = function() {
  this.interval = 1000;
};

/**
 * Calculate the next wait time.
 * @return {number} Next wait interval, in milliseconds
 *
 * @private
 */
RetryHandler.prototype.nextInterval_ = function() {
  var interval = this.interval * 2 + this.getRandomInt_(0, 1000);
  return Math.min(interval, this.maxInterval);
};

/**
 * Get a random int in the range of min to max. Used to add jitter to wait times.
 *
 * @param {number} min Lower bounds
 * @param {number} max Upper bounds
 * @private
 */
RetryHandler.prototype.getRandomInt_ = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};


/**
 * Helper class for resumable uploads using XHR/CORS. Can upload any Blob-like item, whether
 * files or in-memory constructs.
 *
 * @example
 * var content = new Blob(["Hello world"], {"type": "text/plain"});
 * var uploader = new MediaUploader({
 *   file: content,
 *   token: accessToken,
 *   onComplete: function(data) { ... }
 *   onError: function(data) { ... }
 * });
 * uploader.upload();
 *
 * @constructor
 * @param {object} options Hash of options
 * @param {string} options.token Access token
 * @param {blob} options.file Blob-like item to upload
 * @param {string} [options.fileId] ID of file if replacing
 * @param {object} [options.params] Additional query parameters
 * @param {string} [options.contentType] Content-type, if overriding the type of the blob.
 * @param {object} [options.metadata] File metadata
 * @param {function} [options.onComplete] Callback for when upload is complete
 * @param {function} [options.onProgress] Callback for status for the in-progress upload
 * @param {function} [options.onError] Callback if upload fails
 */
var MediaUploader = function(options) {
  var noop = function() {};
  this.file = options.file;
  this.contentType = options.contentType || this.file.type || 'application/octet-stream';
  this.metadata = options.metadata || {
    'title': this.file.name,
    'mimeType': this.contentType
  };
  this.token = options.token;
  this.onComplete = options.onComplete || noop;
  this.onProgress = options.onProgress || noop;
  this.onError = options.onError || noop;
  this.offset = options.offset || 0;
  this.chunkSize = options.chunkSize || 0;
  this.retryHandler = new RetryHandler();

  this.url = options.url;
  if (!this.url) {
    var params = options.params || {};
    params.uploadType = 'resumable';
    this.url = this.buildUrl_(options.fileId, params, options.baseUrl);
  }
  this.httpMethod = options.fileId ? 'PUT' : 'POST';
};

/**
 * Initiate the upload.
 */
MediaUploader.prototype.upload = function() {
  var xhr = new XMLHttpRequest();

  xhr.open(this.httpMethod, this.url, true);
  xhr.setRequestHeader('Authorization', 'Bearer ' + this.token);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('X-Upload-Content-Length', this.file.size);
  xhr.setRequestHeader('X-Upload-Content-Type', this.contentType);

  xhr.onload = function(e) {
    if (e.target.status < 400) {
      var location = e.target.getResponseHeader('Location');
      this.url = location;
      this.sendFile_();
    } else {
      this.onUploadError_(e);
    }
  }.bind(this);
  xhr.onerror = this.onUploadError_.bind(this);
  xhr.send(JSON.stringify(this.metadata));
};

/**
 * Send the actual file content.
 *
 * @private
 */
MediaUploader.prototype.sendFile_ = function() {
  var content = this.file;
  var end = this.file.size;

  if (this.offset || this.chunkSize) {
    // Only bother to slice the file if we're either resuming or uploading in chunks
    if (this.chunkSize) {
      end = Math.min(this.offset + this.chunkSize, this.file.size);
    }
    content = content.slice(this.offset, end);
  }

  var xhr = new XMLHttpRequest();
  xhr.open('PUT', this.url, true);
  xhr.setRequestHeader('Content-Type', this.contentType);
  xhr.setRequestHeader('Content-Range', "bytes " + this.offset + "-" + (end - 1) + "/" + this.file.size);
  xhr.setRequestHeader('X-Upload-Content-Type', this.file.type);
  if (xhr.upload) {
    xhr.upload.addEventListener('progress', this.onProgress);
  }
  xhr.onload = this.onContentUploadSuccess_.bind(this);
  xhr.onerror = this.onContentUploadError_.bind(this);
  xhr.send(content);
};

/**
 * Query for the state of the file for resumption.
 *
 * @private
 */
MediaUploader.prototype.resume_ = function() {
  var xhr = new XMLHttpRequest();
  xhr.open('PUT', this.url, true);
  xhr.setRequestHeader('Content-Range', "bytes */" + this.file.size);
  xhr.setRequestHeader('X-Upload-Content-Type', this.file.type);
  if (xhr.upload) {
    xhr.upload.addEventListener('progress', this.onProgress);
  }
  xhr.onload = this.onContentUploadSuccess_.bind(this);
  xhr.onerror = this.onContentUploadError_.bind(this);
  xhr.send();
};

/**
 * Extract the last saved range if available in the request.
 *
 * @param {XMLHttpRequest} xhr Request object
 */
MediaUploader.prototype.extractRange_ = function(xhr) {
  var range = xhr.getResponseHeader('Range');
  if (range) {
    this.offset = parseInt(range.match(/\d+/g).pop(), 10) + 1;
  }
};

/**
 * Handle successful responses for uploads. Depending on the context,
 * may continue with uploading the next chunk of the file or, if complete,
 * invokes the caller's callback.
 *
 * @private
 * @param {object} e XHR event
 */
MediaUploader.prototype.onContentUploadSuccess_ = function(e) {
  if (e.target.status == 200 || e.target.status == 201) {
    this.onComplete(e.target.response);
  } else if (e.target.status == 308) {
    this.extractRange_(e.target);
    this.retryHandler.reset();
    this.sendFile_();
  } else {
    this.onContentUploadError_(e);
  }
};

/**
 * Handles errors for uploads. Either retries or aborts depending
 * on the error.
 *
 * @private
 * @param {object} e XHR event
 */
MediaUploader.prototype.onContentUploadError_ = function(e) {
  if (e.target.status && e.target.status < 500) {
    this.onError(e.target.response);
  } else {
    this.retryHandler.retry(this.resume_.bind(this));
  }
};

/**
 * Handles errors for the initial request.
 *
 * @private
 * @param {object} e XHR event
 */
MediaUploader.prototype.onUploadError_ = function(e) {
  this.onError(e.target.response); // TODO - Retries for initial upload
};

/**
 * Construct a query string from a hash/object
 *
 * @private
 * @param {object} [params] Key/value pairs for query string
 * @return {string} query string
 */
MediaUploader.prototype.buildQuery_ = function(params) {
  params = params || {};
  return Object.keys(params).map(function(key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  }).join('&');
};

/**
 * Build the drive upload URL
 *
 * @private
 * @param {string} [id] File ID if replacing
 * @param {object} [params] Query parameters
 * @return {string} URL
 */
MediaUploader.prototype.buildUrl_ = function(id, params, baseUrl) {
  var url = baseUrl || 'https://www.googleapis.com/upload/drive/v2/files/';
  if (id) {
    url += id;
  }
  var query = this.buildQuery_(params);
  if (query) {
    url += '?' + query;
  }
  return url;
};


