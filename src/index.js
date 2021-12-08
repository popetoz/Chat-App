const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMsg, generateLocationMsg } = require("./utils/message");
const {
  addUser,
  removeUserByID,
  findUserById,
  findUsersInRoom,
} = require("./utils/users");

const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "../public");
const app = express();
app.use(express.static(publicDir));

const server = http.createServer(app);
const io = socketio(server);

io.on("connection", (socket) => {
  // socket.emit, io.emit, socket.broadcast.emit
  // io.to().emit, socket.broadcast.to.emit
  console.log("New webSocket connection!");

  socket.on("join", ({ username, room }, callback) => {
    // add user to our users array
    const { error, user } = addUser({
      id: socket.id,
      username,
      room,
    });

    if (error) {
      return callback(error);
    }

    // join this connection to the specified room
    socket.join(user.room);

    // send the id to the user
    socket.emit("sendId", user.id);

    // print welcome message to that socket
    socket.emit(
      "print",
      generateMsg(
        "Admin",
        `Welcome ${user.username} you are in chat room ${user.room}`
      ),
      "admin"
    );

    // make broad cast to all the room
    socket.broadcast
      .to(user.room)
      .emit(
        "print",
        generateMsg("Admin", `${user.username} has joined!`),
        "admin"
      );

    // update users in room for sidebar
    io.to(user.room).emit("updateUsersInRoom", {
      roomName: user.room,
      users: findUsersInRoom(user.room),
    });
  });

  socket.on("sendToAll", (msg, callback) => {
    const filter = new Filter();

    if (filter.isProfane(msg)) {
      return callback("This Language is not allowed!");
    }

    // get the user info
    const user = findUserById(socket.id);
    if (user) {
      // send the message for all users exist in user's room
      io.to(user.room).emit("print", generateMsg(user.username, msg), user.id);
      callback();
    }
  });

  socket.on("shareLocation", (lat, long, callback) => {
    // get the user info
    const user = findUserById(socket.id);

    io.to(user.room).emit(
      "printLocation",
      generateLocationMsg(user.username, lat, long),
      user.id
    );
    callback();
  });

  socket.on("disconnect", () => {
    // remove the user from the users arr
    const user = removeUserByID(socket.id);

    if (user) {
      io.to(user.room).emit(
        "print",
        generateMsg("Admin", `${user.username} has left the chat!`),
        "admin"
      );
    }
    if (user) {
      // update users in room for sidebar
      io.to(user.room).emit("updateUsersInRoom", {
        roomName: user.room,
        users: findUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
