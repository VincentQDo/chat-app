/** @typedef (import('../types/message.d.js').Message) Message*/

import fs from "fs";
import sqlite from "sqlite3";
import path from "path";
import { MigrationManager } from "./migration-manager";

const DATA_DIR = process.env.DB_DIR || path.resolve(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "data.db");

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
export function addMessage(content) {
  let { userId, message, status, chatId } = content;

  if (!status) status = "pending";
  if (!chatId) chatId = "global";
  let [createdAt, updatedAt] = [Date.now(), Date.now()];

  const sql = `
    INSERT INTO messages(userId, message, status, chatId, createdAt, updatedAt)
    VALUES(?, ?, ?, ?, ?, ?)
  `;

  console.info("Inserting message into database", {
    userId,
    message,
    status,
    chatId,
    createdAt,
    updatedAt,
  });

  return new Promise((resolve) => {
    db.run(
      sql,
      [userId, message, status, chatId, createdAt, updatedAt],
      (err) => {
        if (err) {
          console.error(err);
          resolve(0);
        } else {
          console.log("Message inserted");
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
  const sql = `DELETE FROM messages WHERE messageid = ?`;
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
export function getAllMessages(limit, offset) {
  let lim = Number.isSafeInteger(limit) ? Number(limit) : 100;
  lim = Math.min(lim, 200);
  const off = Number.isSafeInteger(offset) ? offset : 0;

  console.log(
    "Fetching messages with the following limit and offset:",
    lim,
    off,
  );

  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM messages ORDER BY createdAt DESC LIMIT ? OFFSET ?",
      [lim, off],
      (err, rows) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log("Fetch result:", rows);
          resolve(rows);
        }
      },
    );
  });
}

/**
 * @param {number} [messageId]
 * @returns {Promise<Message|null>}
 */
export function getMessageById(messageId) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM messages WHERE messageid = ?",
      [messageId],
      (err, row) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(row ?? null);
        }
      },
    );
  });
}

/**
 * Cursor pagination: rows with messageid > startId
 * @param {string|number} startId
 * @param {number} [limit]
 * @returns {Promise<Message[]>}
 */
export function getMessagesAfterId(startId, limit) {
  const start = Number(startId) || 0;
  let lim = Number.isSafeInteger(limit) ? limit : 1;
  lim = Math.min(lim, 200);

  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM messages WHERE messageid > ? ORDER BY messageid ASC LIMIT ?",
      [start, lim],
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
       WHERE message LIKE ? ESCAPE '\\'
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

// Export the MigrationManager for CLI usage
export { MigrationManager };
export default db;