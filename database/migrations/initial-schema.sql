-- Users table (enhanced)
CREATE TABLE users (
    userId TEXT PRIMARY KEY, -- Firebase UID
    email TEXT UNIQUE NOT NULL,
    displayName TEXT NOT NULL,
    photoURL TEXT,
    isOnline BOOLEAN DEFAULT FALSE,
    lastSeen INTEGER,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    -- Additional constraints
    CHECK(length(displayName) > 0 AND length(displayName) <= 50),
    CHECK(email LIKE '%@%'), -- Basic email validation
    CHECK(createdAt > 0),
    CHECK(updatedAt >= createdAt),
    CHECK(lastSeen IS NULL OR lastSeen > 0)
);

-- Direct message conversations (enhanced)
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
    CHECK(participant1Id < participant2Id),
    CHECK(participant1Id != participant2Id), -- Prevent self-conversations
    CHECK(createdAt > 0),
    CHECK(updatedAt >= createdAt)
);

-- Messages (enhanced)
CREATE TABLE messages (
    messageId TEXT PRIMARY KEY,
    conversationId TEXT NOT NULL,
    senderId TEXT NOT NULL,
    content TEXT NOT NULL,
    contentType TEXT NOT NULL DEFAULT 'text',
    createdAt INTEGER NOT NULL,
    editedAt INTEGER,
    isDeleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (conversationId) REFERENCES conversations(conversationId) ON DELETE CASCADE,
    FOREIGN KEY (senderId) REFERENCES users(userId) ON DELETE CASCADE,
    -- Additional constraints
    CHECK(length(content) > 0 AND length(content) <= 2000), -- Message length limits
    CHECK(contentType IN ('text', 'image', 'file', 'system')), -- Enum constraint
    CHECK(createdAt > 0),
    CHECK(editedAt IS NULL OR editedAt >= createdAt),
    CHECK(senderId IN (
        SELECT participant1Id FROM conversations WHERE conversationId = messages.conversationId
        UNION
        SELECT participant2Id FROM conversations WHERE conversationId = messages.conversationId
    )) -- Ensure sender is participant in conversation
);

-- Read receipts (enhanced)
CREATE TABLE read_receipts (
    conversationId TEXT,
    userId TEXT,
    lastReadMessageId TEXT,
    readAt INTEGER NOT NULL,
    PRIMARY KEY (conversationId, userId),
    FOREIGN KEY (conversationId) REFERENCES conversations(conversationId) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
    FOREIGN KEY (lastReadMessageId) REFERENCES messages(messageId) ON DELETE SET NULL,
    -- Additional constraints
    CHECK(readAt > 0),
    CHECK(userId IN (
        SELECT participant1Id FROM conversations WHERE conversationId = read_receipts.conversationId
        UNION
        SELECT participant2Id FROM conversations WHERE conversationId = read_receipts.conversationId
    )) -- Ensure user is participant in conversation
);

-- Auto-update updatedAt for users
CREATE TRIGGER update_users_timestamp 
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    UPDATE users SET updatedAt = unixepoch() WHERE userId = NEW.userId;
END;

-- Auto-update conversation timestamp when messages are added
CREATE TRIGGER update_conversation_timestamp 
AFTER INSERT ON messages
FOR EACH ROW
BEGIN
    UPDATE conversations SET updatedAt = NEW.createdAt WHERE conversationId = NEW.conversationId;
END;

-- Indexes for performance
CREATE INDEX idx_messages_conversation_created ON messages(conversationId, createdAt);
CREATE INDEX idx_conversations_participant1 ON conversations(participant1Id);
CREATE INDEX idx_conversations_participant2 ON conversations(participant2Id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_display_name ON users(displayName);
CREATE INDEX idx_messages_sender ON messages(senderId);
CREATE INDEX idx_messages_deleted ON messages(isDeleted) WHERE isDeleted = TRUE;
CREATE INDEX idx_conversations_deleted ON conversations(isDeleted) WHERE isDeleted = FALSE;
CREATE INDEX idx_users_online ON users(isOnline) WHERE isOnline = TRUE;
CREATE INDEX idx_users_last_seen ON users(lastSeen);

-- Composite index for common query patterns
CREATE INDEX idx_messages_conversation_sender ON messages(conversationId, senderId);