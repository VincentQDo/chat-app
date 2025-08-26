import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import bodyParser from "body-parser";
import {
  verifyToken,
  websocketVerifyToken,
} from "./utilities/token-utilities.js";

// Create an Express application

const baseURL = process.env.DB_URL;
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(verifyToken);

app.get("/authenticate", (req, res) => {
  const userInfo = {
    uid: req.body.user.uid,
    email: req.body.user.email,
    name: req.body.user.name,
    emailVerified: req.body.user.email_verified,
  };
  res.send({
    authenticated: true,
    userInfo: userInfo,
    tokenExpiration: req.body.user.exp,
  });
});

app.get("/globalmessages", async (req, res) => {
  const response = await fetch(baseURL + "/messages");
  /** @type {Message[]} */
  const messages = await response.json();
  messages.sort((a, b) => (a.updatedAt > b.updatedAt ? 1 : -1));
  const result = messages.slice(-20);
  res.json(result);
});

// Define a simple route for HTTP
// Create an HTTP server
const server = http.createServer(app);
// Create a web socket server and add its own cors policy
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

// Middleware to verify Firebase ID token
io.use(websocketVerifyToken);

io.on("connection", (socket) => {
  // console.log(`User ${socket.user.uid} connected`);
  console.info(`[INFO] User connected: ${socket.id}`);
  const connectedSockets = io.sockets.sockets;
  console.info(`[INFO] Number of connected users: `, connectedSockets.size);
  socket.broadcast.emit("userConnected", {
    error: null,
    message: { users: connectedSockets.size },
  });
  socket.emit("userConnected", {
    error: null,
    message: { users: connectedSockets.size },
  });
  socket.on("message", async (data) => {
    console.info(`[INFO] Socket ${socket.id} sent: `, data);
    const currTime = Date.now();
    const { userId, message, chatId } = data;
    /** @type {Message} */
    const jsonBody = {
      message: message,
      userId: userId,
      chatId: chatId,
      createdAt: currTime,
      updatedAt: currTime,
      status: "sent",
    };
    console.info("[INFO] Sending message to database: ", jsonBody);
    const response = await fetch(baseURL + "/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jsonBody),
    });
    console.debug("[DEBUG] Response received: ", response);
    if (response.ok) {
      jsonBody.status = "sent";
      const jsonData = { error: null, message: jsonBody };
      console.info("[INFO] Broadcasting message: ", jsonData);
      socket.broadcast.emit("message", jsonData);
    }
  });

  socket.on("disconnect", (reason) => {
    console.info("[INFO] User disconnected: ", socket.id, reason);
    socket.broadcast.emit("userDisconnected", {
      error: null,
      message: { users: connectedSockets.size },
    });
  });
});

let HOST = "0.0.0.0";
let PORT = 8080;
// Start the HTTP server
server.listen(PORT, HOST, () => {
  console.log(`Network: http://${HOST}:${PORT}`);
});
