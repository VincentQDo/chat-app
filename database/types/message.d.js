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
 * @property {string} status - Status of the message ('sent', 'delivered', 'read')
 */