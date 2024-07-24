import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';
import db from './database/database.js';
import { verifyToken, websocketVerifyToken } from './utilities/token-utilities.js';

// Create an Express application
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(verifyToken);

// Define a simple route for HTTP
// Create an HTTP server
const server = http.createServer(app);
// Create a web socket server and add its own cors policy
const io = new Server(server, { cors: { origin: '*' } });

// Middleware to verify Firebase ID token
io.use(websocketVerifyToken);

io.on('connection', (socket) => {
  // console.log(`User ${socket.user.uid} connected`);
  console.log('user connected', socket.sid)
  socket.on('message', (data) => {
    console.log('message data:', data)
    // const message = `${socket.user.name}: ${data}`;
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
