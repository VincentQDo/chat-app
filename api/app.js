import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';

// Create an Express application
const app = express();
app.use(cors());

// Define a simple route for HTTP
app.get('/', (req, res) => {
  res.send('Hello, this is a WebSocket and HTTP server!');
});

// Define the /chatlist route
app.get('/chatlist', (req, res) => {
  const userId = req.query.userid;
  if (!userId) {
    console.log('Current userid is empty', userid);
    return res.status(400).send('Missing userid query parameter');
  }

  // For demonstration, let's assume we have a function to fetch chat list based on userId
  const chatList = [
    {
      sessionId: "1023lksjdflkj",
      sessionName: "Chat wiht Bob",
      personId: "bob1",
      personName: "Bob",
    },
    {
      sessionId: "alksjlkdjrlkj",
      sessionName: "Chat wiht Alice",
      personId: "Alice1",
      personName: "Alice",
    },
  ];

  console.log('result', chatList);
  return res.json(chatList);
});

app.get('/messagelist', (req, res) => {
  const chatid = req.query.chatid;
  const convoData = [
    {
      userName: "Bob",
      userId: "bob1",
      message: "Hello there",
      role: "other",
      messageId: 0,
    },
    {
      userName: "Vince",
      userId: "vince1",
      message: "Hello there back",
      role: "self",
      messageId: 1,
    },
  ];

  console.log(chatid)
  console.log(convoData)

  return res.json(convoData);
})

// Create an HTTP server
const server = http.createServer(app);
// Create a web socket server and add its own cors policy
const io = new Server(server, { cors: { origin: '*' } });
io.on('connection', (socket) => {
  // console.log(`User ${socket.user.uid} connected`);
  console.log('user connected', socket.sid)
  socket.on('message', (data) => {
    console.log(data)
    // const message = `${socket.user.name}: ${data}`;
    const message =
    {
      messageId: 'test',   // Unique identifier for the message
      chatId: 'test',      // Identifier for the chat session
      userId: 'Test',      // Identifier for the user who sent the message
      userName: 'Vince',    // Name of the user who sent the message
      message: data,     // The content of the message
      role: 'other', // Role of the user (e.g., 'self' if the message is from the current user, 'other' if from someone else)
      timestamp: Date.now(),   // Unix timestamp of when the message was sent
    }

    socket.broadcast.emit('message', message);
    message.role = 'self'
    socket.emit('message', message);
  });

  socket.on('disconnect', () => {
    // console.log(`User ${socket.user.uid} disconnected`);
    console.log('User disconnected');
  });
});

// Start the HTTP server
server.listen(8080, () => {
  console.log('Server is listening on port 8080');
});