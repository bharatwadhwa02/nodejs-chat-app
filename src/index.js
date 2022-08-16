const express = require('express')
const path = require('path')
const app = express()
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage} = require('../src/utils/messages')
const {generateLocationMessage} = require('../src/utils/locationMessage')
const  {addUser, removeUser, getUser, getUserInRoom} = require('./utils/users')
const port = process.env.PORT || 5000
const publicDirectoryPath = path.join(__dirname , '../public')

const server = http.createServer(app)
const io = socketio(server)

io.on('connection' , (socket)=>{
  console.log('new websocket connection')

  socket.on('join' , ({username,room} , callback)=>{
    const {user , error} = addUser({id : socket.id , username , room})
    if(error){
      return callback(error)
    }
    socket.join(user.room)

    socket.emit('message' , generateMessage('Admin' , 'Welcome!!')) 
    socket.broadcast.to(user.room).emit('message' ,generateMessage('Admin',`${user.username} has joined in this room`)) 
    io.to(user.room).emit('roomData' , {
      room:user.room,
      users:getUserInRoom(user.room)
    })

    callback()
  })


  socket.on('msgSendToServer' , (message , callback)=>{
    const user = getUser(socket.id)
    const filter = new Filter()
    if(filter.isProfane(message)){
      return callback('Profanity is not allowed ,so message not delivered!!')
    }

    io.to(user.room).emit('message' , generateMessage(user.username , message))  //to emit it to every connection
    callback()
  })

  socket.on('sendLocation'  , (coords , callback)=>{
    const user = getUser(socket.id)
    io.to(user.room).emit('locationMessage' , generateLocationMessage(user.username, `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`))

    callback()

  })

  socket.on('disconnect' , ()=>{
    const user = removeUser(socket.id)

    if(user){
      io.to(user.room).emit('message' , generateMessage('Admin' ,`${user.username} has left!!`))
      io.to(user.room).emit('roomData' , {
        room:user.room,
        users:getUserInRoom(user.room)
      })
    }
  })
})



app.use(express.static(publicDirectoryPath))
server.listen(port , ()=>{
  console.log('server is on port '+port)
})

