import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import admin from './firebaseAdmin.js';
import db from './database/database.js';

// Create an Express application
const app = express();
app.use(cors());
// Middleware to verify Firebase ID token
async function verifyToken(req, res, next) {
  const unauthResponse = { code: '403', msg: 'Token not found' };
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token || token === 'null') {
    return res.status(403).send(unauthResponse);
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (err) {
    console.log('Authentication error', err, token);
    /** @type FirebaseAuthError */
    const firebaseAuthErr = err;
    unauthResponse.code = firebaseAuthErr.code;
    unauthResponse.msg = firebaseAuthErr.message;
    return res.status(403).send(unauthResponse);
  }
}

// Apply the verifyToken middleware globally
app.use(verifyToken);

// Define a simple route for HTTP
app.get('/', (req, res) => {
  res.send('Hello, this is a WebSocket and HTTP server!');
});

// Define the /chatlist route
app.get('/chatlist', (req, res) => {
  const userId = req.query.userid;
  if (!userId) {
    const badRequest = { code: 400, msg: 'Missing userid field' };
    console.log('Current userid is empty', userId);
    return res.status(400).send(badRequest);
  }

  db.all('SELECT * FROM chats', [], (err, rows) => {
    if (err) {
      console.error('Error while fetching data', err);
      return;
    }
    console.log(rows);
    return res.json(rows);
  })
});

app.get('/messagelist', (req, res) => {
  const chatid = req.query.chatid;

  db.all('SELECT * FROM messages', [], (err, rows) => {
    if (err) {
      console.error('Error while getting messages', err);
      return;
    }
    console.log('Messages: ', rows);

    return res.json(rows);
  })
})

// Create an HTTP server
const server = http.createServer(app);
// Create a web socket server and add its own cors policy
const io = new Server(server, { cors: { origin: '*' } });

// Middleware to verify Firebase ID token
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    socket.user = decodedToken;
    next();
  } catch (err) {
    console.log('Authentication error', err);
    next(new Error('Authentication error'));
  }
});

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
