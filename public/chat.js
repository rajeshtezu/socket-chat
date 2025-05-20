const connectedUsersElm = document.getElementById('connected-users');
const remoteUserInputElm = document.getElementById('remoteuserInput');

const joinFormElm = document.getElementById('join-form');
const joinInputElm = document.getElementById('username');
const joinBtnElm = document.getElementById('join-btn');

const chatFormElm = document.getElementById('chat-form');
const chatInputElm = document.getElementById('chat-input');
const chatTextsElm = document.getElementById('chat-text');

const SERVER_URL = 'http://localhost:8000';
const socket = io(SERVER_URL);

let chatWithUsername = null;

function connectWithUser(username) {
  chatWithUsername = username;
  chatFormElm.style.display = 'block';
  joinFormElm.style.display = 'none';
  chatTextsElm.innerHTML += `<p>Connected with ${username}</p>`;
}

socket.on('connect', () => {
  console.log('Connected!!!');
});

socket.on('newMsgFromServer', (message) => {
  chatTextsElm.innerHTML += `<p>${message.text}</p>`;
});

socket.on('privateMsgFromServer', (message) => {
  if (message.from === chatWithUsername) {
    chatTextsElm.innerHTML += `<p>${message.text}</p>`;
  } else {
    chatTextsElm.innerHTML += `<p>Message from ${message.from}: ${message.text}</p>`;
  }

  // chatTextsElm.innerHTML += `<p>Message from ${message.from}: ${message.text}</p>`;
});

socket.on('connectedUsers', (message) => {
  connectedUsersElm.innerHTML = `<p>${message.users.join('\n')}</p>`;
  console.log('Connected users: ', message.users);
});

joinFormElm.addEventListener('click', (event) => {
  event.preventDefault();
  const elmId = event.target.id;

  switch (elmId) {
    case 'join-btn':
      const username = joinInputElm.value;
      socket.emit('registerUser', username);

      chatFormElm.style.display = 'block';
      break;
    case 'chat-remoteuser':
      const chatWith = remoteUserInputElm.value;
      connectWithUser(chatWith);
      socket.emit('privateMsg', { to: chatWith, text: 'Hello!' });
      break;
  }
});

chatFormElm.addEventListener('click', (event) => {
  event.preventDefault();
  const elmId = event.target.id;

  switch (elmId) {
    case 'send-btn':
      const text = chatInputElm.value;
      // socket.emit('newMsgFromClient', { text });
      socket.emit('privateMsg', { to: chatWithUsername, text });
      chatInputElm.value = '';
      break;
  }
});
