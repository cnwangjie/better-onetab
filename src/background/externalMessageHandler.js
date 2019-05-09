import {commands, default as commandHandler} from './commandHandler'
import list from '../common/list'
import listManager from '../common/listManager'

const externalAction = {
  'add-list'(list) {
    // list.
  }
}

const externalMessageHandler = (msg, sender, sendResponse) => {
  if (msg in commands) return commandHandler(msg)

}

export default externalMessageHandler
