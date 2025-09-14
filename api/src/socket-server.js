// socketServer.js

import { Server } from "socket.io";
import { websocketVerifyToken } from "./utilities/token-utilities";

const baseURL = process.env.DB_URL;

/**
 * Initializes and configures the Socket.IO server.
 * @param {import("http").Server} httpServer - The HTTP server to attach Socket.IO to.
 */
export function initializeSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
      credentials: true,
    },
  });

  // --- State and Helpers ---

  /** @type {Map<string, Set<{socketId: string, userId: string}>>} */
  const typingUsers = new Map();

  const cleanupTypingForSocket = (socketId) => {
    for (const [roomId, users] of typingUsers.entries()) {
      const userToRemove = Array.from(users).find(
        (user) => user.socketId === socketId
      );
      if (userToRemove) {
        users.delete(userToRemove);
        io.to(roomId).emit("typing:stop", {
          userId: userToRemove.userId,
          roomId: roomId,
        });
        if (users.size === 0) {
          typingUsers.delete(roomId);
        }
      }
    }
  };

  const addTypingUser = (roomId, socketId, userId) => {
    if (!typingUsers.has(roomId)) {
      typingUsers.set(roomId, new Set());
    }
    const users = typingUsers.get(roomId);
    const existingUser = Array.from(users).find((user) => user.userId === userId);
    if (!existingUser) {
      users.add({ socketId, userId });
      return true;
    }
    return false;
  };

  const removeTypingUser = (roomId, socketId, userId) => {
    if (!typingUsers.has(roomId)) return false;
    const users = typingUsers.get(roomId);
    const userToRemove = Array.from(users).find(
      (user) => user.socketId === socketId && user.userId === userId
    );
    if (userToRemove) {
      users.delete(userToRemove);
      if (users.size === 0) {
        typingUsers.delete(roomId);
      }
      return true;
    }
    return false;
  };

  // --- Middleware ---
  io.use(websocketVerifyToken);

  // --- Connection Logic ---
  io.on("connection", (socket) => {
    console.info(`[INFO] User connected: ${socket.id}`);
    const connectedSockets = io.sockets.sockets;
    io.emit("userConnected", {
      error: null,
      message: { users: connectedSockets.size },
    });

    socket.on("join:room", (data) => {
      socket.join(data.roomId);
      console.info(
        `[INFO] Socket ${socket.id} with userId ${data.userId} joined room: ${data.roomId}`
      );
    });

    socket.on("leave:room", (data) => {
      socket.leave(data.roomId);
      cleanupTypingForSocket(socket.id);
      console.info(
        `[INFO] Socket ${socket.id} with userId ${data.userId} left room: ${data.roomId}`
      );
    });

    socket.on("typing:start", (data) => {
      const { roomId, userId } = data;
      if (addTypingUser(roomId, socket.id, userId)) {
        socket.to(roomId).emit("typing:start", { userId, roomId });
      }
    });

    socket.on("typing:stop", (data) => {
      const { roomId, userId } = data;
      if (removeTypingUser(roomId, socket.id, userId)) {
        socket.to(roomId).emit("typing:stop", { userId, roomId });
      }
    });

    socket.on("message", async (data) => {
      const { userId, message, chatId, roomId } = data;

      if (roomId && userId) {
        if (removeTypingUser(roomId, socket.id, userId)) {
          socket.to(roomId).emit("typing:stop", { userId, roomId });
        }
      }

      const currTime = Date.now();
      const jsonBody = {
        message,
        userId,
        chatId,
        createdAt: currTime,
        updatedAt: currTime,
        status: "sent",
      };

      const response = await fetch(baseURL + "/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonBody),
      });

      if (response.ok && roomId) {
        socket.to(roomId).emit("message", { error: null, message: jsonBody });
      }
    });

    socket.on("disconnect", (reason) => {
      console.info("[INFO] User disconnected: ", socket.id, reason);
      cleanupTypingForSocket(socket.id);
      const updatedCount = io.sockets.sockets.size;
      socket.broadcast.emit("userDisconnected", {
        error: null,
        message: {
          users: updatedCount,
          // @ts-ignore user prop is added in middleware
          userId: socket.user?.uid || socket.id,
        },
      });
    });

    socket.on("error", (error) => {
      console.error(`[ERROR] Socket ${socket.id} error:`, error);
      cleanupTypingForSocket(socket.id);
    });
  });
}