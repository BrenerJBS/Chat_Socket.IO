require('dotenv').config()
const express = require('express');
const socketIO = require('socket.io');
const { addUser, removeUser } = require("./utils/Chat/user");
const { addMessage} = require("./utils/Chat/messages");

const PORT = process.env.PORT || 4000;
const INDEX = '/index.html';

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
  socket.on("join", ({ name, room }, callBack) => {
    const { user, error } = addUser({ id: socket.id, name, room });
    if (error) return callBack(error);
    console.log("socket.id = " + socket.id)
    console.log("name = " + user.name)
    console.log("room = " + user.room)

    socket.join(user.room);
    /*socket.emit("message", {
      user: "Admin",
      text: `Welocome to ${user.room}`,
    });*/

    socket.broadcast
      .to(user.room)
      .emit("message", { user: "Onledu", text: `${user.name} esta online!` });
    callBack(null);
 
    socket.on("sendMessage", ({ message }) => {
      addMessage(user.room, user.name, message);
      io.to(user.room).emit("message", {
        user: user.name,
        text: message, 
      });
    });
  });
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    console.log(user);
    io.to(user.room).emit("message", {
      user: "Admin",
      text: `${user.name} just left the room`,
    });
    socket.leave(user.room);
    console.log("A disconnection has been made");
  });
});