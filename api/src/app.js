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
  res.send(true);
});

app.get("/globalmessages", async (req, res) => {
  const response = await fetch(baseURL + "/messages");
  /** @type {Message[]} */
  const messages = await response.json();
  messages.sort((a, b) => (a.updatedAt > b.updatedAt ? 1 : -1));
  res.json(messages);
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

// Store typing users in memory (in production, consider using Redis for scaling)
/** @type {Map<string, Set<{socketId: string, userId: string}>>} */
const typingUsers = new Map(); // Map<roomId, Set<{socketId, userId}>>

// Helper function to clean up typing indicators for a socket
const cleanupTypingForSocket = (socketId) => {
  for (const [roomId, users] of typingUsers.entries()) {
    const userToRemove = Array.from(users).find(user => user.socketId === socketId);
    if (userToRemove) {
      users.delete(userToRemove);
      // Broadcast typing stop to room
      io.to(roomId).emit('typing:stop', {
        userId: userToRemove.userId,
        roomId: roomId
      });
      // Clean up empty rooms
      if (users.size === 0) {
        typingUsers.delete(roomId);
      }
    }
  }
};

// Helper function to add typing user
const addTypingUser = (roomId, socketId, userId) => {
  if (!typingUsers.has(roomId)) {
    typingUsers.set(roomId, new Set());
  }
  const users = typingUsers.get(roomId);

  // Check if user is already typing in this room
  // TODO optimize this lookup, currently O(n) won't scale well with many users
  // Consider using a Map for users instead of Set for O(1) lookups
  // e.g., Map<userId, socketId>
  // But that would require more changes in the data structure
  // For now, we keep it simple
  const existingUser = Array.from(users).find(user => user.userId === userId);
  if (!existingUser) {
    users.add({ socketId, userId });
    return true; // New typing user added
  }
  return false; // User was already typing
};

// Helper function to remove typing user
const removeTypingUser = (roomId, socketId, userId) => {
  if (!typingUsers.has(roomId)) return false;

  const users = typingUsers.get(roomId);
  const userToRemove = Array.from(users).find(user =>
    user.socketId === socketId && user.userId === userId
  );

  if (userToRemove) {
    users.delete(userToRemove);
    // Clean up empty rooms
    if (users.size === 0) {
      typingUsers.delete(roomId);
    }
    return true; // User was removed
  }
  return false; // User wasn't found
};

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

  // Handle joining rooms (for room-based typing indicators)
  socket.on('join:room', (/** @type {{ roomId: string, userId: string }} */ data) => {
    const { roomId, userId } = data;
    socket.join(roomId);
    console.info(`[INFO] Socket ${socket.id} with userId ${userId} joined room: ${roomId}`);
  });

  // Handle leaving rooms
  socket.on('leave:room', (/** @type {{ roomId: string, userId: string }} */ data) => {
    const { roomId, userId } = data;
    socket.leave(roomId);
    // Clean up any typing indicators for this user in this room
    cleanupTypingForSocket(socket.id);
    console.info(`[INFO] Socket ${socket.id} with userId ${userId} left room: ${roomId}`);
  });

  // Handle typing start
  socket.on('typing:start', (data) => {
    const { roomId, userId } = data;
    console.info(`[INFO] User ${userId} started typing in room ${roomId}`);

    // Add user to typing list
    const isNewTyper = addTypingUser(roomId, socket.id, userId);

    if (isNewTyper) {
      // Broadcast to room (excluding sender)
      socket.to(roomId).emit('typing:start', {
        userId: userId,
        roomId: roomId
      });
    }
  });

  // Handle typing stop
  socket.on('typing:stop', (data) => {
    const { roomId, userId } = data;
    console.info(`[INFO] User ${userId} stopped typing in room ${roomId}`);

    // Remove user from typing list
    const wasTyping = removeTypingUser(roomId, socket.id, userId);

    if (wasTyping) {
      // Broadcast to room (excluding sender)
      socket.to(roomId).emit('typing:stop', {
        userId: userId,
        roomId: roomId
      });

      // For global chat (backward compatibility)
      if (roomId === 'global') {
        socket.broadcast.emit('typing:stop', {
          userId: userId,
          roomId: roomId
        });
      }
    }
  });

  socket.on("message", async (data) => {
    console.info(`[INFO] Socket ${socket.id} sent: `, data);
    const currTime = Date.now();
    const { userId, message, chatId, roomId } = data;

    // Stop typing indicator when message is sent
    if (roomId && userId) {
      const wasTyping = removeTypingUser(roomId, socket.id, userId);
      if (wasTyping) {
        socket.to(roomId).emit('typing:stop', {
          userId: userId,
          roomId: roomId
        });

        // For global chat (backward compatibility)
        if (roomId === 'global') {
          socket.broadcast.emit('typing:stop', {
            userId: userId,
            roomId: roomId
          });
        }
      }
    }

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

      // Broadcast to specific room if roomId is provided
      if (roomId) {
        socket.to(roomId).emit("message", jsonData);

        // For global chat, also broadcast to all (backward compatibility)
        if (roomId === 'global') {
          socket.broadcast.emit("message", jsonData);
        }
      } else {
        // Fallback to broadcasting to all
        socket.broadcast.emit("message", jsonData);
      }
    }
  });

  socket.on("disconnect", (reason) => {
    console.info("[INFO] User disconnected: ", socket.id, reason);

    // Clean up any typing indicators for this socket
    cleanupTypingForSocket(socket.id);

    // Get updated count after disconnect
    const updatedConnectedSockets = io.sockets.sockets;
    socket.broadcast.emit("userDisconnected", {
      error: null,
      message: {
        users: updatedConnectedSockets.size,
        // @ts-ignore
        userId: socket.user?.uid || socket.id // Include disconnected user info if available
      },
    });
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error(`[ERROR] Socket ${socket.id} error:`, error);
    // Clean up typing indicators on error
    cleanupTypingForSocket(socket.id);
  });
});

let HOST = "0.0.0.0";
let PORT = 8080;
// Start the HTTP server
server.listen(PORT, HOST, () => {
  console.log(`Network: http://${HOST}:${PORT}`);
});