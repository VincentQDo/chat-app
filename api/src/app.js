// app.js

import { createHttpServer } from "./http-server.js";
import { initializeSocketServer } from "./socket-server.js";

// --- Server Configuration ---
const HOST = "0.0.0.0";
const PORT = 8080;

// --- Initialization ---

// 1. Create the HTTP server
const httpServer = createHttpServer();

// 2. Initialize the WebSocket server
initializeSocketServer(httpServer);

// --- Start Server ---
httpServer.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
});