/** @typedef (import('../types/message.d.js').Message) Message*/

import sqlite from "sqlite3"
import path from "path"
import { fileURLToPath } from "url"

const __fileName = fileURLToPath(import.meta.url)
const __dirName = path.dirname(__fileName)

const dbPath = path.join(__dirName, 'data.db')

const db = new sqlite.Database(path.resolve(dbPath), (err) => {
	console.log('Trying to access the database at ', dbPath)
	if (err) console.error('DB connection error', err.message)
	else console.log('DB connection established')
})

db.serialize(() => {
	console.log('Configuring Database')
	db.run(`
		CREATE TABLE IF NOT EXISTS users (
			userId TEXT PRIMARY KEY,
			userName TEXT
		)
	`, (err) => {
		if (err) console.error('Failed to create users table', err.message)
	})
	db.run(`
		CREATE TABLE IF NOT EXISTS messages (
			messageid INTEGER PRIMARY KEY AUTOINCREMENT,
			userId TEXT,
			message TEXT,
			createdAt INTEGER,
			updatedAt INTEGER,
			status TEXT DEFAULT 'pending',
			chatId TEXT DEFAULT 'global',
			FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
		)
	`, (err) => {
		if (err) console.error('failed to create messages table', err.message)
	})
	db.run(`

		CREATE TABLE IF NOT EXISTS relationships (
			userid1 TEXT,
			userid2 TEXT,
			status TEXT DEFAULT 'pending',
			createdAt INTEGER,
			updatedAt INTEGER,
			PRIMARY KEY (userid1, userid2),
			FOREIGN KEY (userid1) REFERENCES users(userId) ON DELETE CASCADE,
			FOREIGN KEY (userid2) REFERENCES users(userId) ON DELETE CASCADE
		)
	`, (err) => {
		if (err) console.error('failed to create messages table', err.message)
	})
	db.run('CREATE INDEX IF NOT EXISTS idx_userId ON messages(userId)',
		(err) => {
			if (err) console.error('Failed to create index', err.message)
		})
})

/** 
 * @param {Message} content
 * @returns {Promise<number>} 1 if success 0 if fail
 * */
export function addMessage(content) {
	let { userId, message, status, chatId } = content

	if (!status) status = 'pending'
	if (!chatId) chatId = 'global'
	let [createdAt, updatedAt] = [Date.now(), Date.now()]
	const sql = `
			INSERT INTO messages(userId, message, status, chatId, createdAt, updatedAt)
	VALUES(?, ?, ?, ?, ?, ?)
		`
	console.info('Inserting message into data base', { userId, message, status, chatId, createdAt, updatedAt })
	return new Promise((resolve) => {
		db.run(sql, [userId, message, status, chatId, createdAt, updatedAt], (err) => {
			if (err) {
				console.error(err)
				resolve(0)
			} else {
				console.log('Message inserted')
				resolve(1)
			}
		})

	})
}

/**
 * @param {string} messageId
 * @returns {Promise<number>} 1 if success 0 if fail
 * */
export function deleteMessage(messageId) {
	const sql = `DELETE FROM messages WHERE messageid = ?`
	db.run(sql, [messageId], function(err) {
		if (err) console.error(err.message)
		else console.log(`Row deleted: ${this.changes}`)
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
			[limit ?? 100, offset ?? 0],
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
