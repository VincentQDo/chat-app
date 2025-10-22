import express from "express";
import { addUser, getUser, modifyUser } from "../db/database.js";

const router = express.Router();

/**
 * Create a new user
 */
router.post("/", async (req, res) => {
  const { userId, email, displayName } = req.body;
  try {
    console.log("Creating user:", userId, email, displayName);
    const result = await addUser(userId, email, displayName);
    res.json({ message: "User created", result });
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    // Assuming getUser is a function that retrieves user info from the database
    const user = await getUser(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
    } else {
      res.json(user);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

/**
 * Update user info
 */
router.put("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { email, displayName, photoURL } = req.body;
  try {
    const result = await modifyUser(userId, { email, displayName, photoURL });
    if (result === -1) {
      res.status(404).json({ error: "User not found" });
    } else {
      res.json({ message: "User updated", result });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

export default router;
