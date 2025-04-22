/** @typedef (import('../types/message.d.js').Message) Message*/

import sqlite from "sqlite3"
import path from "path"
import { fileURLToPath } from "url"

const __fileName = fileURLToPath(import.meta.url)
const __dirName = path.dirname(__fileName)

const db = new sqlite.Database(path.resolve(__dirName, '../data.db'), (err) => {
	if (err) console.error('DB connection error', err.message)
	else console.log('DB connection established')
})

db.serialize(() => {
	console.log('Configuring Database')
	db.run(`
		CREATE TABLE IF NOT EXISTS users (
			userId TEXT PRIMARY KEY,
			userName TEXT
		);

		CREATE TABLE IF NOT EXISTS messages (
			messageid INTEGER PRIMARY KEY AUTOINCREMENT,
			userId TEXT,
			message TEXT,
			createdAt INTEGER,
			updatedAt INTEGER,
			status TEXT DEFAULT 'pending',
			chatId TEXT DEFAULT 'global',
			FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS relationships (
			userid1 TEXT,
			userid2 TEXT,
			status TEXT DEFAULT 'pending',
			createdAt INTEGER,
			updatedAt INTEGER,
			PRIMARY KEY (userid1, userid2),
			FOREIGN KEY (userid1) REFERENCES users(userId) ON DELETE CASCADE,
			FOREIGN KEY (userid2) REFERENCES users(userId) ON DELETE CASCADE
		);

		CREATE INDEX IF NOT EXISTS idx_userId ON messages(userId);
	`)
})

/** 
 * @param {Message} content
 * @returns {Promise<number>} 1 if success 0 if fail
 * */
export function addMessage(content) {
	const { userId, message, status, chatId, createdAt, updatedAt } = content
	const sql = `
			INSERT INTO messages (userId, message, status, chatId, createdAt, updatedAt)
			VALUES (?, ?, ?, ?, ?, ?)
		`
	return new Promise((resolve) => {
		db.run(sql, [userId, message, status, chatId, createdAt, updatedAt], (err) => {
			if (err) {
				console.error(err)
				resolve(0)
			} else {
				resolve(1)
			}
		})

	})
}

/** 
 * @param {number} [limit] 
 * @param {number} [offset]
 * @returns {Promise<Message[]>}
 * */
export function getAllMessages(limit, offset) {
	return new Promise((resolve, reject) => {
		db.all('SELECT * FROM messages ORDER BY createdAt DESC LIMIT ? OFFSET ?',
			[limit, offset],
			(err, rows) => {
				if (err) {
					console.error(err)
					reject(err)
				} else {
					resolve(rows)
				}
			}
		)
	})
}

export default db
