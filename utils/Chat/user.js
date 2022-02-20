let users = [];

exports.addUser = ({ id, name, room, userId }) => {
  if (!name || !room || !userId) return { error: "name and room required." };
  const user = { id, name, room, userId };

  users.push(user);

  return { user };
};

exports.removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  return users[index];
};