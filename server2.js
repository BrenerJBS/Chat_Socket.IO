require('dotenv').config()
const http = require("http");
const express = require("express");
const cors = require("cors");
const socketIo = require("socket.io");
const { addUser, removeUser } = require("./utils/Chat/user");
const { addMessage, getMessagesInRoom} = require("./utils/Chat/messages");

const PORT = process.env.PORT || 4000;

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

server.listen(PORT, () => {
  console.log(`Escutando na porta ${PORT}`);
});

app.get('/rooms/:roomId/messages', (req, res) => {
  console.log("messages")
  const messages = getMessagesInRoom(req.params.roomId);
  
  return res.json({ messages });
});

/*


app.listen(SERVERPORT, () => {
  // perform a database connection when server starts  
  console.log(`Server is running on port: ${SERVERPORT}`);
});*/