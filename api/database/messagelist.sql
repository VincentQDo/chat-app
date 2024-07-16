CREATE TABLE IF NOT EXISTS messages (
	messageid INTEGER PRIMARY KEY AUTOINCREMENT,
	chatId INTEGER,
	userId TEXT,
	userName TEXT,
	message TEXT,
	role TEXT,
	timestamp INTEGER,
	FOREIGN KEY (chatId) REFERENCES chats(sessionId)
);
