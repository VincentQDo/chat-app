-- Users table (sync with Firebase Auth)
CREATE TABLE users (
    userId TEXT PRIMARY KEY, -- Firebase UID
    email TEXT UNIQUE NOT NULL,
    displayName TEXT NOT NULL,
    photoURL TEXT,
    isOnline BOOLEAN DEFAULT FALSE,
    lastSeen INTEGER,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
);

-- Direct message conversations
CREATE TABLE conversations (
    conversationId TEXT PRIMARY KEY,
    participant1Id TEXT NOT NULL,
    participant2Id TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    isDeleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (participant1Id) REFERENCES users(userId) ON DELETE CASCADE,
    FOREIGN KEY (participant2Id) REFERENCES users(userId) ON DELETE CASCADE,
    UNIQUE(participant1Id, participant2Id),
    CHECK(participant1Id < participant2Id) -- Ensures no duplicate conversations, eg. (A,B) and (B,A)
);

-- Messages (simplified for DMs)
CREATE TABLE messages (
    messageId TEXT PRIMARY KEY,
    conversationId TEXT NOT NULL,
    senderId TEXT NOT NULL,
    content TEXT NOT NULL,
    contentType TEXT DEFAULT 'text', -- e.g., 'text', 'image', 'file'
    createdAt INTEGER NOT NULL,
    editedAt INTEGER,
    isDeleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (conversationId) REFERENCES conversations(conversationId) ON DELETE CASCADE,
    FOREIGN KEY (senderId) REFERENCES users(userId) ON DELETE CASCADE
);

-- Read receipts
CREATE TABLE read_receipts (
    conversationId TEXT,
    userId TEXT,
    lastReadMessageId TEXT,
    readAt INTEGER NOT NULL,
    PRIMARY KEY (conversationId, userId),
    FOREIGN KEY (conversationId) REFERENCES conversations(conversationId) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
    FOREIGN KEY (lastReadMessageId) REFERENCES messages(messageId) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_messages_conversation_created ON messages(conversationId, createdAt);
CREATE INDEX idx_conversations_participant1 ON conversations(participant1Id);
CREATE INDEX idx_conversations_participant2 ON conversations(participant2Id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_display_name ON users(displayName);