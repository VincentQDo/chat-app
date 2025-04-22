/**
 * @typedef {Object} Message
 * @property {number} [id] - Unique message id (autoincremented)
 * @property {string} userId
 * @property {string} message - message content
 * @property {number} createdAt - Timestamp (ms) when the message was created
 * @property {number} updatedAt - Timestamp (ms) when message was updated
 * @property {string} [status='pending'] - Status of message
 * @property {string} [chatId='global'] - Chat ID or group context
 */
