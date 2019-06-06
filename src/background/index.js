import init from './init'

if (TEST) {
  window.init = init
} else {
  init()
}

