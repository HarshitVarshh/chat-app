const path = require('path')
const http = require('http')
const socketio=require('socket.io')
const express = require('express');
const Filter = require('bad-words');
const {generateMessage , generateLocation } =require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom}= require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server)


const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath));

let msg="Welcome"
io.on('connection',(socket)=>{
    console.log('New connection!!')
     socket.on('join',({username,room},callback)=>{
        const {error,user}=addUser({ id: socket.id,username,room})
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message',generateMessage('Admin',msg))
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!!`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
     })
     socket.on('sendMessage',(msg,callback)=>{
         const filter= new Filter();
         if(filter.isProfane(msg)){
             return callback('Profanity not allowed')
         }
         const user = getUser(socket.id)
         if(user){
         io.to(user.room).emit('message',generateMessage(user.username,msg))
         }
         callback()
     })

     socket.on('disconnect',()=>{
         const user=removeUser(socket.id)
         if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} left`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
         }
     })
     socket.on('sendLocation',(pos,callback)=>{
          
         const user = getUser(socket.id)
         console.log(user)
         if(user){
         io.to(user.room).emit('locationMessage',generateLocation(user.username,`https://google.com/maps?q=${pos.lat},${pos.long}`))
         }
         callback()
         
     })
     socket.on('sendWish',(pos,callback)=>{
          
        const user = getUser(socket.id)
        console.log(user)
        if(user){
        io.to(user.room).emit('sendWish',generateLocation(user.username,"https://mk0at44uvaxh7f73.kinstacdn.com/wp-content/uploads/2015/11/25597-NVYNFH.jpg"))
        }
        callback()
        
    })

    })




server.listen(port,()=>{
    console.log(`Server is up on port ${port}!`)
})