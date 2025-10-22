import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import { verifyToken } from "./utilities/token-utilities.js";

export default function createExpressApp(baseURL, API_KEY) {
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

  return app;
}
