

let users = [];



exports.addUser = ({ id, name, room, userid }) => {
  if (!name || !room || !userid) return { error: "name and room required." };
  const user = { id, name, room, userid };

  users.push(user);

  return { user };
};

function arrayRemove(arr, value) {     
  return arr.filter(function(ele){ 
      return ele.id != value; 
  });
}

exports.removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1){
    const userRemoved = users[index]; 
    users = arrayRemove(users,users[index].id) 
    //console.log(users)  
    return userRemoved; 
  }
  else
    return false 
};



exports.getNumberUsersInRoom = (room) => {
  const roomUsers = users.filter((user) => user.room === room).length;    
  return roomUsers;

}