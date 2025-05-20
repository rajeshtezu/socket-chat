const express = require('express');
const socketio = require('socket.io');

const PORT = 8000;

// Map to store username -> socket.id
const users = {};
let fromUser = null;

function getKeyByValue(obj, value) {
  return Object.keys(obj).find((key) => obj[key] === value);
}

const app = express();

app.use(express.static(__dirname + '/public'));

const server = app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

const io = socketio(server);

io.on('connection', (socket) => {
  console.log('Connection id: ', socket.id);

  // Listen for user registration
  socket.on('registerUser', (username) => {
    users[username] = socket.id;
    console.log(`User registered: ${username} with socket id ${socket.id}`);
    io.emit('connectedUsers', { users: Object.keys(users) });
  });

  // Broadcast message to all users
  socket.on('newMsgFromClient', (message) => {
    io.emit('newMsgFromServer', { text: message.text });
  });

  // Send message to a specific user
  socket.on('privateMsg', ({ to, text }) => {
    const targetSocketId = users[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('privateMsgFromServer', { from: getKeyByValue(users, socket.id), text });
    }
  });

  // Clean up on disconnect
  socket.on('disconnect', () => {
    for (const [username, id] of Object.entries(users)) {
      if (id === socket.id) {
        delete users[username];
        break;
      }
    }
  });
});
