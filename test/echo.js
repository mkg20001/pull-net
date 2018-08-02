'use strict'

const pull = require('pull-stream')

const net = require('net')
const toPull = require('stream-to-pull-stream')

const createServer = require('../server')

const server = createServer(function (stream) {
  console.log(stream)
  pull(
    stream.source,
    pull.through(function (data) {
      console.log('THROUGH', data)
    }, function (err) {
      console.log('END', err)
    }),
    stream.sink)
}).listen(9090, '127.0.0.1')

const client = net.connect(9090, '127.0.0.1')
pull(
  pull.values([new Buffer('HELLO THERE')]),
  toPull.duplex(client),
  pull.drain(console.log, function () {
    console.log('END')
    server.close()
  })
)
