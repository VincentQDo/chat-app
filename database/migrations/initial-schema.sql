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

-- Rooms table (simple)
CREATE TABLE IF NOT EXISTS rooms (
    roomId TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    createdBy TEXT,
    isPrivate BOOLEAN DEFAULT FALSE,
    isDeleted BOOLEAN DEFAULT FALSE,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    FOREIGN KEY (createdBy) REFERENCES users(userId) ON DELETE SET NULL
);

-- 2) Room members
CREATE TABLE IF NOT EXISTS room_members (
    roomId TEXT NOT NULL,
    userId TEXT NOT NULL,
    joinedAt INTEGER NOT NULL,
    role TEXT DEFAULT 'member',
    PRIMARY KEY (roomId, userId),
    FOREIGN KEY (roomId) REFERENCES rooms(roomId) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE TABLE messages (
    messageId TEXT PRIMARY KEY,
    roomId TEXT NOT NULL,
    userId TEXT NOT NULL,
    content TEXT NOT NULL,
    contentType TEXT NOT NULL DEFAULT 'text',
    createdAt INTEGER NOT NULL,
    editedAt INTEGER,
    isDeleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (roomId) REFERENCES rooms(roomId) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
    -- Additional constraints
    CHECK(length(content) > 0 AND length(content) <= 2000), -- Message length limits
    CHECK(contentType IN ('text', 'image', 'file', 'system')), -- Enum constraint
    CHECK(createdAt > 0),
    CHECK(editedAt IS NULL OR editedAt >= createdAt),
    CHECK(isDeleted IN (0, 1))
);

CREATE TABLE message_status (
    messageId TEXT NOT NULL,
    userId TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'sent',
    updatedAt INTEGER NOT NULL,
    PRIMARY KEY (messageId, userId),
    FOREIGN KEY (messageId) REFERENCES messages(messageId) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
    CHECK(updatedAt > 0),
    CHECK(status IN ('sent','delivered','read'))
);


-- Auto-update updatedAt for users
CREATE TRIGGER update_users_timestamp 
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    UPDATE users SET updatedAt = (strftime('%s','now') * 1000) WHERE userId = NEW.userId;
END;

-- Auto-update room timestamp when messages are added
-- When a message is added for a room, update the room's updatedAt timestamp
-- This way the updatedAt reflects activity in the room
CREATE TRIGGER IF NOT EXISTS update_room_timestamp_after_insert
AFTER INSERT ON messages
WHEN NEW.roomId IS NOT NULL
BEGIN
  UPDATE rooms SET updatedAt = NEW.createdAt WHERE roomId = NEW.roomId;
END;

-- Membership enforcement (abort insert if sender is not a member of the room)
-- Exempt the special 'global' room so system/global messages can be inserted without membership
CREATE TRIGGER IF NOT EXISTS enforce_room_membership_before_insert_message
BEFORE INSERT ON messages
WHEN NEW.roomId IS NOT NULL
  AND NEW.roomId != 'global'
  AND NOT EXISTS (
    SELECT 1 FROM room_members rm WHERE rm.roomId = NEW.roomId AND rm.userId = NEW.userId
  )
BEGIN
  SELECT RAISE(ABORT, 'Sender is not a member of the room');
END;

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_display_name ON users(displayName);
CREATE INDEX idx_messages_sender ON messages(userId);
CREATE INDEX idx_messages_deleted ON messages(isDeleted) WHERE isDeleted = TRUE;
CREATE INDEX idx_rooms_deleted ON rooms(isDeleted) WHERE isDeleted = FALSE;
CREATE INDEX idx_users_online ON users(isOnline) WHERE isOnline = TRUE;
CREATE INDEX idx_users_last_seen ON users(lastSeen);

-- Composite index for common query patterns
CREATE INDEX idx_messages_room_sender ON messages(roomId, userId);

-- Fast lookups of statuses per user (e.g., "show unread messages")
CREATE INDEX idx_message_status_userId ON message_status(userId);

-- Optional: for quickly fetching all statuses for a message
CREATE INDEX idx_message_status_messageId ON message_status(messageId);

-- Optional: if you query messages by room and creation time
CREATE INDEX idx_messages_roomId_createdAt ON messages(roomId, createdAt);