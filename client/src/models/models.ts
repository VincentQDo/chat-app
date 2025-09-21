export interface Message {
  messageId?: string;
  userId: string;      // Identifier for the user who sent the message
  content: string;     // The content of the message
  contentType?: string;
  createdAt?: number;   // timestamps are made on server
  updatedAt?: number;
  status?: "pending" | "sent" | "delivered" | "read" | null;
  chatId?: string;
  roomId?: string;
}

export interface User {
  id: string;
  userName: string;
}

export interface Relationship {
  userId1: string;
  userId2: string;
  status?: "pending" | "friend" | "blocked";
  createdAt?: number;
  updatedAt?: number;
}

export interface WebsocketServerResponse {
  error: string | null;
  message: Message | null;
}
