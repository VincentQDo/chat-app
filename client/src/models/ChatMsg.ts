export interface ChatMsg {
  messageId: string;   // Unique identifier for the message
  chatId: string;      // Identifier for the chat session
  userId: string;      // Identifier for the user who sent the message
  userName: string;    // Name of the user who sent the message
  message: string;     // The content of the message
  role: 'self' | 'other'; // Role of the user (e.g., 'self' if the message is from the current user, 'other' if from someone else)
  timestamp: number;   // Unix timestamp of when the message was sent
}
