
const GOOGLE_ACCESS_TOKEN_KEY = 'at'

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

const loadGapi = async () => {
  return new Promise(resolve => {
    /* eslint-disable */
    window.onLoadCallback = resolve
    (function() {
      var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
      po.src = 'https://apis.google.com/js/api.js?onload=onLoadCallback';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
    })();
    /* eslint-enable */
  })
}

const prepareGapi = async token => {
  if (!token) token = await getAuth()
  /* global gapi */
  if (!gapi) await loadGapi()
  await gapi.load('client')
  await gapi.client.init({
    client_id: chrome.runtime.getManifest().oauth2.client_id,
    scope: 'https://www.googleapis.com/auth/drive.file',
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
  })
  gapi.client.setToken(token)
}

const createFile = async ({ token, filename, data }) => {
  await prepareGapi(token)
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

export default {
  getAuth,
  createFile,
}
