/* eslint-disable */
module.exports = {
  development: {
    __CLIENT_ID__: '530831729511-eq8apt6dhjimbmdli90jp2ple0lfmn3l.apps.googleusercontent.com',
    __DEV_CSP__: process.env.MOZ ? '' : ' http://localhost:8098 chrome-extension://nhdogjmejiglipccpnnnanhbledajbpd'
  },
  production: {
    __CLIENT_ID__: '530831729511-dclgvblhv7var13mvpjochb5f295a6vc.apps.googleusercontent.com',
    __DEV_CSP__: ''
  }
}
