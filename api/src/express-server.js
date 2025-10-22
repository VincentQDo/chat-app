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

  // Since we are using a separate service for authentication,
  // We can grab data from the token and just create the user if not exist in our DB
  app.get("/authenticate", async (req, res) => {
    /** @type {import("firebase-admin/lib/auth/token-verifier.js").DecodedIdToken} */
    // @ts-ignore
    const user = req.user;
    const { uid, email, name, picture } = user;
    console.log("[INFO] Authenticating user:", { uid, email, name });
    // Check if user exists in our DB, if not create it
    let response = await fetch(baseURL + "/users/" + uid, {
      headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
    });
    if (response.status === 404) {
      // User does not exist, create it
      const createResponse = await fetch(baseURL + "/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
        body: JSON.stringify({
          userId: uid,
          email: email,
          displayName: name,
          photoURL: picture,
        }),
      });
      if (!createResponse.ok) {
        console.error("Failed to create user in DB", {
          status: createResponse.status,
          statusText: createResponse.statusText,
        });
        return res.status(500).json({ error: "Failed to create user" });
      }

      console.log("[INFO] Created new user in DB:", uid);
      // Fetch the newly created user
      response = await fetch(baseURL + "/users/" + uid, {
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
      });
    }

    const existingUser = await response.json();
    return res.json(existingUser);
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

  // Edit user
  // Get user info
  // Create room
  // Rename room
  // Join room
  // Add participant to room
  // Remove participant from room
  // Delete room

  return app;
}
