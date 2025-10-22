import express from "express";
import {
  addParticipantToRoom,
  createRoom,
  deleteRoom,
  getRoomMetadata,
  getRoomsByUserId,
  updateRoomName,
} from "../db/database.js";

const router = express.Router();

/**
 * Create a new room
 */
router.post("/", async (req, res) => {
  const { name, userId } = req.body;
  try {
    const result = await createRoom(name, userId);
    res.json({ message: "Room created", result });
  } catch (error) {
    res.status(500).json({ error: "Failed to create room" });
  }
});

/**
 * Delete a room by ID
 */
router.delete("/:roomId", async (req, res) => {
  const { roomId } = req.params;
  try {
    const result = await deleteRoom(roomId);
    res.json({ message: "Room deleted", result });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete room" });
  }
});

/**
 * Update room name
 */
router.put("/room/:roomId", async (req, res) => {
  const { roomId } = req.params;
  const { newName } = req.body;
  try {
    const result = await updateRoomName(roomId, newName);
    res.json({ message: "Room updated", result });
  } catch (err) {
    res.status(500).json({ error: "Failed to update room" });
  }
});

/**
 * Get room metadata by ID
 */
router.get("/metadata/:roomId", async (req, res) => {
  const { roomId } = req.params;
  try {
    const metadata = await getRoomMetadata(roomId);
    res.json({ message: "Room metadata retrieved", metadata });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve room metadata" });
  }
});

/**
 * Get all rooms for a user
 */
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const rooms = await getRoomsByUserId(userId);
    res.json({ message: "Rooms retrieved", rooms });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve rooms" });
  }
});

/**
 * Add participant to a room
 */
router.put("/participant", async (req, res) => {
  const { roomId, userId } = req.body;
  try {
    const result = await addParticipantToRoom(roomId, userId);
    res.json({ message: "Room updated", result });
  } catch (err) {
    res.status(500).json({ error: "Failed to update room" });
  }
});

export default router;
