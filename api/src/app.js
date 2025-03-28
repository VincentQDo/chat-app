import express from 'express';
import path from 'path';
import http from 'http';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';
import { verifyToken, websocketVerifyToken } from './utilities/token-utilities.js';

// Create an Express application
const __dirname = path.resolve()
const dbPath = path.join(__dirname, 'database', 'chatlist.db')
console.log('[INFO] Db path: ', dbPath)
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('[ERROR] ', err.message)
  } else {
    console.log('[INFO] Connected to database')
  }
})

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(verifyToken);

app.get('/authenticate', (req, res) => {
  const userInfo = {
    uid: req.user.uid,
    email: req.user.email,
    name: req.user.name,
    emailVerified: req.user.email_verified
  }
  res.send({
    authenticated: true,
    userInfo: userInfo,
    tokenExpiration: req.user.exp
  })
})

app.get('/globalmessages', (req, res) => {
  console.log('[INFO] Getting global messages')
  db.all("SELECT * FROM messages WHERE chatId = ?", ['global'], (err, rows) => {
    if (err) {
      console.error('[ERROR] Something went wrong while fetching global chats. ', err)
    } else {
      console.log('[INFO] Successfully fetched data: ', rows)
      res.send(rows)
    }
  })
})

app.post('/message', (req, res) => {
  const { message, userid, chatid } = req.body;
  console.info('[INFO] Request body: ', { message, userid, chatid })
  const currTime = Date.now();
  const insertQuery = `INSERT INTO messages (userId, message, createdAt, updatedAt, chatId) VALUES (?, ?, ?, ?, ?)`
  db.run(insertQuery, [userid, message, currTime, currTime, chatid || 'global'], (err) => {
    if (err) {
      console.error(err)
      res.status(500).send('Error inserting data')
    } else {
      console.log('[INFO] Inserted data into table');
      res.send({ userId: userid, message: message, createdAt: currTime, updatedAt: currTime, chatId: chatid })
    }
  })
})

// Define a simple route for HTTP
// Create an HTTP server
const server = http.createServer(app);
// Create a web socket server and add its own cors policy
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  }
});

// Middleware to verify Firebase ID token
io.use(websocketVerifyToken);

io.on('connection', (socket) => {
  // console.log(`User ${socket.user.uid} connected`);
  console.info(`[INFO] User connected: ${socket.id}`)
  const connectedSockets = io.sockets.sockets;
  console.info(`[INFO] Number of connected users: `, connectedSockets.size);
  socket.broadcast.emit('userConnected', { error: null, message: { users: connectedSockets.size } })
  socket.emit('userConnected', { error: null, message: { users: connectedSockets.size } })
  socket.on('message', (data) => {
    console.info(`[INFO] Socket ${socket.id} sent: `, data)
    const currTime = Date.now();
    const { userId, message, chatId } = data;
    const insertQuery = `INSERT INTO messages (userId, message, createdAt, updatedAt, chatId, status) VALUES (?, ?, ?, ?, ?, ?)`
    db.run(insertQuery, [userId || 'Annonymous', message, currTime, currTime, chatId || 'global', 'sent'], (err) => {
      if (err) {
        console.error(err)
        socket.emit('error', { error: 'Something went wrong while sending message', message: null })
      } else {
        console.info('[INFO] Inserted data into table');
        socket.broadcast.emit('message',
          {
            error: null,
            message: {
              message,
              createdAt: currTime,
              updatedAt: currTime,
              userId,
              status: 'sent',
              chatId
            }
          }
        )
      }
    })

  });

  socket.on('disconnect', (reason) => {
    console.info('[INFO] User disconnected: ', socket.id, reason);
    socket.broadcast.emit('userDisconnected', { error: null, message: { users: connectedSockets.size } })
  });
});

let HOST = '0.0.0.0'
let PORT = 8080
// Start the HTTP server
server.listen(PORT, HOST, () => {
  console.log(`Network: http://${HOST}:${PORT}`);
});
