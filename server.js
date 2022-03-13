require('dotenv').config()
const express = require('express');
var cors = require('cors')
const socketIO = require('socket.io');
const { addUser, removeUser } = require("./utils/Chat/user");
const { addMessage, getMessagesInRoom} = require("./utils/Chat/messages");

const SOCKETPORT = process.env.SOCKETPORT || 4000;
const SERVERPORT = process.env.SERVERPORT || 5000;
const INDEX = '/index.html';

const app = express()
app.use(cors())
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://chat-onledu.herokuapp.com/");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(SOCKETPORT, () => console.log(`Listening on ${SOCKETPORT}`));

const io = socketIO(server, {cors: {
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["my-custom-header"],
  credentials: true
}});

io.on("connection", (socket) => {
  socket.on("join", ({ name, room, userId }, callBack) => {
    const { user, error } = addUser({ id: socket.id, name, room, userId });
    if (error) return callBack(error);
    console.log("socket.id = " + socket.id)
    console.log("name = " + user.name)
    console.log("room = " + user.room)
    console.log("userId = " + user.userId)
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
      addMessage(user.room, user.name, message, userId);
      io.to(user.room).emit("message", {
        user: user.name,
        userId: user.userId,
        message: message, 
      });
    });
  });
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    console.log(user);
    io.to(user.room).emit("message", {
      user: "Admin",
      message: `${user.name} saiu.`,
    });
    socket.leave(user.room);
    console.log("A disconnection has been made");
  });

});



app.get('/rooms/:roomId/messages', (req, res) => {
  console.log("messages")
  const messages = getMessagesInRoom(req.params.roomId);
  
  return res.json({ messages });
});

app.listen(SERVERPORT, () => {
  // perform a database connection when server starts  
  console.log(`Server is running on port: ${SERVERPORT}`);
});