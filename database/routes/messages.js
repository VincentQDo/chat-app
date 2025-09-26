import express from "express";
import { addMessage, deleteMessage, editMessage, getAllMessages, markMessagesAsReadPrepared } from "../db/database.js";

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

router.patch("/:messageId/content", async (req, res) => {
  console.log("[INFO] Editing message from body", req.params, req.body);
  const { messageId  } = req.params;
  const { newContent  } = req.body;
  if (!messageId) {
    res.status(400).json({ error: "messageId is required" });
    return;
  }
  // If newContent is provided, update content; otherwise only update status
  if (typeof newContent === "string") {
    const data = await editMessage(messageId, newContent);
    res.json(data);
  } else {
    res.status(400).json({ error: "nothing to update" });
  }
});

router.patch("/status", async (req, res) => {
  console.log("[INFO] Editing message from body", req.body);
  const { statuses } = req.body;
  if (!Array.isArray(statuses) || statuses.length === 0) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  statuses.forEach(status => {
    if (!status.messageId || !status.userId || !status.status) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }
  });
  const result = await markMessagesAsReadPrepared(statuses);
  res.json(result);
});

router.delete("/", async (req, res) => {
  console.log("[INFO] Deleting message from body", req.body);
  const data = await deleteMessage(req.body.messageId);
  res.json(data);
});

export default router;
