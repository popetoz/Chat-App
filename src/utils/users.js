let users = [];

// add new user
const addUser = ({ id, username, room }) => {
  // clean data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // check for not existing user or room
  if (!username || !room) {
    return {
      error: "User name and room are required!",
    };
  }

  // check for unique username in the specified room
  let existingUser = users.find((user) => {
    return user.username === username && user.room === room;
  });

  // if the username is exist
  if (existingUser) {
    return {
      error: `${username} is already taken in room ${room}`,
    };
  }

  // add the new user to the users array
  const newUser = { id, username, room };
  users.push(newUser);

  return { user: newUser };
};

// remove user from users array by id
const removeUserByID = (id) => {
  // find the index of the user to remove
  let i = users.findIndex((user) => user.id === id);

  // remove that user by index
  let removedUser = undefined;
  if (i !== -1) {
    removedUser = users.splice(i, 1)[0];
  }

  return removedUser;
};

// find user by id
const findUserById = (id) => {
  const user = users.find((user) => user.id === id);
  // return the found user
  return user;
};

// find all users in specifc room
const findUsersInRoom = (room) => {
  const usersInRoom = users.filter((user) => user.room === room);
  return usersInRoom;
};

module.exports = {
  addUser,
  removeUserByID,
  findUserById,
  findUsersInRoom,
};