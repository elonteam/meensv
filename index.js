const app = require("express")()
const server = require("http").createServer(app)

// const io = require("socket.io")(server, {cors: {origin: "http://localhost:5173"}})
const io = require("socket.io")(server, {cors: {origin: "*"}})

const {
  userJoinGroup,
  getCurrentUserDetails,
  userLeaveGroup,
} = require('./users');

const PORT = process.env.PORT || 3001

io.on('connection', (socket) => {
  // console.log("Conectado: ", socket.id)
  // socket.on('disconnect', reason=>{
  //   console.log(">>> Desconectado: ", socket.id)
  // })

  // io.emit('connected', "CONECTADO NO SERVIDOR");

  //////////// start /////////////
  socket.on('joinGroup', (data) => {
    const user = userJoinGroup(socket.id, data.username, data.room);
    console.log(`${user.username} user connected to ${user.room}`);
    socket.join(user.room);

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit('roomNotification', `${user.username} has joined group`);
  });

  // Listen for chatMessage
  socket.on('chatMessage', (msg) => {
    const user = getCurrentUserDetails(socket.id);
    io.to(user.room).emit('message', msg);
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeaveGroup(socket.id);

    if (user) {
      console.log(`${user.username} is left the group!`);
      io.to(user.room).emit(
        'roomNotification',
        `${user.username} has left the group`,
      );
    }
  });






});

server.listen(PORT, () => console.log(">>> Servidor rodando!"))