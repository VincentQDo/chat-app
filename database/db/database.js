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
    INSERT INTO messages(messageId, roomId, userId, content, contentType, createdAt, editedAt, isDeleted)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?)
  `;

  console.info("Inserting message into database", { messageId, roomId, userId, incomingMessage, contentType, createdAt, editedAt, isDeleted });

  return new Promise((resolve) => {
    db.run(sql, [messageId, roomId, userId, incomingMessage, contentType, createdAt, editedAt, isDeleted], function (err) {
      if (err) {
        console.error("DB insert error:", err.message);
        resolve(0);
      } else {
        console.log("Message inserted", messageId);
        // Insert initial status row for the sender into message_status table
        const updatedAt = Date.now();
        const statusSql = `INSERT INTO message_status(messageId, userId, status, updatedAt)
          VALUES(?, ?, ?, ?)
          ON CONFLICT(messageId, userId) DO UPDATE SET status = excluded.status, updatedAt = excluded.updatedAt`;

        db.run(statusSql, [messageId, userId, status, updatedAt], async (statusErr) => {
          if (statusErr) {
            console.error("DB insert status error:", statusErr.message);
            resolve(0);
          } else {
            console.log(`Initial message status set for messageId ${messageId}, userId ${userId}`);
            try {
              const combined = await getMessageWithStatuses(messageId);
              resolve(combined);
            } catch (e) {
              console.error(e);
              resolve(0);
            }
          }
        });
      }
    });
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
        return;
      }

      const msgs = rows || [];
      if (msgs.length === 0) {
        resolve([]);
        return;
      }

      // Batch fetch all statuses for the returned messages in one query
      const messageIds = msgs.map((r) => r.messageId);
      const placeholders = messageIds.map(() => "?").join(",");
      const statusSql = `SELECT messageId, userId, status, updatedAt FROM message_status WHERE messageId IN (${placeholders})`;

      db.all(statusSql, messageIds, (statusErr, statusRows) => {
        if (statusErr) {
          console.error("Failed to fetch message statuses:", statusErr);
          // Fallback: return raw message rows
          resolve(msgs);
          return;
        }

        // Group statuses by messageId
        const statusMap = new Map();
        for (const s of statusRows || []) {
          if (!statusMap.has(s.messageId)) statusMap.set(s.messageId, []);
          statusMap.get(s.messageId).push({ userId: s.userId, status: s.status, updatedAt: s.updatedAt });
        }

        // Combine
        const combined = msgs.map((m) => {
          const statuses = statusMap.get(m.messageId) || [];
          const senderStatusRow = statuses.find((s) => s.userId === m.userId);
          return { ...m, statuses, status: senderStatusRow ? senderStatusRow.status : null };
        });

        resolve(combined);
      });
    });
  });
}

/**
 * @param {string} messageId
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

/**
 * Fetch a message and its associated message_status rows.
 * Returns a combined object matching the canonical Message shape with an
 * additional `statuses` array and a `status` field representing the sender's status.
 * @param {string} messageId
 * @returns {Promise<any|null>}
 */
export async function getMessageWithStatuses(messageId) {
  const message = await getMessageById(messageId);
  if (!message) return null;

  return new Promise((resolve, reject) => {
    db.all(
      `SELECT userId, status, updatedAt FROM message_status WHERE messageId = ?`,
      [messageId],
      (err, rows) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          const statuses = (/** @type {{userId: string, status: string, updatedAt: number}[]} */ rows || []);
          // determine sender status (status for the original userId)
          const senderStatusRow = statuses.find((s) => s.userId === message.userId);
          const combined = { ...message, statuses, status: senderStatusRow ? senderStatusRow.status : null };
          resolve(combined);
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
 * Edit a message's content and update the editedAt timestamp.
 * @param {string} messageId
 * @param {string} newContent
 * @returns {Promise<number>} 1 if success, 0 if fail
 */
export function editMessage(messageId, newContent) {
  const editedAt = Date.now();
  // If newContent is provided, update content and editedAt; otherwise only update status
  if (typeof newContent === "string") {
    const sql = `UPDATE messages SET content = ?, editedAt = ? WHERE messageId = ?`;
    return new Promise((resolve) => {
      db.run(sql, [newContent, editedAt, messageId], function (err) {
        if (err) {
          console.error(err);
          resolve(0);
        } else {
          console.log(`Row(s) updated: ${this.changes}`);
          // return the updated message with statuses
          getMessageWithStatuses(messageId)
            .then((combined) => resolve(combined))
            .catch((e) => {
              console.error(e);
              resolve(0);
            });
        }
      });
    });
  }
}

/**
 * Insert or update the status of a message for a user.
 * @param {MessageStatus[]} statuses
 * @returns {Promise<number>} 1 if success, 0 if fail
 */
export function markMessagesAsReadPrepared(statuses) {
  const updatedAt = Date.now();
  
  if (statuses.length === 0) {
    return Promise.resolve(1);
  }

  return new Promise((resolve) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION", (err) => {
        if (err) {
          console.error("Failed to begin transaction:", err);
          resolve(0);
          return;
        }

        const stmt = db.prepare(`
          INSERT OR REPLACE INTO message_status (messageId, userId, status, updatedAt) 
          VALUES (?, ?, ?, ?)
        `);

        let completed = 0;
        let hasError = false;
        
        console.log("[INFO] Starting batch status update for", statuses.length, "entries");
        statuses.forEach((status) => {
          stmt.run([status.messageId, status.userId, status.status, updatedAt], (err) => {
            completed++;
            if (err) hasError = true;
            console.log("[INFO] Completed status update for", status.messageId, status.userId, status.status, err ? "ERROR:" + err : "");
            if (completed === statuses.length) {
              stmt.finalize();
              if (hasError) {
                db.run("ROLLBACK", () => resolve(0));
                console.log("[ERR] Transaction rolled back due to errors.");
              } else {
                db.run("COMMIT", () => resolve(1));
                console.log("[INFO] Transaction committed successfully.");
              }
            }
          });
        });
      });
    });
  });
}

// Export the MigrationManager for CLI usage
export { MigrationManager };
export default db;