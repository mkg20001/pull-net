'use strict'

const Handle = require('./handle')
const TCPWrap = process.binding('tcp_wrap')
const TCPConnectWrap = TCPWrap.TCPConnectWrap
const pull = require('pull-stream')
const net = require('net')

module.exports = function (port, address, cb) {
  cb = cb || function () {}
  port |= 0
  const clientHandle = TCPWrap.constants ? new TCPWrap.TCP(TCPWrap.constants.SOCKET) : new TCPWrap.TCP()
  const connect = new TCPConnectWrap()
  let stream

  connect.port = port
  connect.address = address
  connect.oncomplete = function afterConnect (err) {
    if (err) return cb(new Error('error connecting 1:' + err))
    cb && cb(null, stream)
  }
  let err
  if (net.isIPv4(address)) {
    err = clientHandle.connect(connect, address, port)
  } else {
    console.log('IPV6')
    err = clientHandle.connect6(connect, address, port)
  }

  if (err) {
    err = new Error('connection failed: ' + err)
    return {
      source: pull.error(err),
      sink: function (read) { read(err, cb) }
    }
  }
  return Handle(clientHandle, cb)
}
