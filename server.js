require('dotenv').config()
const express = require('express');
const cors = require("cors");
const socketIO = require('socket.io');
const { addUser, removeUser } = require("./utils/Chat/user");
const { addMessage, getMessagesInRoom} = require("./utils/Chat/messages");

const app = express();
app.use(cors({ origin: true }));

const PORT = process.env.PORT || 4000;
const INDEX = '/index.html';

app.get("/rooms/:roomId/messages", (req, res) => {
  const messages = getMessagesInRoom(req.params.roomId);
  return res.json({ messages });
});

const SPORT = 5000
app.listen(SPORT, () => {
  // perform a database connection when server starts  
  console.log(`Server is running on port: ${SPORT}`);
});

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

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

