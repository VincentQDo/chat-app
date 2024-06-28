import express from 'express';
import http from 'http';
import cors from 'cors';
import WebSocket, { WebSocketServer } from "ws";

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
      messageId: "slkjerlkj",
    },
    {
      userName: "Vince",
      userId: "vince1",
      message: "Hello there back",
      role: "self",
      messageId: "1l3kjfi",
    },
  ];

  console.log(chatid)
  console.log(convoData)

  return res.json(convoData);
})

// Create an HTTP server
const server = http.createServer(app);

class WebSocketServerExt extends WebSocketServer {
  /**
   *
   * @param {WebSocket.ServerOptions | undefined} options
   * @param {(() => void) | undefined} callback
   */
  constructor(options = undefined, callback = undefined) {
    super(options, callback);
  }
  broadcast = (msg) => {
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  };
}

const wss = new WebSocketServerExt({
  server: server,
  clientTracking: true,
  path: "/chat",
});

const msgHTML = (messageText) => `<p>${messageText}<p>`;

wss.on("connection", (wsClient, req) => {
  wsClient.isAuthenticated = false;
  wsClient.on("message", (data) => {
    if (!wsClient.isAuthenticated) {
      const jsonData = JSON.parse(data.toString());
      if (jsonData.userName === "Anna" || jsonData.userName === "Vince") {
        wsClient.isAuthenticated = true;
        wsClient.userName = jsonData.userName;
        console.log(`User ${jsonData.userName} authenticated`)
        return wsClient.send(200);
      } else {
        console.log(`User ${jsonData.userName} failed authentication`)
        wsClient.send(401);
        return wsClient.terminate();
      }
    }
    const strData = wsClient.userName + ':' + data.toString();
    console.log(`<<< ${strData}`);
    console.log(`>>> ${msgHTML(strData)}`);
    wss.broadcast(msgHTML(strData));
  });
});

// Start the HTTP server
server.listen(8080, () => {
  console.log('Server is listening on port 8080');
});