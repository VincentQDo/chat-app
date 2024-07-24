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
	FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS relationships (
	userid1 TEXT,
	userid2 TEXT,
	status TEXT DEFAULT 'pending',
	createdAt INTEGER,
	updatedAt INTEGER,
	PRIMARY KEY (userid1, userid2),
	FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
	FOREIGN KEY (friendId) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_userId ON messages(userId);
CREATE INDEX IF NOT EXISTS idx_timestamp ON messages(timestamp);
