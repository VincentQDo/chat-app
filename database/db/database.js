/** @typedef (import('../types/message.d.js').Message) Message*/

import fs from "fs";
import sqlite from "sqlite3";
import path from "path";
import { MigrationManager } from "./migration-manager.js";

const DATA_DIR = process.env.DB_DIR || path.resolve(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "data.db");
export const MESSAGE_STATUS = Object.freeze({
  SENT: "sent",
  DELIVERED: "delivered",
  READ: "read",
});

// Ensure data directory exists
fs.mkdirSync(DATA_DIR, { recursive: true });

// Create database connection
const db = new sqlite.Database(DB_FILE, (err) => {
  console.log("Trying to access the database at", DB_FILE);
  if (err) {
    console.error("❌ DB connection error:", err.message);
    process.exit(1);
  } else {
    console.log("✅ DB connection established");
  }
});

// Initialize database with migrations
async function initializeDatabase() {
  const migrationManager = new MigrationManager(db);

  try {
    await migrationManager.runMigrations();
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();

/**
 * @param {Message} content
 * @returns {Promise<number>} 1 if success 0 if fail
 * */
/**
 * Insert a message into the new messages schema.
 * Accepts payloads produced by the API (compatible fields: message, userId, chatId/roomId, contentType, createdAt)
 * @param {Object} payload
 * @returns {Promise<number>} 1 on success, 0 on failure
 */
export function addMessage(payload) {
  const incomingMessage = payload.message ?? payload.content ?? "";
  const userId = payload.userId || null;
  // allow either chatId (old) or roomId (new client)
  const roomId = payload.roomId || null;
  const contentType = payload.contentType || "text";
  const createdAt = Number(payload.createdAt) || Date.now();
  const editedAt = payload.editedAt ? Number(payload.editedAt) : null;
  const isDeleted = payload.isDeleted ? 1 : 0;
  const status = payload.status || MESSAGE_STATUS.SENT; // sent | delivered | read

  if (!userId) {
    console.error("Missing userId when inserting message");
    return Promise.resolve(0);
  }

  // generate a simple unique id if not provided
  const messageId = payload.messageId || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const sql = `
    INSERT INTO messages(messageId, roomId, userId, content, contentType, createdAt, editedAt, isDeleted, status)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  console.info("Inserting message into database", { messageId, userId, roomId, createdAt });

  return new Promise((resolve) => {
    db.run(
      sql,
      [messageId, roomId, userId, incomingMessage, contentType, createdAt, editedAt, isDeleted, status],
      (err) => {
        if (err) {
          console.error("DB insert error:", err.message);
          resolve(0);
        } else {
          console.log("Message inserted", messageId);
          resolve(1);
        }
      },
    );
  });
}

/**
 * @param {string|number} messageId
 * @returns {Promise<number>} 1 if success 0 if fail
 * */
export function deleteMessage(messageId) {
  const sql = `DELETE FROM messages WHERE messageId = ?`;
  return new Promise((resolve, reject) => {
    db.run(sql, [messageId], function (err) {
      if (err) {
        console.error(err.message);
        reject(0);
      } else {
        console.log(`Row deleted: ${this.changes}`);
        resolve(1);
      }
    });
  });
}

/**
 * @param {any} [limit] Default to 100 if not provided
 * @param {any} [offset] Default to 0 if not provided
 * @returns {Promise<Message[]>} Promise of messages object array
 * */
export function getAllMessages(limit = 100, offset = 0, roomId = null) {
  let lim = Number.isSafeInteger(limit) ? Number(limit) : 100;
  lim = Math.min(lim, 200);
  const off = Number.isSafeInteger(offset) ? offset : 0;

  console.log(
    "Fetching messages with the following limit and offset:",
    lim,
    off,
  );

  return new Promise((resolve, reject) => {
    const params = [];
    let sql = "SELECT * FROM messages";
    if (roomId) {
      sql += " WHERE roomId = ?";
      params.push(roomId);
    }
    sql += " ORDER BY createdAt DESC LIMIT ? OFFSET ?";
    params.push(lim, off);

    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * @param {number} [messageId]
 * @returns {Promise<Message|null>}
 */
export function getMessageById(messageId) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM messages WHERE messageId = ?", [messageId], (err, row) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve(row ?? null);
      }
    });
  });
}

/** LIKE escape to avoid treating % and _ as wildcards unintentionally */
/**
 * @param {string} s
 * @returns {string}
 */
function escapeLike(s) {
  return s.replace(/[%_]/g, (m) => "\\" + m);
}

/**
 * Case-insensitive contains search on message text.
 * @param {string} q query string
 * @param {number} [limit] Row limit
 * @param {number} [offset] Row offset
 * @returns {Promise<Message[]>}
 */
export function searchMessages(q, limit, offset) {
  let lim = Number.isSafeInteger(limit) ? limit : 1;
  lim = Math.min(lim, 200);
  const off = Number.isSafeInteger(offset) ? offset : 0;
  const like = "%" + escapeLike(q) + "%";

  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM messages
       WHERE content LIKE ? ESCAPE '\\'
       COLLATE NOCASE
       ORDER BY createdAt DESC
       LIMIT ? OFFSET ?`,
      [like, lim, off],
      (err, rows) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(rows);
        }
      },
    );
  });
}

/**
 * Create a room (simple helper)
 * @param {string} roomId
 * @param {string} name
 * @param {string} createdBy
 */
export function addRoom(roomId, name, createdBy) {
  const createdAt = Date.now();
  const updatedAt = createdAt;
  const sql = `INSERT INTO rooms(roomId, name, createdBy, createdAt, updatedAt) VALUES(?, ?, ?, ?, ?)`;
  return new Promise((resolve) => {
    db.run(sql, [roomId, name, createdBy, createdAt, updatedAt], (err) => {
      if (err) {
        console.error(err);
        resolve(0);
      } else {
        resolve(1);
      }
    });
  });
}

export function addRoomMember(roomId, userId) {
  const joinedAt = Date.now();
  const sql = `INSERT OR IGNORE INTO room_members(roomId, userId, joinedAt) VALUES(?, ?, ?)`;
  return new Promise((resolve) => {
    db.run(sql, [roomId, userId, joinedAt], (err) => {
      if (err) {
        console.error(err);
        resolve(0);
      } else {
        resolve(1);
      }
    });
  });
}

/**
 * Edit a message's content and update the editedAt timestamp.
 * @param {string} messageId
 * @param {string} newContent
 * @returns {Promise<number>} 1 if success, 0 if fail
 */
export function editMessage(messageId, newContent, status = MESSAGE_STATUS.SENT) {
  const editedAt = Date.now();
  const sql = `UPDATE messages SET content = ?, editedAt = ?, status = ? WHERE messageId = ?`;
  return new Promise((resolve) => {
    db.run(sql, [newContent, editedAt, status, messageId], function (err) {
      if (err) {
        console.error(err);
        resolve(0);
      } else {
        console.log(`Row(s) updated: ${this.changes}`);
        resolve(1);
      }
    });
  });
}

// Export the MigrationManager for CLI usage
export { MigrationManager };
export default db;