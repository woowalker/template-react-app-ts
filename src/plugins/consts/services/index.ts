import common from './common'
import form from './form'
import route from './route'
import storage from './storage'
import table from './table'
import socket from './socket'
import dynamicJs from './dynamicJs'
import custom from './custom'
import config from 'src/config'

export default {
  common,
  form,
  route,
  storage,
  table,
  socket,
  dynamicJs,
  ...custom,
  config
}