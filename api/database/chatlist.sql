CREATE TABLE IF NOT EXISTS chats (
	sessionId INTEGER PRIMARY KEY AUTOINCREMENT,
	createdAt INTEGER,
	updatedAt INTEGER,
	isGroupChat BOOLEAN
);

CREATE TABLE IF NOT EXISTS users (

	userId TEXT PRIMARY KEY,
	userName TEXT
);

CREATE TABLE IF NOT EXISTS user_chats (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	sessionId INTEGER,
	userId TEXT,
	FOREIGN KEY (sessionId) REFERENCES chats(sessionId) ON DELETE CASCADE,
	FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
	messageid INTEGER PRIMARY KEY AUTOINCREMENT,
	chatId INTEGER,
	userId TEXT,
	userName TEXT,
	message TEXT,
	role TEXT,
	timestamp INTEGER,
	status TEXT DEFAULT 'sent',
	FOREIGN KEY (chatId) REFERENCES chats(sessionId) ON DELETE CASCADE,
	FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS friends (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	userId TEXT,
	friendId TEXT,
	status TEXT,
	createdAt INTEGER,
	updatedAt INTEGER,
	FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
	FOREIGN KEY (friendId) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chatId ON messages(chatId);
CREATE INDEX IF NOT EXISTS idx_userId ON messages(userId);
CREATE INDEX IF NOT EXISTS idx_timestamp ON messages(timestamp);
