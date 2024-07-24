import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import admin from './firebaseAdmin.js';
import bodyParser from 'body-parser';
import db from './database/database.js';
import { verifyToken } from './utilities/token-utilities.js';

// Create an Express application
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Apply the verifyToken middleware globally
app.use(verifyToken);

// Define a simple route for HTTP
app.get('/', (req, res) => {
  res.send('Hello, this is a WebSocket and HTTP server!');
});

// Define the /chatlist route
app.get('/chatlist', (req, res) => {
  const userId = req.user.uid;
  if (!userId) {
    const badRequest = { code: 400, msg: 'Missing userid field' };
    console.log('Current userid is empty', userId);
    return res.status(400).send(badRequest);
  }

  db.all('SELECT * FROM chats where personId = ?', [userId], (err, rows) => {
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
  const userid = req.user.uid;
  db.all('SELECT * FROM messages WHERE chatId = ? AND userId = ?', [chatid, userid], (err, rows) => {
    if (err) {
      console.error('Error while getting messages', err);
      return;
    }
    console.log('Messages: ', rows);

    return res.json(rows);
  })
});

app.get('/friend-list', (req, res) => {
  const userId = req.query.userid;
  db.all('SELECT * FROM users WHERE userId = ?', userId, (err, rows) => {
    if (err) {
      console.error('Something went wrong while getting friendlist', err);
    } else {
      console.log('Fetched data.', rows);
      return res.json(rows);
    }
  })
})

app.post('/createchat', (req, res) => {
  /** 
   * @typedef chatReqBody
   * @prop {string[]} personIds
   * @prop {boolean} isGroupChat
   * */

  /** @type chatReqBody */
  const { personIds, isGroupChat } = req.body;

  db.serialize(() => {
    console.log('Beginning transaction to create chat session.');
    db.run('BEGIN TRANSACTION');
    // Create a chat session id
    const chatQuery = `INSERT INTO chats (createdAt, updatedAt, isGroupChat) VALUES ($createdAt, $updatedAt, $isGroupChat)`;
    const chatSessionId = '';
    const chatParams = {
      $createdAt: Date.now(),
      $updatedAt: Date.now(),
      $isGroupChat: isGroupChat
    }
    db.run(chatQuery, chatParams, function(err) {
      if (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating chat.' })
      } else {
        console.log('Successfully created chat session: ', this.lastID);
        chatSessionId = this.lastID;
      }
    });

    const userQueryValues = personIds.map(_ => '(?, ?)').join(', ');
    const linkUserToChatQuery = `INSERT INTO user_chats (sessionId, userId) VALUES ${userQueryValues}`;
    const userToChatParams = personIds.map(id => {
      return (chatSessionId, id);
    })

    db.run(linkUserToChatQuery, userToChatParams, function(err) {
      if (err) {
        console.error(err);
        db.run('ROLLBACK', (rollbackErr) => {
          if (rollbackErr) {
            console.error('Error rolling back transaction.', rollbackErr);
          } else {
            console.log('Scuccessfully rolled back transaction.');
          }
        });
      } else {
        console.log('Linking user to chat successful: ', this.lastID);
        db.run('COMMIT', (commitErr) => {
          if (commitErr) {
            console.error('Error committing transaction.', commitErr)
          } else {
            console.log('Successfully committed transaction.');
            res.status(201).json({ chatSessionId })
          }
        })
      }
    });
  })
})

app.delete('/chats', (req, res) => {
  db.serialize(() => {

    db.run('DELETE FROM chats', (err) => {
      if (err) {
        console.error('An error occured while deleting chats.', err)
      } else {
        console.log('chats deleted')
      }
    });

    db.run('VACUUM', (err) => {
      if (err) {
        console.error('Error occured while vaccuming.', err)
      } else {
        console.log('Vacuum done!')
      }
    })
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
    console.log('message data:', data)
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

    const query = `INSERT INTO messages (messageid, chatId, userId, userName, message, role, timestamp)
                    VALUES ($messageid, $chatId, $userId, $userName, $message, $role, $timestamp)`
    const params = {
      $messageid: data
    }
    return;
    db.run(query, params, function(err) {
      if (err) {
        console.error('Error while inserting message', err);
      } else {
        socket.broadcast.emit('message', message);
        message.role = 'self'
        socket.emit('message', message);
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
