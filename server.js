'use strict'

const TCPWrap = process.binding('tcp_wrap')
const net = require('net')
const Handle = require('./handle')

function noop () {}

module.exports = function (onConnect) {
  const server = TCPWrap.constants ? new TCPWrap.TCP(TCPWrap.constants.SERVER) : new TCPWrap.TCP()

  return {
    listen: function (port, addr, cb) {
      cb = cb || noop
      let err
      if (net.isIPv6(addr)) {
        err = server.bind6(addr, port)
      } else {
        err = server.bind(addr, port)
      }

      if (err) {
        server.close()
        cb(err)
        return
      }

      // 512 connections allowed in backlog
      server.listen(511)

      server.onconnection = function (err, client) {
        if (err) {
          return console.error(new Error('error connected:' + err))
        }

        let stream = Handle(client, noop)
        stream.address = {}
        client.getsockname(stream.address)
        stream.remoteAddress = {}
        client.getpeername(stream.remoteAddress)
        onConnect(stream)
      }
      return server
    },
    address: function () {
      if (server && server.getsockname) {
        const out = {}
        server.getsockname(out)
        return out
      } else if (this._pipeName) {
        return this._pipeName
      } else {
        return null
      }
    },
    close: function (cb) {
      server.close(cb)
      return server
    }
  }
}
