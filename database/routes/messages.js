import express from "express";
import { addMessage, deleteMessage, editMessage, getAllMessages } from "../db/database.js";

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("[INFO] Getting all messages");
  const { limit, offset, roomId } = req.query;
  const data = await getAllMessages(limit, offset, roomId);
  res.json(data);
});

router.post("/", async (req, res) => {
  console.log("[INFO] Adding messaage from body", req.body);
  const data = await addMessage(req.body);
  res.json(data);
});

router.patch("/", async (req, res) => {
  console.log("[INFO] Editing message from body", req.body);
  const { messageId, newContent, status } = req.body;
  if (!messageId) {
    res.status(400).json({ error: "messageId is required" });
    return;
  }
  // If newContent is provided, update content; otherwise only update status
  const data = await editMessage(messageId, newContent ?? undefined, status);
  res.json(data);
});

router.delete("/", async (req, res) => {
  console.log("[INFO] Deleting message from body", req.body);
  const data = await deleteMessage(req.body.messageId);
  res.json(data);
});

export default router;
