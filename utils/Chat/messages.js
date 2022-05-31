var uuid = require("uuid");
const axios = require('axios')

let messages = [];

const addMessage = (id, room, name, message, userid, readed) => {  
  const msg = { id, room, name, message, userid, readed };
  messages.push(msg);  
}; 

const readMessage = (id) => {  
  const index = messages.findIndex((message) => message.id === id);
  messages[index].readed = true; 
}; 

const removeMessage = (id) => {
  const index = messages.findIndex((message) => message.id === id);

  if (index !== -1) return messages.splice(index, 1)[0];
};


const removeAllRoomMessages = (room) => {
  messages = messages.filter((message) => message.room !== room)
}

const getMessage = (id) => messages.find((message) => message.id === id);

const getMessagesInRoom = (room, user) => {
  console.log('getMessagesInRoom ' + user)
  messages.map((message) => {
    if (message.room === room && message.userid !== user){      
      return message.readed = true
    }
  })
  
  return messages.filter((message) => message.room === room);
}

const getAndReadMessagesInRoom = (room, user) => {
  console.log('getAndReadMessagesInRoom ' + user)
  messages.map((message) => {
    if (message.room === room && message.userid !== user){      
      return message.readed = true
    }
  })
  
  return messages.filter((message) => message.room === room);
}
 
const saveMessagesDB = async (room, user) => {          
  try {    

    const messages =  await axios.post('https://onledu.herokuapp.com/api/chat/saveMessagesDB', {
      messages: getMessagesInRoom(room, user)
    })
    if (messages)
      removeAllRoomMessages(room)
    
    return messages
  } catch (err) {
      console.error(err)
  }
}


module.exports = { addMessage, removeMessage, getMessage, getMessagesInRoom, getAndReadMessagesInRoom, saveMessagesDB , readMessage };