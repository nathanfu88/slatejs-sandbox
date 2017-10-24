const MESSAGES = require('./src/constants.js')
const io = require('socket.io')()

io.on('connection', socket => {
  console.log('connection received')

  socket.on(MESSAGES.EDITOR_CHANGES, changeOps => {
    console.log('Received editor change document ', changeOps)
    socket.broadcast.emit(MESSAGES.INCOMING_CHANGES, changeOps)
  })

  socket.on(MESSAGES.REQUEST_CHANGES, () => {
    console.log('Request for changes received, broadcasting to clients')
    socket.broadcast.emit(MESSAGES.REQUEST_CHANGES)
  })

  socket.on(MESSAGES.REQUEST_CHANGES_REPLY, changeOps => {
    console.log('Received request change reply, broadcasting ' + MESSAGES.INCOMING_CHANGES)
    io.emit(MESSAGES.INCOMING_CHANGES, changeOps)
  })
})

const port = 8000
io.listen(port)
console.log('listening on port ', port)