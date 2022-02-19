var uuid = require("uuid");

const messages = [];

const addMessage = (room, name, message) => {
  console.log(message)
  const msg = { id: uuid.v4(), room, name, message };
  messages.push(msg);  
}; 

const removeMessage = (id) => {
  const index = messages.findIndex((message) => message.id === id);

  if (index !== -1) return messages.splice(index, 1)[0];
};

const getMessage = (id) => messages.find((message) => message.id === id);

const getMessagesInRoom = (room) =>
  messages.filter((message) => message.room === room);

module.exports = { addMessage, removeMessage, getMessage, getMessagesInRoom };