import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import createWebsocketServer from "./websocket-server.js";

import { verifyToken } from "./utilities/token-utilities.js";

const API_KEY = process.env.API_KEY || "";
if (!API_KEY) {
  console.warn("[WARN] No API_KEY set in environment variables.");
  throw new Error("API_KEY is required");
}

// Create an Express application

const baseURL = process.env.DB_URL || "http://localhost:8000";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(verifyToken);

app.get("/authenticate", (req, res) => {
  res.send(true);
});

app.get("/globalmessages", async (req, res) => {
  try {
    const response = await fetch(baseURL + "/messages", {
      method: "GET",
      headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
    });
    if (!response.ok) {
      console.error("Failed to fetch messages from DB", {
        status: response.status,
        statusText: response.statusText,
      });
      return res.status(500).json({ error: "Failed to fetch messages" });
    }
    /** @type {Message[]} */
    const messages = await response.json();
    messages.sort((a, b) => (a.editedAt > b.editedAt ? 1 : -1));
    res.json(messages);
  } catch (error) {
    console.error("[ERROR] Failed to fetch global messages:", error);
    return res.status(500).json({ error: "Failed to fetch global messages" });
  }
});

// Define a simple route for HTTP
// Create an HTTP server
const server = http.createServer(app);
const io = createWebsocketServer(baseURL, API_KEY);
io.attach(server);

let HOST = "0.0.0.0";
let PORT = 8080;
// Start the HTTP server
server.listen(PORT, HOST, () => {
  console.log(`Network: http://${HOST}:${PORT}`);
});
