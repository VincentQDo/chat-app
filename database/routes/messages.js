import express from "express";
import { addMessage, deleteMessage, getAllMessages } from "../db/database.js";

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("[INFO] Getting all messages");
  const data = await getAllMessages();
  res.json(data);
});

router.get("/messages", async (req, res) => {
  console.log("[INFO] Getting messages from ${index} to ${index2}");
  console.log("Path of request: ", req.path);
  console.log("Params of request: ", req.params);
  // const {index1, index2} = req.body
  // const data = await getMessages(index1, index2)
});

router.post("/", async (req, res) => {
  console.log("[INFO] Adding messaage from body", req.body);
  const data = await addMessage(req.body);
  res.json(data);
});

router.delete("/", async (req, res) => {
  console.log("[INFO] Deleting message from body", req.body);
  const data = await deleteMessage(req.body.messageId);
  res.json(data);
});

export default router;
