/**
 * @typedef {Object} Message
 * @property {string} messageId - Unique identifier for the message
 * @property {string} roomId - Identifier of the room where the message was sent
 * @property {string} userId - Identifier of the user who sent the message
 * @property {string} content - The actual content of the message
 * @property {string} contentType - Type of content (e.g., 'text', 'image', 'file', 'system')
 * @property {number} createdAt - Timestamp when the message was created (in milliseconds since epoch)
 * @property {number|null} editedAt - Timestamp when the message was last edited (null if never edited)
 * @property {boolean} isDeleted - Flag indicating if the message has been deleted
 * @property {MessageStatus[]} statuses - Status of the message ('sent', 'delivered', 'read')
 */

/**
 * @typedef {Object} MessageStatus
 * @property {string} messageId - Unique identifier for the message
 * @property {string} userId - Identifier of the user associated with this status
 * @property {string} status - Status of the message for this user ('sent', 'delivered', 'read')
 * @property {number} updatedAt - Timestamp when the status was last updated (in milliseconds since epoch)
 */

/**
 * @typedef {Object} RoomParticipant
 * @property {string} roomId - Unique identifier for the room
 * @property {string} userId - Identifier of the user associated with this room
 * @property {number} joinedAt - Timestamp when the user joined the room (in milliseconds since epoch)
 */

/**
 * @typedef {Object} RoomMetadata
 * @property {string} roomId - Unique identifier for the room
 * @property {string} name - Name of the room
 * @property {string} createdBy - Identifier of the user who created the room
 * @property {boolean} isPrivate - Flag indicating if the room is private
 * @property {boolean} isDeleted - Flag indicating if the room has been deleted
 * @property {number} createdAt - Timestamp when the room was created (in milliseconds since epoch)
 * @property {number} updatedAt - Timestamp when the room was last updated (in milliseconds since epoch)
 */
