// httpServer.js

import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import { verifyToken } from "./utilities/token-utilities";

/**
 * Creates and configures an Express application and HTTP server.
 * @returns {http.Server} The created HTTP server instance.
 */
export function createHttpServer() {
  const baseURL = process.env.DB_URL;
  const app = express();

  // Apply middleware
  app.use(cors());
  app.use(bodyParser.json());
  app.use(verifyToken);

  // Define HTTP routes
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

  // Create and return the HTTP server
  return http.createServer(app);
}