import express from 'express';
import http from 'http';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';
import { verifyToken, websocketVerifyToken } from './utilities/token-utilities.js';

// Create an Express application
const db = new sqlite3.Database('./database/chatlist.db')
const app = express();
app.use(cors());
app.use(bodyParser.json());
// app.use(verifyToken);

app.get('/globalmessages', (req, res) => {
  db.all("SELECT * FROM messages WHERE chatId = ?", ['global'], (err, rows) => {
    if (err) {
      console.error('[ERROR] Something went wrong while fetching global chats. ', err)
    } else {
      console.log('[INFO] Successfully fetched data: ', rows)
      res.send(rows)
    }
  })
})

app.get('/friendlist', (req, res) => {
  res.send([{ msg: 'Test', userId: 'userId' }])
})

app.get('/chats', (req, res) => {
  res.send([{ msg: 'Test', userId: 'userId' }])
})

app.get('/chats', (req, res) => {
  res.send([{ msg: 'Test', userId: 'userId' }])
})

app.get('/chats', (req, res) => {
  res.send([{ msg: 'Test', userId: 'userId' }])
})

app.put('/chats', (req, res) => {
  // if userid === globalchat
  // then it is not a private chat
  res.send([{ msg: 'Test', userId: 'userId' }])
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
const io = new Server(server, { cors: { origin: '*' } });

// Middleware to verify Firebase ID token
io.use(websocketVerifyToken);

io.on('connection', (socket) => {
  // console.log(`User ${socket.user.uid} connected`);
  console.info('[INFO] user connected', socket.sid)
  socket.on('message', (data) => {
    console.info('[INFO] message data:', data)
    const currTime = Date.now();
    const insertQuery = `INSERT INTO messages (userId, message, createdAt, updatedAt, chatId) VALUES (?, ?, ?, ?, ?)`
    db.run(insertQuery, [userid, message, currTime, currTime, chatid || 'global'], (err) => {
      if (err) {
        console.error(err)
        socket.send({ error: 'Something went wrong while sending message' })
      } else {
        console.log('[INFO] Inserted data into table');
        socket.broadcast({ error: null, message: { message, currTime, userid } })
      }
    })

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
