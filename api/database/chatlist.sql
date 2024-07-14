CREATE TABLE IF NOT EXISTS chats (
	sessionId INTEGER PRIMARY KEY AUTOINCREMENT,
	sessionName TEXT,
	personId TEXT,
	personName TEXT
);

INSERT INTO chats (sessionName, personId, personName)
VALUES ('Chat with Bob', 'bob1', 'Bob'),
('Chat with Alice', 'alice1', 'Alice');

