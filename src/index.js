const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage} = require('./util/message')
const { addUser, getUser, removeUser, getUsersInRoom } = require('./util/users')

// Create the Express application
const app = express()

// Create the HTTP server using the Express app
const server = http.createServer(app)

// Connect socket.io to the HTTP server
const io = socketio(server)
const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

// server (index.js) emits -> client (chat.js) receives - countUPdated
// client emits -> server receives - increment
io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.on('join',({username, room}, callback)=>{
        socket.join(room)
        const {error, newUser} = addUser(socket.id, username, room)
        if (error){
            return callback(error)
        }
        socket.emit('addMessage', generateMessage(`Welcome ${newUser.username} to ${newUser.room}!`, 'Admin'))
        io.to(newUser.room).emit('sidebar', {
            room: newUser.room,
            users: getUsersInRoom(newUser.room)
        })
       
        socket.broadcast.to(newUser.room).emit('addMessage',generateMessage(`${newUser.username} has joined ${newUser.room}`, newUser.username))
    })

    socket.on('sendMessage',(message, callback)=>{
        const filter = new Filter()
        if (filter.isProfane(message)){
            return callback('The message contains bad words')
        }
        const user = getUser(socket.id)
        io.to(user.room).emit('addMessage',generateMessage(message, user.username)) //io sends data to every single client connections
        callback()
    })

    socket.on('sendLocation', (pos, callback)=>{
        const posMessage = `https://google.com/maps?q=${pos.latitude},${pos.longitude}`
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateMessage(posMessage, user.username))
        callback('server acknowldge send location')
    })
    
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        io.to(user.room).emit('sidebar', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
    })
})
server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})
