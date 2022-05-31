require('dotenv').config()
const http = require("http");
const express = require("express");
const cors = require("cors");
const socketIo = require("socket.io");
const uuid = require('uuid');
const { addUser, removeUser, getNumberUsersInRoom } = require("./utils/Chat/user");
const { addMessage, getAndReadMessagesInRoom,saveMessagesDB, readMessage} = require("./utils/Chat/messages");

const PORT = process.env.PORT || 4000;
const START_TYPING_MESSAGE_EVENT = "START_TYPING_MESSAGE_EVENT";
const STOP_TYPING_MESSAGE_EVENT = "STOP_TYPING_MESSAGE_EVENT";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("join", ({ name, room, userid }, callBack) => {
    
    const { user, error } = addUser({ id: socket.id, name, room, userid });
    if (error) return callBack(error);
    //console.log("socket.id = " + socket.id)
    //console.log("name = " + user.name)
    //console.log("room = " + user.room)
    //console.log("userid = " + user.userid)
    socket.join(user.room);
    /*socket.emit("message", {
      user: "Admin",
      text: `Welocome to ${user.room}`,
    });*/

    socket.broadcast
      .to(user.room)
      .emit("welcome", { user: "Admin", message: `${user.name} está online!` });
    callBack(null);
 
    socket.on("sendMessage", ({ message }) => {
      const id = uuid.v4();
      console.log(user.name + " enviou uma mensagem " + id + " - " + message)
      addMessage(id, user.room, user.name, message, userid, false);
      io.to(user.room).emit("message", {
        user: user.name,
        userid: user.userid,
        message: message, 
        messageId: id,
        readed: false
      });
    });

    socket.on("readed", (message) => {           
      readMessage(message.messageId)
      socket.to(user.room).emit("messageReaded", message);
    });

    socket.on("readedDB", (message) => {   
      console.log('socket.on("readedDB", (message)')             
      message.readed = true
      console.log(message)         
      socket.to(user.room).emit("messageReadedDB", message);
    });

    socket.on("getAndReadMessagesInRoom", ({userid, roomid}) => {           
      console.log('getAndReadMessagesInRoom')
      const messagesInRoom = getAndReadMessagesInRoom(roomid, userid );
      io.to(user.room).emit("setMessageInRoom", messagesInRoom);
    });

    socket.on(START_TYPING_MESSAGE_EVENT, (data) => {      
      io.in(user.room).emit(START_TYPING_MESSAGE_EVENT, data);
    });
    socket.on(STOP_TYPING_MESSAGE_EVENT, (data) => {      
      io.in(user.room).emit(STOP_TYPING_MESSAGE_EVENT, data);
    });
  });  

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);  
    if (user){
      io.to(user.room).emit("message", {
        user: "Admin",
        message: `${user.name} saiu.`,
      });
      socket.leave(user.room);

      if (getNumberUsersInRoom(user.room) === 0){
        saveMessagesDB(user.room, user.userid)
      }

      console.log("A disconnection has been made");
    }
  /*Se sair e for algum erro ou não reconhecer, fazer backup de tudo*/       
  });
});

server.listen(PORT, () => {
  console.log(`Escutando na porta ${PORT}`);
});

/*app.get('/rooms/:roomid/messages/:userid', (req, res) => {  
  console.log("app.get('/rooms/:roomid/messages/:userid'")
  console.log(io.socket)
  //const messages = getMessagesInRoom(req.params.roomid, req.params.userid );
  const messages = getAndReadMessagesInRoom(req.params.roomid, req.params.userid );

  return res.json({ messages });
});*/
