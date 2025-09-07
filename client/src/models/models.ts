export interface Message {
  userId: string;      // Identifier for the user who sent the message
  message: string;     // The content of the message
  createdAt?: number;   // timestamps are made on serverr
  updatedAt?: number;
  status?: "pending" | "sent" | "read" | null;
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
